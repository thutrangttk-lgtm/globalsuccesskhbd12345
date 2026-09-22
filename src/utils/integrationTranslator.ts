import type { LessonPlan, IntegrationItem } from '../types';

/**
 * Utility for translating Vietnamese integration statements into natural, accurate,
 * professional English appropriate for primary school lesson plans.
 */

export function isVietnameseText(text: string): boolean {
  if (!text) return false;
  // Check for Vietnamese diacritics
  if (/[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(text)) {
    return true;
  }
  // Check for common Vietnamese educational keywords
  const vnKeywords = /\b(giáo dục|học sinh|bảo vệ|môi trường|gia đình|bố mẹ|cha mẹ|rèn luyện|ý thức|tiết kiệm|giao thông|vệ sinh|bạn bè|thầy cô|kỷ luật|đoàn kết|không|giúp đỡ|tôn trọng|yêu quý|thói quen|trường lớp|nước|điện|bản thân|an toàn|phù hợp|kỹ năng|thái độ|hành vi|chủ đề|lịch sự|trách nhiệm|người khác|giữ gìn|đồ dùng|tình huống|bài)\b/i;
  return vnKeywords.test(text);
}

/**
 * Cleans formatting errors, duplicate colons, and awkward phrasing in English lesson plan strings.
 */
export function cleanEnglishFormatting(text: string): string {
  if (!text) return '';
  let cleaned = text
    .replace(/:\s*:/g, ':')
    .replace(/task:\s*:/gi, 'task:')
    .replace(/activity:\s*:/gi, 'activity:')
    .replace(/integration task:\s*:/gi, 'integration activity:')
    .replace(/Encourage pupils to Raise pupils' awareness of/gi, "Raise pupils' awareness of")
    .replace(/Encourage pupils to Encourage pupils to/gi, "Encourage pupils to")
    .replace(/\s+,/g, ',')
    .replace(/\s+\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();

  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }
  return cleaned;
}

/**
 * Translates Vietnamese integration input into professional English primary school lesson plan language.
 * Avoids mechanical word-for-word translation, uses appropriate educational terminology,
 * and fixes duplicated colons and awkward phrasing.
 */
export function translateVietnameseIntegrationToEnglish(
  input: string,
  _context?: { vocabulary?: string[]; mainPattern?: string }
): string {
  if (!input || !input.trim()) return '';

  let text = input.trim();

  // Clean initial colons, repetitive dashes, or awkward prefixes
  text = text.replace(/^[:\s\-]+/, '').trim();

  // If text is already pure English, format capitalization, fix duplicate colons, and return
  if (!isVietnameseText(text)) {
    return cleanEnglishFormatting(text);
  }

  // Extract quoted topics like "In the backyard" if present
  const topicMatch = text.match(/chủ đề\s*["“']([^"”']+)["”']/i) || text.match(/["“']([^"”']+)["”']/);
  const topicStr = topicMatch ? topicMatch[1] : '';

  // 1. Direct Pattern & Phrase Translations (High priority exact/near matches)
  const exactMappings: [RegExp, string | ((...args: any[]) => string)][] = [
    [
      /giáo dục thái độ,?\s*hành vi phù hợp với chủ đề\s*["“']([^"”']+)["”']\s*:\s*lịch sự,\s*có trách nhiệm,\s*tôn trọng người khác và giữ gìn đồ dùng\/môi trường liên quan đến tình huống của bài/i,
      (_m: string, topic: string) => `Encourage pupils to behave politely and responsibly, respect others, and take care of belongings and the environment in situations related to the lesson topic "${topic}".`
    ],
    [
      /giáo dục thái độ,?\s*hành vi phù hợp với chủ đề\s*["“']([^"”']+)["”']\s*:\s*(.*)/i,
      (_m: string, topic: string, details: string) => {
        const translatedDetails = translateVietnameseIntegrationToEnglish(details);
        const cleanDetails = translatedDetails.replace(/^Encourage pupils to\s*/i, '').replace(/[\.]*$/, '');
        return `Encourage pupils to demonstrate positive behavior, ${cleanDetails} in situations related to the lesson topic "${topic}".`;
      }
    ],
    [/giáo dục học sinh biết yêu quý gia đình và giúp đỡ bố mẹ/i, 'Encourage pupils to appreciate their family and help their parents.'],
    [/yêu quý gia đình và giúp đỡ bố mẹ/i, 'Encourage pupils to appreciate their family and help their parents.'],
    [/giáo dục ý thức bảo vệ môi trường,?\s*không xả rác/i, "Raise pupils' awareness of environmental protection and encourage them not to litter."],
    [/bảo vệ môi trường,?\s*không xả rác/i, "Raise pupils' awareness of environmental protection and encourage them not to litter."],
    [/giữ gìn vệ sinh trường lớp/i, "Raise pupils' awareness of keeping their school and classroom clean."],
    [/giữ gìn vệ sinh lớp học/i, "Raise pupils' awareness of keeping their classroom clean and tidy."],
    [/chấp hành tốt luật giao thông/i, "Encourage pupils to observe traffic safety rules and practice safe commuting habits."],
    [/an toàn giao thông/i, "Raise pupils' awareness of traffic safety rules."],
    [/tiết kiệm điện và nước/i, "Raise pupils' awareness of saving electricity and clean water."],
    [/tiết kiệm nước/i, "Raise pupils' awareness of saving clean water."],
    [/tôn trọng thầy cô và bạn bè/i, "Encourage pupils to show respect for teachers and classmates."],
    [/tôn trọng bạn bè/i, "Encourage pupils to show respect for their classmates."],
    [/bảo vệ thông tin cá nhân/i, "Guide pupils to protect personal information in digital learning environments."],
    [/rèn luyện tính tự lập/i, "Encourage pupils to develop self-discipline and independence."]
  ];

  for (const [pattern, replacement] of exactMappings) {
    if (pattern.test(text)) {
      if (typeof replacement === 'function') {
        const match = text.match(pattern);
        if (match) return replacement(...match);
      } else {
        return replacement;
      }
    }
  }

  // 2. Rule-based Decomposition for Arbitrary Vietnamese Educational Sentences
  let result = text;

  // Determine prefix verb phrase
  let prefix = '';
  if (/^(?:giáo dục|bồi dưỡng)\s+thái\s+độ,?\s*hành\s+vi\b/i.test(result)) {
    prefix = "Encourage pupils to demonstrate positive behavior, ";
    result = result.replace(/^(?:giáo dục|bồi dưỡng)\s+thái\s+độ,?\s*hành\s+vi\s*(?:phù\s+hợp\s+với)?\s*/i, '');
  } else if (/^(?:giáo dục|bồi dưỡng)\s+học\s+sinh\s+ý\s+thức\b/i.test(result)) {
    prefix = "Raise pupils' awareness of ";
    result = result.replace(/^(?:giáo dục|bồi dưỡng)\s+học\s+sinh\s+ý\s+thức\s*(?:về|với)?\s*/i, '');
  } else if (/^(?:giáo dục|bồi dưỡng)\s+ý\s+thức\b/i.test(result)) {
    prefix = "Raise pupils' awareness of ";
    result = result.replace(/^(?:giáo dục|bồi dưỡng)\s+ý\s+thức\s*(?:về|với)?\s*/i, '');
  } else if (/^(?:giáo dục|bồi dưỡng|nhắc nhở)\s+học\s+sinh\b/i.test(result)) {
    prefix = "Encourage pupils to ";
    result = result.replace(/^(?:giáo dục|bồi dưỡng|nhắc nhở)\s+học\s+sinh\s*(?:biết|có)?\s*/i, '');
  } else if (/^(?:rèn luyện|tạo)\s+(?:cho\s+học\s+sinh\s+)?thói\s+quen\b/i.test(result)) {
    prefix = "Encourage pupils to develop habits of ";
    result = result.replace(/^(?:rèn luyện|tạo)\s+(?:cho\s+học\s+sinh\s+)?thói\s+quen\s*/i, '');
  } else if (/^(?:rèn luyện|bồi dưỡng)\s+cho\s+học\s+sinh\b/i.test(result)) {
    prefix = "Encourage pupils to develop ";
    result = result.replace(/^(?:rèn luyện|bồi dưỡng)\s+cho\s+học\s+sinh\s*/i, '');
  } else if (/^(?:hướng dẫn|giúp)\s+học\s+sinh\b/i.test(result)) {
    prefix = "Guide pupils to ";
    result = result.replace(/^(?:hướng dẫn|giúp)\s+học\s+sinh\s*/i, '');
  } else if (/^ý\s+thức\b/i.test(result)) {
    prefix = "Raise pupils' awareness of ";
    result = result.replace(/^ý\s+thức\s*(?:về)?\s*/i, '');
  } else {
    prefix = "Encourage pupils to ";
  }

  // Dictionary of verb and phrase translations
  const phraseDictionary: [RegExp, string][] = [
    [/\blịch sự,\s*có trách nhiệm\b/gi, 'behave politely and responsibly'],
    [/\blịch sự\b/gi, 'behave politely'],
    [/\bcó trách nhiệm\b/gi, 'responsibly'],
    [/\btôn trọng người khác\b/gi, 'respect others'],
    [/\bgiữ gìn đồ dùng\/môi trường\b/gi, 'take care of belongings and the environment'],
    [/\bgiữ gìn đồ dùng\b/gi, 'take care of belongings'],
    [/\bliên quan đến tình huống của bài\b/gi, 'in situations related to the lesson topic'],
    [/\bliên quan đến tình huống\b/gi, 'in lesson-related situations'],
    [/\byêu quý\b|\byêu thương\b/gi, 'appreciate'],
    [/\bgia đình\b/gi, 'their family'],
    [/\bgiúp đỡ bố mẹ\b|\bgiúp đỡ cha mẹ\b/gi, 'help their parents'],
    [/\bbảo vệ môi trường\b/gi, 'environmental protection'],
    [/\bkhông xả rác bừa bãi\b|\bkhông xả rác\b/gi, 'and encourage them not to litter'],
    [/\bgiữ gìn vệ sinh trường lớp\b/gi, 'keep their school and classroom clean'],
    [/\bgiữ gìn vệ sinh lớp học\b/gi, 'keep their classroom clean and tidy'],
    [/\bgiữ gìn vệ sinh\b/gi, 'keep surroundings clean'],
    [/\bchấp hành tốt\b|\bchấp hành\b/gi, 'observe'],
    [/\bluật giao thông\b|\ban toàn giao thông\b/gi, 'traffic safety rules'],
    [/\btiết kiệm nước\b/gi, 'save clean water'],
    [/\btiết kiệm điện\b/gi, 'save electricity'],
    [/\btôn trọng thầy cô và bạn bè\b/gi, 'show respect for teachers and classmates'],
    [/\btôn trọng bạn bè\b/gi, 'show respect for classmates'],
    [/\btôn trọng\b/gi, 'show respect for'],
    [/\bđoàn kết\b/gi, 'foster solidarity'],
    [/\bkỷ luật\b/gi, 'maintain discipline'],
    [/\btrung thực\b/gi, 'practice honesty'],
    [/\btự giác\b/gi, 'develop self-discipline'],
    [/\bhọc tập\b/gi, 'in their learning activities'],
    [/\bvà\b/gi, 'and'],
    [/\bkhông\b/gi, 'not']
  ];

  let translatedBody = result;
  for (const [pattern, repl] of phraseDictionary) {
    translatedBody = translatedBody.replace(pattern, repl);
  }

  // Clean diacritics & spaces
  translatedBody = translatedBody
    .replace(/[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If topic extracted and not present in body, attach cleanly
  if (topicStr && !translatedBody.toLowerCase().includes(topicStr.toLowerCase())) {
    translatedBody += ` in situations related to the lesson topic "${topicStr}"`;
  }

  // Handle unclear or short input
  if (!translatedBody || translatedBody.length < 3) {
    return "Encourage pupils to apply positive educational values in classroom activities.";
  }

  let finalOutput = prefix + translatedBody;

  // Final cleanup and formatting
  finalOutput = cleanEnglishFormatting(finalOutput);

  return finalOutput;
}

/**
 * Deduplicates integration items so no duplicate integration statements exist in Section 3.
 */
export function deduplicateIntegrations<T extends IntegrationItem>(
  integrations: T[]
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of integrations) {
    const text = (item.custom_teacher_content || item.wording || '').trim().toLowerCase();
    const key = `${item.type}:${text.replace(/[^a-z0-9]/g, '')}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

/**
 * FINAL LANGUAGE SANITIZATION PASS
 * Scans all generated lesson-plan fields before preview or export.
 * If Vietnamese text is detected in any field (integrations, procedures, activities, evidence, outcomes),
 * converts it into clean contextual English and replaces the Vietnamese source text.
 */
export function sanitizeLessonPlanLanguage(plan: LessonPlan): LessonPlan {
  if (!plan) return plan;

  const vocabList = plan.vocabulary || [];
  const patternList = plan.sentence_patterns || [];
  const context = { vocabulary: vocabList, mainPattern: patternList[0] };

  // 1. Sanitize Integrations list
  const sanitizedIntegrations = (plan.integrations || []).map((item) => {
    let customContent = item.custom_teacher_content || item.wording || '';
    if (isVietnameseText(customContent)) {
      customContent = translateVietnameseIntegrationToEnglish(customContent, context);
    }

    let wording = item.wording || customContent;
    if (isVietnameseText(wording)) {
      wording = translateVietnameseIntegrationToEnglish(wording, context);
    }

    let customLabel = item.customLabelText || '';
    if (isVietnameseText(customLabel)) {
      customLabel = translateVietnameseIntegrationToEnglish(customLabel, context);
    }

    return {
      ...item,
      custom_teacher_content: customContent,
      wording,
      customLabelText: customLabel || item.customLabelText
    };
  });

  const deduplicated = deduplicateIntegrations(sanitizedIntegrations);

  // 2. Sanitize Procedures Table rows
  const sanitizedProcedures = (plan.procedures || []).map((proc) => {
    const teacherActs = (proc.teacherActivities || []).map((line) => {
      if (isVietnameseText(line)) {
        const match = line.match(/^Teacher introduces (?:a )?(.+?) integration (?:task|activity):\s*(.*)/i);
        if (match) {
          const labelName = match[1];
          const rawDetail = match[2];
          const translated = translateVietnameseIntegrationToEnglish(rawDetail, context);
          const cleanDetail = translated.replace(/^Encourage pupils to\s*/i, '').replace(/[\.]*$/, '');
          return `Teacher introduces a ${labelName} integration activity to encourage pupils to ${cleanDetail}.`;
        }
        return translateVietnameseIntegrationToEnglish(line, context);
      }
      return cleanEnglishFormatting(line);
    });

    const pupilActs = (proc.pupilActivities || []).map((line) => {
      if (isVietnameseText(line)) {
        const match = line.match(/^Pupils perform (?:the |task:)?\s*(.*)/i);
        if (match) {
          const translated = translateVietnameseIntegrationToEnglish(match[1], context);
          return `Pupils perform the activity: ${translated}`;
        }
        return translateVietnameseIntegrationToEnglish(line, context);
      }
      return cleanEnglishFormatting(line);
    });

    let outcome = proc.expectedOutcome || '';
    if (isVietnameseText(outcome)) {
      outcome = translateVietnameseIntegrationToEnglish(outcome, context);
    }

    let evidence = proc.evidence || '';
    if (isVietnameseText(evidence)) {
      const match = evidence.match(/^Pupils successfully complete (?:the )?integration activity:\s*(.*)/i);
      if (match) {
        const translated = translateVietnameseIntegrationToEnglish(match[1], context);
        evidence = `Pupils successfully complete the integration activity: ${translated}`;
      } else {
        evidence = translateVietnameseIntegrationToEnglish(evidence, context);
      }
    }

    let adjustments = proc.postLessonAdjustments || '';
    if (isVietnameseText(adjustments)) {
      adjustments = translateVietnameseIntegrationToEnglish(adjustments, context);
    }

    return {
      ...proc,
      teacherActivities: teacherActs,
      pupilActivities: pupilActs,
      expectedOutcome: cleanEnglishFormatting(outcome),
      evidence: cleanEnglishFormatting(evidence),
      postLessonAdjustments: adjustments
    };
  });

  return {
    ...plan,
    integrations: deduplicated,
    procedures: sanitizedProcedures
  };
}
