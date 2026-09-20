import type { LessonPlan, ProcedureRow, IntegrationItem } from '../types';

export interface LessonGenInput {
  programCode: 'GLOBAL_SUCCESS' | 'MOVE_UP' | 'ENHANCED' | 'CUSTOM';
  gradeLevel: number;
  unitNumber?: number;
  unitTitle?: string;
  topic?: string;
  lessonNumber?: number;
  lessonTitle?: string;
  vocabulary: string[];
  sentencePatterns: string[];
  skills?: string[];
  teacherInstructions?: string;
  availableIntegrations?: {
    type: 'NLS' | 'AI' | 'CDS' | 'ETHICS' | 'ATGT' | 'GDDP' | 'STEM' | 'ANQP' | 'HUMAN_RIGHTS' | 'CHILDREN_RIGHTS' | 'ENVIRONMENT' | 'WATER_PROTECTION' | 'CUSTOM';
    officialCode?: string;
    officialWording?: string;
    customTeacherContent?: string;
    isCustomLabel?: boolean;
    customLabelText?: string;
    domain?: string;
  }[];
  youtubeChannelUrl?: string;
  matchedVideoTitle?: string;
  matchedVideoUrl?: string;
  matchedVideoSource?: 'teacher' | 'external';
}

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

export function getDefaultIntegrationSuggestion(type: string, vocabText: string, mainPattern: string): string {
  switch (type) {
    case 'ENVIRONMENT':
      return `Pupils identify environmentally friendly actions and use target sentence patterns (${mainPattern}) to describe them.`;
    case 'WATER_PROTECTION':
      return `Pupils discuss clean water conservation habits in daily school life using target vocabulary (${vocabText}).`;
    case 'NLS':
      return `Pupils use teacher-approved digital resources to locate visual information and complete target speaking practice (${mainPattern}).`;
    case 'AI':
      return `Pupils use AI voice feedback tools to practise target sentence patterns (${mainPattern}) and self-correct pronunciation.`;
    case 'ETHICS':
      return `Pupils demonstrate polite communication and respectful interaction while practising target sentence patterns (${mainPattern}).`;
    case 'ATGT':
      return `Pupils identify safe traffic behaviors during daily commute and discuss them using target vocabulary (${vocabText}).`;
    case 'STEM':
      return `Pupils organize target vocabulary items (${vocabText}) using structured visual classification charts.`;
    case 'CDS':
      return `Pupils select and organize digital learning materials using interactive classroom tools.`;
    case 'GDDP':
      return `Pupils relate target vocabulary (${vocabText}) to local primary school contexts and community activities.`;
    case 'ANQP':
      return `Pupils demonstrate discipline and teamwork during classroom speaking activities.`;
    case 'CHILDREN_RIGHTS':
    case 'HUMAN_RIGHTS':
      return `Pupils identify and express children's right to participate in age-appropriate recreational activities through speaking practice.`;
    default:
      return `Pupils apply integration content in target language activities (${mainPattern}).`;
  }
}

export function generateStructuredLessonPlan(input: LessonGenInput): LessonPlan {
  // 1. Specific Target Language Extraction
  const cleanVocab = (input.vocabulary || [])
    .map(v => v.trim())
    .filter(v => v.length > 0);

  const cleanPatterns = (input.sentencePatterns || [])
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const vocabText = cleanVocab.length > 0 ? cleanVocab.join(', ') : 'target vocabulary';
  const mainPattern = cleanPatterns.length > 0 ? cleanPatterns[0] : 'target sentence pattern';
  const patternsText = cleanPatterns.length > 0 ? cleanPatterns.join('; ') : mainPattern;

  // 2. Derive Skills Genuinely Practised
  // If explicitly specified, use those. Default derived from actual activities.
  const derivedSkills: string[] = input.skills && input.skills.length > 0 
    ? input.skills 
    : ['Listening', 'Speaking', 'Reading'];

  // 3. Teaching Aids
  const programName = input.programCode === 'MOVE_UP' ? 'MOVE UP' : 'Global Success';
  const teachingAids = [
    `${programName} English Grade ${input.gradeLevel} Textbook & Teacher's Book`,
    `Flashcards & word cards (${vocabText})`,
    'Audio player & interactive whiteboard / projector'
  ];

  // 4. Procedures Construction & Specific Warm-up
  const procedures: ProcedureRow[] = [];

  const matchedTitle = (input.matchedVideoTitle || '').trim();
  const matchedUrl = (input.matchedVideoUrl || input.youtubeChannelUrl || '').trim();
  const videoSource = input.matchedVideoSource || 'teacher';

  let activeVideoMetadata: { title: string; url: string; source: 'teacher' | 'external' } | undefined = undefined;

  if (matchedTitle) {
    // Verified matching video exists (Teacher channel or External resource)
    activeVideoMetadata = {
      title: matchedTitle,
      url: matchedUrl,
      source: videoSource
    };

    const sourceLabel = videoSource === 'teacher'
      ? `configured teacher YouTube channel (${matchedUrl})`
      : `educational external YouTube resource (${matchedUrl})`;

    procedures.push({
      id: 'proc_warmup',
      stageName: 'Warm-up & Lead-in (5 mins)',
      teacherActivities: [
        `Teacher plays video "${matchedTitle}" from the ${sourceLabel}.`,
        `Teacher asks pupils to listen/watch and identify target vocabulary (${vocabText}) and sentence patterns (${patternsText}).`,
        'Teacher elicits pupils\' answers and leads into the new lesson.'
      ],
      pupilActivities: [
        `Pupils watch/listen to "${matchedTitle}".`,
        `Pupils identify the requested target words (${vocabText}) and sentence patterns heard in the video.`,
        'Pupils respond to teacher questions and prepare for the new lesson.'
      ],
      expectedOutcome: `Pupils recall and identify target language related to the lesson from the ${videoSource === 'teacher' ? 'teacher' : 'external educational'} video.`,
      evidence: `Pupils correctly identify and say the requested target words (${vocabText}).`,
      videoMetadata: activeVideoMetadata,
      postLessonAdjustments: ''
    });
  } else {
    // No matching video found: Use specific appropriate non-YouTube warm-up activity
    procedures.push({
      id: 'proc_warmup',
      stageName: 'Warm-up & Lead-in (5 mins)',
      teacherActivities: [
        `Teacher leads the warm-up game "Slap the Board" using target vocabulary (${vocabText}).`,
        'Teacher writes word cards on the board, explains rules, and models two practice rounds.',
        'Teacher calls out target words and encourages active team participation.'
      ],
      pupilActivities: [
        `Pupils play "Slap the Board" in two teams (whole class & group work).`,
        'Pupils listen to teacher cues and slap the correct target word card on the board.',
        'Pupils pronounce the slapped target word in chorus.'
      ],
      expectedOutcome: `Pupils recall and pronounce target vocabulary (${vocabText}) with high motivation.`,
      evidence: `Pupils correctly identify, slap, and pronounce target word cards on the board.`,
      postLessonAdjustments: ''
    });
  }

  // Stage 2: Presentation (10 mins)
  procedures.push({
    id: 'proc_presentation',
    stageName: 'Presentation (10 mins)',
    teacherActivities: [
      `Teacher presents new vocabulary (${vocabText}) using flashcards and realia.`,
      'Teacher models pronunciation 3 times and checks pupil understanding using flashcards.',
      `Teacher introduces target sentence pattern (${patternsText}) on the board and models a dialogue with a pupil.`
    ],
    pupilActivities: [
      `Pupils look at flashcards, listen to teacher modeling, and repeat vocabulary (${vocabText}) in chorus and individually.`,
      `Pupils observe the sentence pattern (${patternsText}) on the board and repeat the model dialogue.`
    ],
    expectedOutcome: `Pupils pronounce target words (${vocabText}) correctly and understand sentence pattern structures (${patternsText}).`,
    evidence: `Pupils pronounce vocabulary accurately and repeat sentence patterns with correct intonation.`,
    postLessonAdjustments: ''
  });

  // Stage 3: Practice (12 mins)
  procedures.push({
    id: 'proc_practice',
    stageName: 'Practice (12 mins)',
    teacherActivities: [
      `Teacher organizes pair work for pupils to practise asking and answering with sentence pattern (${mainPattern}).`,
      'Teacher distributes picture prompts, models pair interaction, and monitors pairs around the class.',
      'Teacher provides immediate feedback and corrects pronunciation/grammar errors.'
    ],
    pupilActivities: [
      `Pupils work in pairs (pair work), taking turns asking and answering using picture prompts and sentence pattern (${mainPattern}).`,
      'Pupils switch roles with their partners to ensure both practise asking and answering.'
    ],
    expectedOutcome: `Pupils apply target sentence patterns (${mainPattern}) fluently in pair communication.`,
    evidence: `Pupils ask and answer target questions fluently with pair partners.`,
    postLessonAdjustments: ''
  });

  // 5. Integrations Mapping (Strict: NO Orphan Integrations)
  const finalIntegrations: IntegrationItem[] = [];

  if (input.availableIntegrations && input.availableIntegrations.length > 0) {
    input.availableIntegrations.forEach((req, idx) => {
      const defaultContent = getDefaultIntegrationSuggestion(req.type, vocabText, mainPattern);
      const customContent = req.customTeacherContent || defaultContent;
      const labelName = req.isCustomLabel ? (req.customLabelText || 'Custom Integration') : (INTEGRATION_LABEL_NAMES[req.type] || req.type);

      const intItem: IntegrationItem = {
        id: `int_${idx + 1}`,
        type: req.type as any,
        code: req.officialCode,
        wording: req.officialWording || customContent,
        official_code: req.officialCode,
        official_wording: req.officialWording,
        custom_teacher_content: customContent,
        isCustomLabel: req.isCustomLabel,
        customLabelText: req.customLabelText,
        domain: req.domain
      };
      finalIntegrations.push(intItem);

      const codeStr = req.officialCode || '';
      procedures.push({
        id: `proc_int_${idx}`,
        stageName: `Production & Integration (${labelName}${codeStr ? ` - ${codeStr}` : ''}) (5 mins)`,
        teacherActivities: [
          `Teacher introduces ${labelName} integration task: ${customContent}`,
          `Teacher guides pupils to apply target language (${vocabText} / ${mainPattern}) in the integration task.`,
          'Teacher monitors and provides constructive feedback.'
        ],
        pupilActivities: [
          `Pupils engage in ${labelName} integration activity.`,
          `Pupils perform task: ${customContent}`,
          'Pupils present their findings to the class.'
        ],
        expectedOutcome: `Pupils demonstrate ${labelName} integration competencies and apply target language appropriately.`,
        evidence: `Pupils successfully complete integration activity: ${customContent}`,
        integrationCode: codeStr,
        integrationLabel: labelName,
        postLessonAdjustments: ''
      });
    });
  }

  // Stage 4: Consolidation (3 mins)
  procedures.push({
    id: 'proc_consolidation',
    stageName: 'Consolidation & Wrap-up (3 mins)',
    teacherActivities: [
      `Teacher invites 2-3 pairs to perform their dialogue in front of the whole class.`,
      `Teacher summarizes key vocabulary (${vocabText}) and gives constructive feedback.`,
      'Teacher assigns homework and reminds pupils to practise at home.'
    ],
    pupilActivities: [
      'Pupils present dialogue before the class and listen to teacher feedback.',
      `Pupils review target words (${vocabText}) and note homework assignments.`
    ],
    expectedOutcome: 'Pupils communicate confidently using target language in front of peers.',
    evidence: 'Pupils present target dialogue clearly before the class.',
    postLessonAdjustments: ''
  });

  // 6. Specific 3-Part Post-Reflection
  const postReflection = `Pupils participated actively in the pair-work activity and used the target sentence pattern (${mainPattern}) confidently. Some pupils still had difficulty pronouncing the target vocabulary (${cleanVocab.slice(0, 2).join(', ') || 'new words'}). More guided pronunciation practice should be provided in the next lesson.`;

  // Title formatting
  const unitStr = input.unitTitle ? (input.unitTitle.startsWith('Unit') ? input.unitTitle : `Unit ${input.unitNumber || 1}: ${input.unitTitle}`) : `Unit ${input.unitNumber || 1}`;
  const lessonStr = input.lessonTitle ? (input.lessonTitle.startsWith('Lesson') ? input.lessonTitle : `Lesson ${input.lessonNumber || 1} - ${input.lessonTitle}`) : `Lesson ${input.lessonNumber || 1}`;

  return {
    teaching_program_code: input.programCode,
    grade_level: input.gradeLevel,
    unit_id: input.unitNumber ? `unit_${input.unitNumber}` : undefined,
    lesson_id: input.lessonNumber ? `lesson_${input.lessonNumber}` : undefined,
    title: `Lesson Plan Grade ${input.gradeLevel} - ${programName}`,
    unit_title: unitStr,
    lesson_title: lessonStr,
    duration_minutes: 35,
    publisher: input.programCode === 'GLOBAL_SUCCESS' ? 'VIETNAM EDUCATION PUBLISHING HOUSE' : undefined,
    vocabulary: cleanVocab.length > 0 ? cleanVocab : ['hello', 'hi', 'goodbye'],
    sentence_patterns: cleanPatterns.length > 0 ? cleanPatterns : ['How are you? - I am fine, thank you.'],
    skills: derivedSkills,
    competences_qualities_text: "Thereby contributing to the development of pupils' general competences (autonomy, communication, cooperation) and qualities (hard work, responsibility).",
    integrations: finalIntegrations,
    teaching_aids: teachingAids,
    procedures,
    post_reflection: postReflection,
    teacher_instructions: input.teacherInstructions,
    videoMetadata: activeVideoMetadata
  };
}
