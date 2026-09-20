import type { ExtractedLessonInfo } from '../types';

export const parsePastedText = (text: string): ExtractedLessonInfo => {
  if (!text || !text.trim()) {
    return {
      vocabulary: [],
      sentencePatterns: [],
      skills: ['Listening', 'Speaking'],
      activities: []
    };
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let gradeLevel: number | undefined;
  let unitTitle: string | undefined;
  let lessonTitle: string | undefined;
  const vocabularySet = new Set<string>();
  const patternsSet = new Set<string>();
  const activitiesList: string[] = [];

  const gradeMatch = text.match(/(?:grade|lớp)\s*([1-5])/i);
  if (gradeMatch) {
    gradeLevel = parseInt(gradeMatch[1], 10);
  }

  const unitMatch = text.match(/(unit\s*\d+[^:\n]*[:\n]?[^\n]*)/i);
  if (unitMatch) {
    unitTitle = unitMatch[1].trim();
  }

  const lessonMatch = text.match(/(lesson\s*\d+[^:\n]*[:\n]?[^\n]*)/i);
  if (lessonMatch) {
    lessonTitle = lessonMatch[1].trim();
  }

  lines.forEach(line => {
    if (/vocabulary|Từ vựng|words/i.test(line)) {
      const parts = line.split(/[:\-]/);
      if (parts.length > 1) {
        parts[1].split(/[,;]/).forEach(v => {
          if (v.trim()) vocabularySet.add(v.trim());
        });
      }
    } else if (/sentence|câu|pattern|structure|mẫu câu/i.test(line)) {
      const parts = line.split(/[:\-]/);
      if (parts.length > 1) {
        patternsSet.add(parts[1].trim());
      }
    } else if (/look, listen|listen and repeat|point and say|listen and tick|let's talk|let's sing|read and match|write/i.test(line)) {
      activitiesList.push(line);
    }
  });

  if (vocabularySet.size === 0) {
    lines.forEach(line => {
      if (/^[a-zA-Z\s,]{2,30}$/.test(line) && !/unit|lesson|grade/i.test(line)) {
        vocabularySet.add(line);
      }
    });
  }

  return {
    gradeLevel: gradeLevel || 3,
    unitTitle: unitTitle || 'UNIT LESSON',
    lessonTitle: lessonTitle || 'Lesson 1',
    vocabulary: Array.from(vocabularySet),
    sentencePatterns: Array.from(patternsSet),
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
      resolve({
        gradeLevel: 3,
        unitTitle: `Unit: ${file.name.replace(/\.[^/.]+$/, "")}`,
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
    }, 800);
  });
};
