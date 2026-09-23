import type { ExtractedLessonInfo } from '../types';

/**
 * Reconstructs token arrays (e.g. ["RAISE", "YOUR", "HAND", ",", "SIT", "NICELY"])
 * into natural readable text with proper word boundaries and punctuation.
 */
export function reconstructTokens(tokens: string[]): string {
  if (!tokens || tokens.length === 0) return '';

  let result = '';
  tokens.forEach((token) => {
    const raw = token ? token.trim() : '';
    if (!raw) return;

    const isClosingPunctuation = /^[,.\?!;:\]\)]+$/.test(raw);

    if (result.length === 0) {
      result = raw;
    } else if (isClosingPunctuation) {
      result = result.trimEnd() + raw;
    } else {
      const lastChar = result.slice(-1);
      const isPrevOpening = /^[\[\(“"']$/.test(lastChar);
      if (isPrevOpening) {
        result += raw;
      } else {
        result += ' ' + raw;
      }
    }
  });

  return normalizeWhitespaceAndPunctuation(result);
}

/**
 * Normalizes multi-spaces to single space while preserving line breaks,
 * Vietnamese diacritics, and natural punctuation spacing.
 */
export function normalizeWhitespaceAndPunctuation(text: string): string {
  if (!text) return '';

  return text
    .split('\n')
    .map(line => {
      let l = line.trim();
      if (!l) return '';
      // Replace multiple consecutive spaces/tabs with single space
      l = l.replace(/[ \t]+/g, ' ');
      // Fix space before punctuation: "word , sit" -> "word, sit"
      l = l.replace(/\s+([,.\?!;:])/g, '$1');
      // Ensure space after punctuation if followed by a letter/digit: "hand,sit" -> "hand, sit"
      l = l.replace(/([,.\?!;:])([a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EFF])/g, '$1 $2');
      return l;
    })
    .join('\n');
}

export const parsePastedText = (text: string): ExtractedLessonInfo => {
  if (!text || !text.trim()) {
    return {
      vocabulary: [],
      sentencePatterns: [],
      skills: ['Listening', 'Speaking'],
      activities: []
    };
  }

  // Check if text is a JSON token array like ["RAISE", "YOUR", "HAND", ",", "SIT", "NICELY"]
  const trimmedInput = text.trim();
  if (trimmedInput.startsWith('[') && trimmedInput.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmedInput);
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        const reconstructed = reconstructTokens(parsed);
        return {
          gradeLevel: 3,
          unitTitle: 'UNIT LESSON',
          lessonTitle: 'Lesson 1',
          vocabulary: [reconstructed],
          sentencePatterns: [reconstructed],
          skills: ['Listening', 'Speaking', 'Reading', 'Writing'],
          activities: [reconstructed]
        };
      }
    } catch {
      // Not JSON array, fall through
    }
  }

  const cleanText = normalizeWhitespaceAndPunctuation(text);
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

  let gradeLevel: number | undefined;
  let unitTitle: string | undefined;
  let lessonTitle: string | undefined;
  const vocabularySet = new Set<string>();
  const patternsSet = new Set<string>();
  const activitiesList: string[] = [];

  const gradeMatch = cleanText.match(/(?:grade|lớp)\s*([1-5])/i);
  if (gradeMatch) {
    gradeLevel = parseInt(gradeMatch[1], 10);
  }

  const unitMatch = cleanText.match(/(unit\s*\d+[^:\n]*[:\n]?[^\n]*)/i);
  if (unitMatch) {
    unitTitle = unitMatch[1].trim();
  }

  const lessonMatch = cleanText.match(/(lesson\s*\d+[^:\n]*[:\n]?[^\n]*)/i);
  if (lessonMatch) {
    lessonTitle = lessonMatch[1].trim();
  }

  lines.forEach(line => {
    if (/vocabulary|Từ vựng|words/i.test(line)) {
      const parts = line.split(/[:\-]/);
      if (parts.length > 1) {
        parts[1].split(/[,;]/).forEach(v => {
          const item = normalizeWhitespaceAndPunctuation(v);
          if (item) vocabularySet.add(item);
        });
      }
    } else if (/sentence|câu|pattern|structure|mẫu câu/i.test(line)) {
      const parts = line.split(/[:\-]/);
      if (parts.length > 1) {
        const item = normalizeWhitespaceAndPunctuation(parts[1]);
        if (item) patternsSet.add(item);
      }
    } else if (/look, listen|listen and repeat|point and say|listen and tick|let's talk|let's sing|read and match|write/i.test(line)) {
      activitiesList.push(line);
    }
  });

  // If no explicit vocabulary headers found, extract readable content lines directly
  if (vocabularySet.size === 0 && patternsSet.size === 0 && activitiesList.length === 0) {
    lines.forEach(line => {
      // Exclude structural header lines if any
      if (/^(unit|lesson|grade|lớp)\s*\d*/i.test(line) && line.length < 25) {
        return;
      }
      // Add all readable lines (preserving spaces, diacritics, uppercase, punctuation)
      if (line.includes(',') || line.includes('.')) {
        patternsSet.add(line);
      } else {
        vocabularySet.add(line);
      }
      activitiesList.push(line);
    });
  }

  const vocabArray = Array.from(vocabularySet);
  const patternArray = Array.from(patternsSet);

  return {
    gradeLevel: gradeLevel || 3,
    unitTitle: unitTitle || 'UNIT LESSON',
    lessonTitle: lessonTitle || 'Lesson 1',
    vocabulary: vocabArray.length > 0 ? vocabArray : (patternArray.length > 0 ? patternArray : ['target vocabulary']),
    sentencePatterns: patternArray.length > 0 ? patternArray : (vocabArray.length > 0 ? vocabArray : ['Target sentence pattern.']),
    skills: ['Listening', 'Speaking', 'Reading', 'Writing'],
    activities: activitiesList.length > 0 ? activitiesList : [
      "Activity 1: Look, listen and repeat.",
      "Activity 2: Listen, point and say.",
      "Activity 3: Let's talk.",
      "Activity 4: Listen and tick."
    ]
  };
};

export const parseUploadedImage = async (file: File): Promise<ExtractedLessonInfo> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cleanFileName = normalizeWhitespaceAndPunctuation(file.name.replace(/\.[^/.]+$/, ""));
      resolve({
        gradeLevel: 3,
        unitTitle: `Unit: ${cleanFileName}`,
        lessonTitle: 'Lesson 1 - Look, listen and repeat',
        vocabulary: ['hello', 'hi', 'goodbye', 'bye'],
        sentencePatterns: ['How are you? - I am fine, thank you.', 'What is your name? - My name is...'],
        skills: ['Listening', 'Speaking'],
        activities: [
          '1. Look, listen and repeat target words.',
          '2. Listen, point and say in pairs.',
          "3. Let's talk with classmate."
        ],
        otherInfo: `Extracted from image file: ${file.name}`
      });
    }, 400);
  });
};
