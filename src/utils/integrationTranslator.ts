import type { LessonPlan, IntegrationItem, ProcedureRow } from '../types';

export const INTEGRATION_LABEL_NAMES: Record<string, string> = {
  CDS: 'Digital Transformation',
  ETHICS: 'Moral Education',
  ATGT: 'Traffic Safety Education',
  GDDP: 'Local Education',
  STEM: 'STEM Education',
  ANQP: 'National Defence and Security Education',
  HUMAN_RIGHTS: 'Human Rights Education',
  CHILDREN_RIGHTS: "Children's Rights Education",
  ENVIRONMENT: 'Environmental Protection',
  WATER_PROTECTION: 'Water Resource Protection',
  NLS: 'Digital Competence (NLS)',
  AI: 'AI Education',
  CUSTOM: 'Custom Integration'
};

export function getIntegrationDisplayName(item: { type: string; isCustomLabel?: boolean; customLabelText?: string }): string {
  if (item.isCustomLabel && item.customLabelText) return item.customLabelText;
  return INTEGRATION_LABEL_NAMES[item.type] || item.type;
}

export function formatSection3IntegrationItem(item: IntegrationItem): string {
  const name = getIntegrationDisplayName(item);
  const code = item.code || item.official_code || '';
  const codeStr = code ? ` [${code.replace(/^\[|\]$/g, '')}]` : '';
  const wording = item.wording || item.custom_teacher_content || item.official_wording || '';
  return `${name}${codeStr}: ${wording}`;
}

export function isIntegrationProcedureRow(proc: ProcedureRow): boolean {
  if (!proc) return false;
  return Boolean(
    proc.integrationCode ||
    proc.integrationLabel ||
    (proc.stageName && /integration/i.test(proc.stageName))
  );
}

export function getCanonicalIntegrationCellContent(
  proc: ProcedureRow,
  integrations: IntegrationItem[] = []
): string {
  if (!proc) return '';

  const procCode = (proc.integrationCode || '').replace(/^\[|\]$/g, '').trim();

  let matchedItem: IntegrationItem | undefined = undefined;

  if (procCode) {
    matchedItem = integrations.find(
      (item) => item.code === procCode || item.official_code === procCode || item.code?.replace(/^\[|\]$/g, '').trim() === procCode
    );
  }

  if (!matchedItem && proc.integrationLabel) {
    const cleanProcLabel = proc.integrationLabel.replace(/\s*\[.*\]$/, '').trim().toLowerCase();
    matchedItem = integrations.find((item) => {
      const name = getIntegrationDisplayName(item).toLowerCase();
      return name === cleanProcLabel || item.type.toLowerCase() === cleanProcLabel;
    });
  }

  if (!matchedItem && proc.stageName) {
    matchedItem = integrations.find((item) => {
      const code = item.code || item.official_code;
      if (code && proc.stageName.includes(code)) return true;
      const name = getIntegrationDisplayName(item);
      if (name && proc.stageName.toLowerCase().includes(name.toLowerCase())) return true;
      return false;
    });
  }

  if (matchedItem) {
    return formatSection3IntegrationItem(matchedItem);
  }

  let name = proc.integrationLabel || 'Integration';
  name = name.replace(/\s*\[.*\]$/, '').trim();
  if (INTEGRATION_LABEL_NAMES[name]) {
    name = INTEGRATION_LABEL_NAMES[name];
  }

  const codeStr = procCode ? ` [${procCode}]` : '';

  let wording = proc.evidence || proc.expectedOutcome || '';
  wording = wording
    .replace(/^Pupils successfully complete the integration activity:\s*/i, '')
    .replace(/^Pupils complete the integration activity:\s*/i, '')
    .replace(/^Pupils perform the task:\s*/i, '')
    .trim();

  return `${name}${codeStr}: ${wording}`;
}

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
  const vnKeywords = /\b(giáo dục|học sinh|bảo vệ|môi trường|gia đình|bố mẹ|cha mẹ|rèn luyện|rèn|ý thức|tiết kiệm|giao thông|vệ sinh|bạn bè|thầy cô|kỷ luật|đoàn kết|không|giúp đỡ|tôn trọng|yêu quý|thói quen|trường lớp|nước|điện|bản thân|an toàn|phù hợp|kỹ năng|thái độ|hành vi|chủ đề|lịch sự|trách nhiệm|người khác|giữ gìn|đồ dùng|tình huống|bài|sử dụng|thảo luận|chấm điểm|nộp bài|gửi bài|ghi âm|trợ lý|trò chơi|tập thể|sách vở)\b/i;
  return vnKeywords.test(text);
}

/**
 * Deduplicates procedure activity lines while preserving valid line order, punctuation, and line breaks.
 */
export function deduplicateActivityLines(lines: string[]): string[] {
  if (!lines || lines.length === 0) return [];
  const result: string[] = [];
  const seenNorm = new Set<string>();

  for (const rawLine of lines) {
    if (!rawLine) continue;
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const norm = trimmed.toLowerCase().replace(/\s+/g, ' ');

    if (!seenNorm.has(norm)) {
      seenNorm.add(norm);
      result.push(trimmed);
    }
  }

  return result;
}

/**
 * Detects and replaces vague or broken integration text such as "Encourage pupils to activity:"
 * with a complete, meaningful sentence.
 */
export function fixVagueIntegrationText(text: string, labelName?: string): string {
  if (!text || !text.trim()) {
    const label = labelName ? `${labelName.trim()} ` : '';
    return `Encourage pupils to participate actively in the ${label}integration activity.`;
  }

  let cleaned = text.trim();

  // Remove repeated prefix duplications
  cleaned = cleaned
    .replace(/^(?:Encourage\s+pupils\s+to\s+)+/gi, 'Encourage pupils to ')
    .replace(/^Encourage pupils to Raise pupils' awareness of/gi, "Raise pupils' awareness of")
    .replace(/(?:activity|task)\s*:\s*(?:activity|task)\s*:?/gi, 'activity:')
    .replace(/\s+/g, ' ')
    .trim();

  // Check for vague / broken phrases like "Encourage pupils to activity:", "activity:", "Activity: activity:", etc.
  const cleanNoDot = cleaned.replace(/[.]+$/, '').trim();
  const lower = cleanNoDot.toLowerCase();
  const isVague =
    /^(?:encourage\s+pupils\s+to\s+)?(?:activity|task|integration activity|integration task)\s*:?\s*$/i.test(cleanNoDot) ||
    /^encourage\s+pupils\s+to\s*:?\s*$/i.test(cleanNoDot) ||
    /encourage\s+pupils\s+to\s+(?:activity|task)\s*:?/i.test(cleanNoDot) ||
    /^(?:activity|task|integration|:\s*)+$/i.test(cleanNoDot) ||
    lower.includes('activity: activity') ||
    lower.includes('task: task') ||
    lower === 'activity:' ||
    lower === 'activity' ||
    lower === 'task:' ||
    lower === 'task';

  if (isVague) {
    const label = labelName ? `${labelName.trim()} ` : '';
    return `Encourage pupils to participate actively in the ${label}integration activity.`;
  }

  // Replace trailing "to activity:" or "to task:" inside longer sentences
  cleaned = cleaned.replace(/\bto\s+(?:activity|task)\s*:?\s*$/gi, 'in the integration activity.');
  cleaned = cleaned.replace(/in the integration activity in the integration activity/gi, 'in the integration activity');

  return cleanEnglishFormatting(cleaned);
}

/**
 * Cleans formatting errors, duplicate colons, and awkward phrasing in English lesson plan strings.
 */
export function cleanEnglishFormatting(text: string, labelName?: string): string {
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

  if (
    /^(?:Encourage\s+pupils\s+to\s+)?(?:activity|task|integration activity)\s*:?\s*$/i.test(cleaned) ||
    /Encourage\s+pupils\s+to\s+(?:activity|task)\s*:?/i.test(cleaned)
  ) {
    return fixVagueIntegrationText(cleaned, labelName);
  }

  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }
  return cleaned;
}

/**
 * Translates Vietnamese integration input into professional English primary school lesson plan language.
 * Avoids mechanical word-for-word translation, uses appropriate educational terminology,
 * preserves codes and proper names, and fixes duplicated colons and awkward phrasing.
 */
export function translateVietnameseIntegrationToEnglish(
  input: string,
  _context?: { vocabulary?: string[]; mainPattern?: string }
): string {
  if (!input || !input.trim()) return '';

  let text = input.trim();

  // Clean initial colons, repetitive dashes, or awkward leading symbols
  text = text.replace(/^[:\s\-]+/, '').trim();

  // Extract leading Code / Prefix (e.g. "AI 3.A1.MR1:", "NLS 2.1.CB1a:", "NLS_3.1:", "CV 5512:", etc.)
  let codePrefix = '';
  const codePrefixMatch = text.match(/^((?:(?:AI|NLS|CDS|ETHICS|ATGT|GDDP|STEM|ANQP|HUMAN_RIGHTS|CHILDREN_RIGHTS|ENVIRONMENT|WATER_PROTECTION|CUSTOM|CV|QD|COMP|TC|YCCD)[\s_\-\.\/]*[A-Z0-9_\-\.\/]*|[A-Z0-9_\.\-]{2,15})\s*:\s*)/i);
  if (codePrefixMatch) {
    codePrefix = codePrefixMatch[1];
    text = text.slice(codePrefix.length).trim();
  }

  // If remaining text has zero Vietnamese words or diacritics, format clean English and return
  if (!isVietnameseText(text)) {
    return cleanEnglishFormatting(codePrefix + text);
  }

  // Extract quoted topics like "In the classroom" if present
  const topicMatch = text.match(/chủ đề\s*["“']([^"”']+)["”']/i) || text.match(/["“']([^"”']+)["”']/);
  const topicStr = topicMatch ? topicMatch[1] : '';

  // 1. High-Priority Exact Pattern Mappings for Complete Educational Statements
  const exactMappings: [RegExp, string | ((...args: any[]) => string)][] = [
    [
      /^(?:rèn|rèn luyện)\s+tinh\s+thần\s+đoàn\s+kết\s*:\s*tham\s+gia\s+trò\s+chơi\s+tập\s+thể\.?$/i,
      'Foster teamwork and cooperation through group games.'
    ],
    [
      /^(?:rèn|rèn luyện)\s+tinh\s+thần\s+đoàn\s+kết\s+(?:khi\s+)?tham\s+gia\s+trò\s+chơi\s+tập\s+thể\.?$/i,
      'Foster teamwork and cooperation through group games.'
    ],
    [
      /^giáo\s+dục\s+ý\s+thức\s+bảo\s+vệ\s+môi\s+trường\s+thông\s+qua\s+tình\s+huống\s+phù\s+hợp\s+với\s+chủ\s+đề\s*["“']([^"”']+)["”']\s*;\s*giữ\s+vệ\s+sinh,\s*tiết\s+kiệm\s+tài\s+nguyên\s+và\s+không\s+xả\s+rác\.?$/i,
      (_m: string, topic: string) => `Raise pupils' awareness of environmental protection in situations related to the lesson topic "${topic}", encouraging them to maintain cleanliness, save resources, and refrain from littering.`
    ],
    [
      /^sử\s+dụng\s+công\s+cụ\s+AI\s+để\s+luyện\s+nghe\s+và\s+phát\s+âm\s*["“']?([^"”']+)["”']?\.?$/i,
      (_m: string, word: string) => `Use an AI tool to practise listening to and pronouncing “${word.trim()}”.`
    ],
    [
      /^lựa\s+chọn\s+công\s+nghệ\s+số\s+đơn\s+giản\s+để\s+tương\s+tác\s+trong\s+hoạt\s+động\s+học\s+tập\s+có\s+hướng\s+dẫn\.?$/i,
      'Select simple digital technologies to interact in guided learning activities.'
    ],
    [
      /^sử\s+dụng\s+điện\s+thoại\s+thông\s+minh\s+để\s+ghi\s+âm\s+phát\s+âm\s+và\s+gửi\s+bài\s+cho\s+giáo\s+viên\s+qua\s+Zalo\.?$/i,
      'Use a smartphone to record pronunciation practice and submit the recording to the teacher via Zalo.'
    ],
    [
      /^sử\s+dụng\s+điện\s+thoại\s+thông\s+minh\s+để\s+ghi\s+âm\s+phát\s+âm\s+và\s+gửi\s+bài\s+cho\s+giáo\s+viên\s+qua\s+([A-Za-z0-9_\-]+)\.?$/i,
      (_m: string, app: string) => `Use a smartphone to record pronunciation practice and submit the recording to the teacher via ${app}.`
    ],
    [
      /^thảo\s+luận\s+AI\s+giúp\s+chấm\s+điểm\s+phát\s+âm\s+từ\s+vựng\s+đúng\/sai\.?$/i,
      'Discuss how AI can help provide feedback on whether vocabulary pronunciation is correct.'
    ],
    [
      /^thảo\s+luận\s+AI\s+giúp\s+chấm\s+điểm\s+phát\s+âm\s+từ\s+vựng\.?$/i,
      'Discuss how AI can help provide feedback on vocabulary pronunciation.'
    ],
    [
      /^thảo\s+luận\s+AI\s+giúp\s+chấm\s+điểm\s+phát\s+âm\.?$/i,
      'Discuss how AI can help provide feedback on pronunciation.'
    ],
    [
      /^giáo\s+dục\s+học\s+sinh\s+giữ\s+gìn\s+sách\s+vở\.?$/i,
      'Encourage pupils to take good care of their books and learning materials.'
    ],
    [
      /^giáo\s+dục\s+học\s+sinh\s+giữ\s+gìn\s+đồ\s+dùng\s+học\s+tập\.?$/i,
      'Encourage pupils to take good care of their learning materials.'
    ],
    [
      /^sử\s+dụng\s+trợ\s+lý\s+AI\s+hỗ\s+trợ\s+luyện\s+phát\s+âm\.?$/i,
      'Use an AI assistant to support pronunciation practice.'
    ],
    [
      /giáo\s+dục\s+thái\s+độ,?\s*hành\s+vi\s+phù\s+hợp\s+với\s+chủ\s+đề\s*["“']([^"”']+)["”']\s*:\s*lịch\s+sự,\s*có\s+trách\s+nhiệm,\s*tôn\s+trọng\s+người\s+khác\s+và\s+giữ\s+gìn\s+đồ\s+dùng\/môi\s+trường\s+liên\s+quan\s+đến\s+tình\s+huống\s+của\s+bài/i,
      (_m: string, topic: string) => `Encourage pupils to behave politely and responsibly, respect others, and take care of belongings and the environment in situations related to the lesson topic "${topic}".`
    ],
    [
      /giáo\s+dục\s+thái\s+độ,?\s*hành\s+vi\s+phù\s+hợp\s+với\s+chủ\s+đề\s*["“']([^"”']+)["”']\s*:\s*(.*)/i,
      (_m: string, topic: string, details: string) => {
        const translatedDetails = translateVietnameseIntegrationToEnglish(details);
        const cleanDetails = translatedDetails.replace(/^Encourage pupils to\s*/i, '').replace(/[\.]*$/, '');
        return `Encourage pupils to demonstrate positive behavior, ${cleanDetails} in situations related to the lesson topic "${topic}".`;
      }
    ],
    [/giáo\s+dục\s+học\s+sinh\s+biết\s+yêu\s+quý\s+gia\s+đình\s+và\s+giúp\s+đỡ\s+bố\s+mẹ/i, 'Encourage pupils to appreciate their family and help their parents.'],
    [/yêu\s+quý\s+gia\s+đình\s+và\s+giúp\s+đỡ\s+bố\s+mẹ/i, 'Encourage pupils to appreciate their family and help their parents.'],
    [/giáo\s+dục\s+ý\s+thức\s+bảo\s+vệ\s+môi\s+trường,?\s*không\s+xả\s+rác/i, "Raise pupils' awareness of environmental protection and encourage them not to litter."],
    [/bảo\s+vệ\s+môi\s+trường,?\s*không\s+xả\s+rác/i, "Raise pupils' awareness of environmental protection and encourage them not to litter."],
    [/giữ\s+gìn\s+vệ\s+sinh\s+trường\s+lớp/i, "Raise pupils' awareness of keeping their school and classroom clean."],
    [/giữ\s+gìn\s+vệ\s+sinh\s+lớp\s+học/i, "Raise pupils' awareness of keeping their classroom clean and tidy."],
    [/chấp\s+hành\s+tốt\s+luật\s+giao\s+thông/i, "Encourage pupils to observe traffic safety rules and practice safe commuting habits."],
    [/an\s+toàn\s+giao\s+thông/i, "Raise pupils' awareness of traffic safety rules."],
    [/tiết\s+kiệm\s+điện\s+và\s+nước/i, "Raise pupils' awareness of saving electricity and clean water."],
    [/tiết\s+kiệm\s+nước/i, "Raise pupils' awareness of saving clean water."],
    [/tôn\s+trọng\s+thầy\s+cô\s+và\s+bạn\s+bè/i, "Encourage pupils to show respect for teachers and classmates."],
    [/tôn\s+trọng\s+bạn\s+bè/i, "Encourage pupils to show respect for their classmates."],
    [/bảo\s+vệ\s+thông\s+tin\s+cá\s+nhân/i, "Guide pupils to protect personal information in digital learning environments."],
    [/rèn\s+luyện\s+tính\s+tự\s+lập/i, "Encourage pupils to develop self-discipline and independence."]
  ];

  for (const [pattern, replacement] of exactMappings) {
    if (pattern.test(text)) {
      let matchedResult = '';
      if (typeof replacement === 'function') {
        const match = text.match(pattern);
        if (match) matchedResult = replacement(...match);
      } else {
        matchedResult = replacement;
      }
      if (matchedResult) {
        return cleanEnglishFormatting(codePrefix + matchedResult);
      }
    }
  }

  // 2. Rule-based Decomposition for Arbitrary Educational Statements
  let result = text;

  // Handle leading colon patterns (e.g. "Rèn tinh thần đoàn kết: tham gia trò chơi tập thể.")
  result = result
    .replace(/^(?:rèn|rèn luyện)\s+tinh\s+thần\s+đoàn\s+kết\s*:\s*/i, 'foster teamwork and cooperation through ')
    .replace(/^bảo\s+vệ\s+môi\s+trường\s*:\s*/i, 'raise pupils\' awareness of environmental protection through ')
    .replace(/^an\s+toàn\s+giao\s+thông\s*:\s*/i, 'raise pupils\' awareness of traffic safety by ')
    .replace(/^tiết\s+kiệm\s+điện\s+nước\s*:\s*/i, 'raise pupils\' awareness of saving electricity and water by ');

  // Determine prefix verb phrase
  let prefix = '';
  if (/^(?:foster|raise|use|select|discuss|guide)\s+/i.test(result)) {
    prefix = '';
  } else if (/^sử\s+dụng\b/i.test(result)) {
    prefix = "Use ";
    result = result.replace(/^sử\s+dụng\s*/i, '');
  } else if (/^lựa\s+chọn\b/i.test(result)) {
    prefix = "Select ";
    result = result.replace(/^lựa\s+chọn\s*/i, '');
  } else if (/^thảo\s+luận\s+AI\s+giúp\b/i.test(result)) {
    prefix = "Discuss how AI can help ";
    result = result.replace(/^thảo\s+luận\s+AI\s+giúp\s*/i, '');
  } else if (/^thảo\s+luận\s+(?:về\s+)?/i.test(result)) {
    prefix = "Discuss ";
    result = result.replace(/^thảo\s+luận\s+(?:về\s+)?/i, '');
  } else if (/^(?:giáo dục|bồi dưỡng)\s+thái\s+độ,?\s*hành\s+vi\b/i.test(result)) {
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
  } else if (/^(?:rèn|rèn luyện)\s+tinh\s+thần\s+đoàn\s+kết\s+(?:khi\s+)?/i.test(result)) {
    prefix = "Foster teamwork and cooperation ";
    result = result.replace(/^(?:rèn|rèn luyện)\s+tinh\s+thần\s+đoàn\s+kết\s+(?:khi\s+)?/i, '');
  } else if (/^(?:rèn\s+luyện|tạo)\s+(?:cho\s+học\s+sinh\s+)?thói\s+quen\b/i.test(result)) {
    prefix = "Encourage pupils to develop habits of ";
    result = result.replace(/^(?:rèn\s+luyện|tạo)\s+(?:cho\s+học\s+sinh\s+)?thói\s+quen\s*/i, '');
  } else if (/^(?:rèn\s+luyện|bồi dưỡng|rèn)\s+(?:cho\s+học\s+sinh\b)?/i.test(result)) {
    prefix = "Encourage pupils to ";
    result = result.replace(/^(?:rèn\s+luyện|bồi dưỡng|rèn)\s+(?:cho\s+học\s+sinh\s+)?/i, '');
  } else if (/^(?:hướng dẫn|giúp)\s+học\s+sinh\b/i.test(result)) {
    prefix = "Guide pupils to ";
    result = result.replace(/^(?:hướng dẫn|giúp)\s+học\s+sinh\s*/i, '');
  } else if (/^ý\s+thức\b/i.test(result)) {
    prefix = "Raise pupils' awareness of ";
    result = result.replace(/^ý\s+thức\s*(?:về)?\s*/i, '');
  } else {
    prefix = "Encourage pupils to ";
  }

  // 3. Multi-word Educational Phrase Dictionary (Longer/more specific phrases first)
  const phraseDictionary: [RegExp, string][] = [
    [/\bcông nghệ số đơn giản\b/gi, 'simple digital technologies'],
    [/\bcông nghệ số\b/gi, 'digital technologies'],
    [/\bhoạt động học tập có hướng dẫn\b/gi, 'guided learning activities'],
    [/\bhoạt động học tập\b/gi, 'learning activities'],
    [/\bhọc tập có hướng dẫn\b/gi, 'guided learning'],
    [/\btương tác trong\b/gi, 'interact in'],
    [/\bđể tương tác\b/gi, 'to interact'],
    [/\bchấm điểm phát âm từ vựng đúng\/sai\b/gi, 'provide feedback on whether vocabulary pronunciation is correct'],
    [/\bchấm điểm phát âm từ vựng\b/gi, 'provide feedback on vocabulary pronunciation'],
    [/\bchấm điểm phát âm\b/gi, 'provide feedback on pronunciation'],
    [/\bđiện thoại thông minh\b/gi, 'a smartphone'],
    [/\btrợ lý AI\b/gi, 'an AI assistant'],
    [/\bứng dụng AI\b/gi, 'an AI application'],
    [/\bcông cụ AI\b/gi, 'an AI tool'],
    [/\bphần mềm AI\b/gi, 'AI software'],
    [/\bhỗ trợ luyện phát âm\b/gi, 'to support pronunciation practice'],
    [/\bđể luyện nghe và phát âm\b/gi, 'to practise listening to and pronouncing'],
    [/\bluyện nghe và phát âm\b/gi, 'practise listening to and pronouncing'],
    [/\bluyện nghe\b/gi, 'practise listening'],
    [/\bluyện phát âm\b/gi, 'practise pronunciation'],
    [/\bghi âm phát âm\b/gi, 'record pronunciation practice'],
    [/\bghi âm bài nói\b/gi, 'record speaking practice'],
    [/\bquay video\b/gi, 'record a video'],
    [/\bvà gửi bài cho giáo viên\b/gi, 'and submit the recording to the teacher'],
    [/\bgửi bài cho giáo viên\b/gi, 'submit the recording to the teacher'],
    [/\bnộp bài cho giáo viên\b/gi, 'submit assignments to the teacher'],
    [/\bnộp bài\b/gi, 'submit assignments'],
    [/\bgiữ gìn sách vở\b/gi, 'take good care of their books and learning materials'],
    [/\bgiữ gìn đồ dùng học tập\b/gi, 'take good care of their learning materials'],
    [/\bsách vở\b/gi, 'books and learning materials'],
    [/\btinh thần đoàn kết\b/gi, 'teamwork and cooperation'],
    [/\bkhi tham gia trò chơi tập thể\b/gi, 'through group games'],
    [/\btham gia trò chơi tập thể\b/gi, 'through group games'],
    [/\btrò chơi tập thể\b/gi, 'group games'],
    [/\bqua Zalo\b/gi, 'via Zalo'],
    [/\bqua Azota\b/gi, 'via Azota'],
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
    [/\bgiữ vệ sinh,\s*tiết kiệm tài nguyên và không xả rác\b/gi, 'maintaining cleanliness, saving resources, and refraining from littering'],
    [/\bgiữ vệ sinh,\s*tiết kiệm tài nguyên và không xả rác bừa bãi\b/gi, 'maintaining cleanliness, saving resources, and refraining from littering'],
    [/\bkhông xả rác bừa bãi\b|\bkhông xả rác\b/gi, 'refrain from littering'],
    [/\btiết kiệm tài nguyên\b/gi, 'save resources'],
    [/\bgiữ gìn vệ sinh trường lớp\b/gi, 'keep their school and classroom clean'],
    [/\bgiữ gìn vệ sinh lớp học\b/gi, 'keep their classroom clean and tidy'],
    [/\bgiữ gìn vệ sinh\b|\bgiữ vệ sinh\b/gi, 'maintain cleanliness'],
    [/\bchấp hành tốt\b|\bchấp hành\b/gi, 'observe'],
    [/\bluật giao thông\b|\ban toàn giao thông\b/gi, 'traffic safety rules'],
    [/\btiết kiệm điện và nước\b/gi, 'save electricity and clean water'],
    [/\btiết kiệm nước\b/gi, 'save clean water'],
    [/\btiết kiệm điện\b/gi, 'save electricity'],
    [/\btôn trọng thầy cô và bạn bè\b/gi, 'show respect for teachers and classmates'],
    [/\btôn trọng bạn bè\b/gi, 'show respect for classmates'],
    [/\btôn trọng\b/gi, 'show respect for'],
    [/\bthông qua tình huống phù hợp với chủ đề\b/gi, 'in situations related to the lesson topic'],
    [/\bthông qua tình huống\b/gi, 'through situations'],
    [/\bphù hợp với chủ đề\b/gi, 'related to the lesson topic'],
    [/\bchủ đề\b/gi, 'lesson topic'],
    [/\bđoàn kết\b/gi, 'foster solidarity'],
    [/\bkỷ luật\b/gi, 'maintain discipline'],
    [/\btrung thực\b/gi, 'practice honesty'],
    [/\btự giác\b/gi, 'develop self-discipline'],
    [/\bhọc tập\b/gi, 'learning activities'],
    [/\bý thức\b/gi, 'awareness'],
    [/\bthái độ\b/gi, 'attitude'],
    [/\bhành vi\b/gi, 'behavior']
  ];

  let translatedBody = result;
  for (const [pattern, repl] of phraseDictionary) {
    translatedBody = translatedBody.replace(pattern, repl);
  }

  // 4. Final Sweep Pass for single Vietnamese connective words
  const singleWordDictionary: [RegExp, string][] = [
    [/(?:^|\s)thông\s+qua(?:\s|$)/gi, ' through '],
    [/(?:^|\s)tình\s+huống(?:\s|$)/gi, ' situations '],
    [/(?:^|\s)phù\s+hợp(?:\s|$)/gi, ' suitable '],
    [/(?:^|\s)giữ(?:\s|$)/gi, ' maintain '],
    [/(?:^|\s)vệ\s+sinh(?:\s|$)/gi, ' cleanliness '],
    [/(?:^|\s)tiết\s+kiệm(?:\s|$)/gi, ' saving '],
    [/(?:^|\s)tài\s+nguyên(?:\s|$)/gi, ' resources '],
    [/(?:^|\s)hoạt\s+động(?:\s|$)/gi, ' activities '],
    [/(?:^|\s)hướng\s+dẫn(?:\s|$)/gi, ' guided '],
    [/(?:^|\s)tương\s+tác(?:\s|$)/gi, ' interact '],
    [/(?:^|\s)công\s+nghệ(?:\s|$)/gi, ' technology '],
    [/(?:^|\s)lựa\s+chọn(?:\s|$)/gi, ' select '],
    [/(?:^|\s)sử\s+dụng(?:\s|$)/gi, ' use '],
    [/(?:^|\s)công\s+cụ(?:\s|$)/gi, ' tools '],
    [/(?:^|\s)luyện(?:\s|$)/gi, ' practise '],
    [/(?:^|\s)nghe(?:\s|$)/gi, ' listening '],
    [/(?:^|\s)phát\s+âm(?:\s|$)/gi, ' pronunciation '],
    [/(?:^|\s)để(?:\s|$)/gi, ' to '],
    [/(?:^|\s)và(?:\s|$)/gi, ' and '],
    [/(?:^|\s)không(?:\s|$)/gi, ' not '],
    [/(?:^|\s)bằng(?:\s|$)/gi, ' with '],
    [/(?:^|\s)khi(?:\s|$)/gi, ' when '],
    [/(?:^|\s)cho(?:\s|$)/gi, ' for '],
    [/(?:^|\s)xả\s+rác(?:\s|$)/gi, ' littering '],
    [/(?:^|\s)rác(?:\s|$)/gi, ' litter '],
    [/(?:^|\s)rèn(?:\s|$)/gi, ' foster '],
    [/(?:^|\s)rèn\s+luyện(?:\s|$)/gi, ' foster '],
    [/(?:^|\s)tinh\s+thần(?:\s|$)/gi, ' spirit of '],
    [/(?:^|\s)đoàn\s+kết(?:\s|$)/gi, ' cooperation '],
    [/(?:^|\s)tham\s+gia(?:\s|$)/gi, ' participating in '],
    [/(?:^|\s)trò\s+chơi(?:\s|$)/gi, ' games '],
    [/(?:^|\s)tập\s+thể(?:\s|$)/gi, ' group ']
  ];

  for (const [pattern, repl] of singleWordDictionary) {
    translatedBody = translatedBody.replace(pattern, repl);
  }

  // Clean double spaces, redundant colons, and orphan punctuation
  translatedBody = translatedBody
    .replace(/\s+/g, ' ')
    .replace(/:\s*:/g, ':')
    .replace(/^:\s*/, '')
    .replace(/;\s*,/g, ',')
    .replace(/\s+;/g, ';')
    .trim();

  let finalOutput = codePrefix + prefix + translatedBody;

  if (topicStr && !finalOutput.toLowerCase().includes(topicStr.toLowerCase())) {
    finalOutput += ` in situations related to the lesson topic "${topicStr}"`;
  }

  // 5. Grammar Post-Processor: Fix awkward phrasing & duplicate prefixes
  finalOutput = finalOutput
    .replace(/Encourage pupils to Foster teamwork/gi, 'Foster teamwork')
    .replace(/Encourage pupils to Raise pupils' awareness/gi, "Raise pupils' awareness")
    .replace(/Encourage pupils to Encourage pupils to/gi, "Encourage pupils to")
    .replace(/Encourage pupils to Select /gi, "Select ")
    .replace(/Encourage pupils to Use /gi, "Use ")
    .replace(/Encourage pupils to teamwork/gi, "Foster teamwork")
    .replace(/Encourage pupils to:\s*/gi, "Encourage pupils to ")
    .replace(/:\s*:\s*/g, ': ')
    .replace(/:\s*through\s*/gi, ' through ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanEnglishFormatting(finalOutput);
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
    const label = proc.integrationLabel;

    const teacherActs = deduplicateActivityLines(
      (proc.teacherActivities || []).map((line) => {
        const fixedLine = fixVagueIntegrationText(line, label);
        if (isVietnameseText(fixedLine)) {
          const match = fixedLine.match(/^Teacher introduces (?:a )?(.+?) integration (?:task|activity):\s*(.*)/i);
          if (match) {
            const labelName = match[1];
            const rawDetail = match[2];
            const translated = translateVietnameseIntegrationToEnglish(rawDetail, context);
            let cleanDetail = fixVagueIntegrationText(translated, labelName)
              .replace(/^Encourage pupils to\s*/i, '')
              .replace(new RegExp(`in the (?:${labelName} )?integration activity`, 'gi'), '')
              .replace(/[\.]*$/, '')
              .trim();
            if (!cleanDetail) cleanDetail = 'demonstrate positive behavior';
            return `Teacher introduces a ${labelName} integration activity to encourage pupils to ${cleanDetail}.`;
          }
          return fixVagueIntegrationText(translateVietnameseIntegrationToEnglish(fixedLine, context), label);
        }
        return cleanEnglishFormatting(fixedLine, label);
      })
    );

    const pupilActsRaw = (proc.pupilActivities || []).map((line) => {
      const fixedLine = fixVagueIntegrationText(line, label);

      if (isVietnameseText(fixedLine)) {
        const match = fixedLine.match(/^Pupils perform (?:the |task:|the activity:)?\s*(.*)/i);
        if (match) {
          const translated = translateVietnameseIntegrationToEnglish(match[1], context);
          const cleanDetail = fixVagueIntegrationText(translated, label).replace(/^Encourage pupils to\s*/i, '');
          return `Pupils perform the activity: ${cleanDetail}`;
        }
        return fixVagueIntegrationText(translateVietnameseIntegrationToEnglish(fixedLine, context), label);
      }

      const match = fixedLine.match(/^Pupils perform (?:the |task:|the activity:)?\s*(.*)/i);
      if (match) {
        const cleanDetail = fixVagueIntegrationText(match[1], label).replace(/^Encourage pupils to\s*/i, '');
        return `Pupils perform the activity: ${cleanDetail}`;
      }

      return cleanEnglishFormatting(fixedLine, label);
    });

    let pupilActs = deduplicateActivityLines(pupilActsRaw);

    // Ensure integration pupil activities contain 2-4 concise, non-repeated complete action sentences
    if (label && pupilActs.length < 2) {
      pupilActs = deduplicateActivityLines([
        `Pupils engage in the ${label} integration activity.`,
        ...pupilActs,
        'Pupils share their answers or products with the class.'
      ]);
    }

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
      expectedOutcome: cleanEnglishFormatting(outcome, label),
      evidence: cleanEnglishFormatting(evidence, label),
      postLessonAdjustments: adjustments
    };
  });

  // 3. Sanitize & Ensure Post-Reflection (Exactly 2 short English sentences)
  let rawReflection = plan.post_reflection || '';
  let finalReflection = rawReflection;
  if (!rawReflection || rawReflection.includes('___')) {
    finalReflection = generateModulePostLessonReflection(
      plan.teaching_program_code as any,
      plan.vocabulary,
      plan.sentence_patterns,
      plan.skills,
      plan.unit_title,
      plan.lesson_title
    );
  } else if (isVietnameseText(rawReflection)) {
    finalReflection = translateVietnameseIntegrationToEnglish(rawReflection, context);
  }

  return {
    ...plan,
    integrations: deduplicated,
    procedures: sanitizedProcedures,
    post_reflection: cleanEnglishFormatting(finalReflection)
  };
}

/**
 * Generates concise, professional post-lesson reflections consisting of EXACTLY 2 short English sentences,
 * tailored specifically to the lesson type (e.g. Review, Fun Time, Test, Test Correction, Starter, Extension, Move Up, Normal Unit).
 */
export function generateModulePostLessonReflection(
  programCode?: 'MOVE_UP' | 'ENHANCED' | 'CUSTOM' | 'GLOBAL_SUCCESS',
  vocabulary: string[] = [],
  sentencePatterns: string[] = [],
  skills: string[] = [],
  unitTitle: string = '',
  lessonTitle: string = '',
  activities: string = '',
  itemType?: string,
  displayTitle?: string
): string {
  const combinedText = `${unitTitle} ${lessonTitle} ${itemType || ''} ${displayTitle || ''}`.toLowerCase();

  const seedStr = `${programCode || 'GEN'}_${combinedText}_${vocabulary.length}_${sentencePatterns.length}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash);

  // 1. TEST CORRECTION
  if (/test\s*correction|chữa\s*bài|sửa\s*bài/i.test(combinedText)) {
    const options = [
      "Pupils identified and corrected common errors. More practice will be provided for challenging items.",
      "Pupils reviewed their assessment errors constructively. Targeted guidance will be provided for weak areas.",
      "Pupils analyzed their test mistakes effectively. Scaffolded practice will help address remaining difficulties."
    ];
    return options[idx % options.length];
  }

  // 2. TEST / TEST SEMESTER 1 / TEST SEMESTER 2 / ASSESSMENT
  if (/test\s*semester|semester\s*test|mid-term|final\s*test|end-term|assessment|kiểm\s*tra/i.test(combinedText) || /(?:^|\b)test(?:\b|$)/i.test(combinedText)) {
    const options = [
      "Most pupils completed the assessment tasks seriously. Difficult areas will be reviewed in the next lesson.",
      "Pupils demonstrated good focus during the test. Common difficulty areas will be reviewed in upcoming sessions.",
      "Pupils completed the test exercises with good concentration. Key challenging items will be reinforced next time."
    ];
    return options[idx % options.length];
  }

  // 3. REVIEW / REVISION / TEST REVISION / ON TAP
  if (/review|revision|test\s*revision|ôn\s*tập/i.test(combinedText)) {
    const options = [
      "Pupils recalled the reviewed language well. More practice will be provided for difficult items.",
      "Pupils consolidated most of the reviewed language successfully. More practice will focus on areas that still need improvement.",
      "Pupils reviewed target structures effectively. Further practice will help reinforce items requiring consolidation."
    ];
    return options[idx % options.length];
  }

  // 4. FUN TIME / GAMES
  if (/fun\s*time|game|play/i.test(combinedText)) {
    const options = [
      "Pupils participated actively in the learning games. More practice will help them use the target language confidently.",
      "Pupils engaged enthusiastically in game-based practice. Further interactive games will support their language confidence.",
      "Pupils enjoyed the interactive lesson activities. Additional communicative games will reinforce their target language use."
    ];
    return options[idx % options.length];
  }

  // 5. GETTING ACQUAINTED / STARTER / INTRO
  if (/getting\s*acquainted|starter|intro|introduction|làm\s*quen/i.test(combinedText)) {
    const options = [
      "Pupils participated actively and became familiar with the learning routines. More guided practice will support their confidence.",
      "Pupils engaged warmly in introductory activities and classroom routines. Scaffolded practice will help build their confidence.",
      "Pupils showed great interest in the starter routines. Continued guided practice will support their classroom adaptation."
    ];
    return options[idx % options.length];
  }

  // 6. EXTENSION / SUPPLEMENTARY
  if (/extension|supplementary|bổ\s*trợ|mở\s*rộng/i.test(combinedText)) {
    const options = [
      "Pupils applied the learnt language actively in the extension activities. Further practice will help strengthen their language use.",
      "Pupils demonstrated good creativity in extension tasks. Scaffolded practice will support deeper language application.",
      "Pupils completed the enrichment tasks enthusiastically. Additional practice will consolidate their expanded language use."
    ];
    return options[idx % options.length];
  }

  // 7. MOVE UP
  if (programCode === 'MOVE_UP' || /move\s*up/i.test(combinedText)) {
    const cleanVocab = (vocabulary || []).map(v => v.trim()).filter(Boolean);
    const cleanPatterns = (sentencePatterns || []).map(p => p.trim()).filter(Boolean);
    const cleanSkills = (skills || []).map(s => s.trim()).filter(Boolean);

    const vocabSample = cleanVocab.slice(0, 3).join(', ');

    let patternSample = cleanPatterns[0] ? cleanPatterns[0].split('-')[0].trim().replace(/\.$/, '') : '';

    let activitySample = '';
    if (activities) {
      const firstAct = activities.split(/;|\n/)[0]?.trim();
      if (firstAct && firstAct.length < 50) {
        activitySample = firstAct.replace(/\.$/, '');
      }
    }

    const skillSample = cleanSkills.length > 0 ? cleanSkills.slice(0, 2).join(' and ').toLowerCase() : '';

    const sentence1Options: string[] = [];

    if (vocabSample && patternSample) {
      sentence1Options.push(
        `Pupils participated actively in practicing target vocabulary (${vocabSample}) and key sentence structures.`,
        `Pupils applied the target sentence pattern "${patternSample}" enthusiastically during speaking activities.`,
        `Pupils demonstrated good engagement while learning vocabulary (${vocabSample}) and practicing sentence patterns.`
      );
    } else if (vocabSample) {
      sentence1Options.push(
        `Pupils participated actively in learning target vocabulary (${vocabSample}) through classroom activities.`,
        `Pupils demonstrated good recall and clear pronunciation of key vocabulary (${vocabSample}) during practice tasks.`,
        `Pupils engaged enthusiastically in vocabulary practice tasks covering ${vocabSample}.`
      );
    } else if (patternSample) {
      sentence1Options.push(
        `Pupils applied target sentence patterns such as "${patternSample}" actively in speaking activities.`,
        `Pupils practiced sentence structures like "${patternSample}" confidently in pair work.`,
        `Pupils engaged enthusiastically in speaking tasks using the target pattern "${patternSample}".`
      );
    } else if (activitySample) {
      sentence1Options.push(
        `Pupils engaged actively in "${activitySample}" and achieved the lesson learning outcomes.`,
        `Pupils completed the activity "${activitySample}" enthusiastically during class.`,
        `Pupils participated eagerly in "${activitySample}" and demonstrated good progress.`
      );
    } else {
      sentence1Options.push(
        `Pupils participated actively in ${skillSample ? `${skillSample} tasks` : 'combined skill activities'} and achieved the lesson objectives.`,
        `Pupils engaged enthusiastically in Move Up integrated tasks with good classroom cooperation.`,
        `Pupils completed the lesson activities effectively and demonstrated target language comprehension.`
      );
    }

    const sentence2Options: string[] = [];
    if (vocabSample) {
      sentence2Options.push(
        `More guided practice will be provided in the next lesson to consolidate vocabulary (${vocabSample}).`,
        `Further pair practice will be offered to help pupils master key vocabulary (${vocabSample}) confidently.`,
        `Scaffolded practice will be conducted next time to support pupils needing extra help with target words.`
      );
    } else if (patternSample) {
      sentence2Options.push(
        `More guided practice will be provided in the next lesson to reinforce target sentence structures.`,
        `Further speaking practice will help pupils build fluency and accuracy with target patterns.`,
        `Additional support will be offered to assist pupils who need extra practice with sentence patterns.`
      );
    } else {
      sentence2Options.push(
        `More guided practice will be provided in the next lesson for pupils who need additional support.`,
        `Further interactive practice will be offered to strengthen pupils' speaking confidence.`,
        `Continued review in upcoming lessons will help consolidate target language fluency.`
      );
    }

    const s1 = sentence1Options[idx % sentence1Options.length];
    const s2 = sentence2Options[(idx + 1) % sentence2Options.length];

    return `${s1} ${s2}`;
  }

  // 8. NORMAL UNIT LESSONS / CUSTOM / GENERAL
  const generalOptions = [
    "Pupils participated actively in class activities and achieved target outcomes. More guided practice will be provided in the next lesson.",
    "Most pupils engaged enthusiastically in the lesson tasks and pair practice. Further practice will help consolidate target language use.",
    "Pupils took part eagerly in classroom activities and used target structures well. Additional practice will support pupils needing extra help.",
    "Pupils worked cooperatively during speaking and listening tasks. Scaffolded practice will be offered next time to reinforce learning."
  ];

  return generalOptions[idx % generalOptions.length];
}
