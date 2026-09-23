import type { LessonPlan, ProcedureRow, IntegrationItem } from '../types';
import { parseAndStandardizeIntegrations } from './integrationParser';
import { deduplicateIntegrations, sanitizeLessonPlanLanguage, translateVietnameseIntegrationToEnglish, isVietnameseText } from './integrationTranslator';
import { getVocabObjective, getPatternObjective, getSkillsObjective, getCompetencesQualitiesObjective } from './objectiveGenerator';

export interface LessonGenInput {
  programCode: 'GLOBAL_SUCCESS' | 'MOVE_UP' | 'ENHANCED' | 'CUSTOM';
  gradeLevel: number;
  unitNumber?: number;
  unitTitle?: string;
  topic?: string;
  lessonNumber?: number;
  lessonTitle?: string;
  weekNumber?: number;
  lessonPlanLabel?: string;
  sourcePeriods?: string;
  pages?: string;
  durationMinutes?: number;
  phonics?: string | null;
  vocabulary: string[];
  sentencePatterns: string[];
  skills?: string[];
  rawVocabulary?: string | null;
  rawSentencePatterns?: string | null;
  activities?: string | null;
  learningOutcomes?: string | null;
  integration_name_exact?: string | null;
  integration_code_exact?: string | null;
  integration_detail_exact?: string | null;
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

export function hasValidPhonics(phonics?: string | null): boolean {
  if (!phonics || typeof phonics !== 'string') return false;
  const trimmed = phonics.trim();
  if (!trimmed) return false;
  if (/no (dedicated|new) (phonics|sound)/i.test(trimmed)) return false;
  return true;
}

function generateMoveUpProcedures(
  input: LessonGenInput,
  vocabText: string,
  mainPattern: string,
  patternsText: string,
  activeVideoMetadata?: { title: string; url: string; source: 'teacher' | 'external' }
): ProcedureRow[] {
  const procedures: ProcedureRow[] = [];
  const activityList = (input.activities || '')
    .split(/;/)
    .map(a => a.trim())
    .filter(Boolean);

  const act1 = (activityList[0] || 'Sing and learn the lesson content').replace(/\.$/, '');
  const act2 = (activityList[1] || 'Listen and repeat').replace(/\.$/, '');
  const act3 = (activityList[2] || 'Perform classroom actions and practice target skills').replace(/\.$/, '');
  const act4 = (activityList[3] || 'Practice and production in groups').replace(/\.$/, '');

  const vocabSummary = input.rawVocabulary || vocabText;
  const patternSummary = input.rawSentencePatterns || patternsText;
  const sourceLabel = activeVideoMetadata?.source === 'teacher'
    ? `teacher YouTube channel (${activeVideoMetadata.url})`
    : `educational YouTube resource (${activeVideoMetadata?.url})`;

  // Period 1 (35 mins total)
  // Stage 1: Warm-up & Lead-in (5 mins)
  if (activeVideoMetadata?.title) {
    procedures.push({
      id: 'proc_p1_warmup',
      stageName: 'Period 1: Warm-up & Lead-in (5 mins)',
      teacherActivities: [
        `Teacher plays video "${activeVideoMetadata.title}" from ${sourceLabel}.`,
        `Teacher asks pupils to listen/watch and identify target language from the textbook unit.`,
        'Teacher elicits pupils\' answers and introduces Period 1.'
      ],
      pupilActivities: [
        `Pupils watch/listen to "${activeVideoMetadata.title}".`,
        `Pupils identify target words and sentence patterns heard in the video.`,
        'Pupils respond to teacher questions and prepare for Period 1.'
      ],
      expectedOutcome: 'Pupils recall target concepts and prepare for Period 1 learning.',
      evidence: 'Pupils correctly identify target language in the video.',
      videoMetadata: activeVideoMetadata,
      postLessonAdjustments: ''
    });
  } else {
    procedures.push({
      id: 'proc_p1_warmup',
      stageName: 'Period 1: Warm-up & Lead-in (5 mins)',
      teacherActivities: [
        `Teacher greets the class and leads a short warm-up activity for ${input.unitTitle || 'the lesson'}.`,
        `Teacher shows textbook pages ${input.pages || ''} and introduces the lesson title "${input.lessonTitle}".`,
        'Teacher outlines Period 1 learning goals.'
      ],
      pupilActivities: [
        `Pupils greet the teacher and open textbook pages ${input.pages || ''}.`,
        'Pupils listen to teacher guidance and prepare for Period 1 activities.'
      ],
      expectedOutcome: 'Pupils activate prior knowledge and prepare for Period 1.',
      evidence: 'Pupils open textbooks and respond actively to warm-up prompts.',
      postLessonAdjustments: ''
    });
  }

  // Stage 2: Period 1 Presentation (10 mins)
  procedures.push({
    id: 'proc_p1_pres',
    stageName: `Period 1: Presentation - ${act1} (10 mins)`,
    teacherActivities: [
      `Teacher introduces textbook Activity 1: "${act1}".`,
      `Teacher presents target vocabulary (${vocabSummary}) using textbook illustrations and flashcards.`,
      `Teacher models pronunciation clearly and checks pupil comprehension.`
    ],
    pupilActivities: [
      `Pupils look at textbook Activity 1: "${act1}".`,
      `Pupils listen carefully and repeat target vocabulary (${vocabSummary}) in chorus and individually.`,
      `Pupils identify target picture words in their textbooks.`
    ],
    expectedOutcome: `Pupils recognize and pronounce target words (${vocabSummary}) accurately.`,
    evidence: `Pupils correctly pronounce target vocabulary during Activity 1.`,
    postLessonAdjustments: ''
  });

  // Stage 3: Period 1 Guided Practice (15 mins)
  procedures.push({
    id: 'proc_p1_practice',
    stageName: `Period 1: Guided Practice - ${act2} (15 mins)`,
    teacherActivities: [
      `Teacher guides pupils through textbook Activity 2: "${act2}".`,
      `Teacher plays audio tracks / models sentence structures (${patternSummary}) step by step.`,
      `Teacher monitors pupils around the room and provides immediate feedback.`
    ],
    pupilActivities: [
      `Pupils perform textbook Activity 2: "${act2}" individually or in pairs.`,
      `Pupils practise target language (${patternSummary}) according to textbook instructions.`,
      `Pupils follow teacher feedback to correct pronunciation and physical responses.`
    ],
    expectedOutcome: `Pupils apply target language in textbook Activity 2 accurately.`,
    evidence: `Pupils complete textbook Activity 2 tasks correctly.`,
    postLessonAdjustments: ''
  });

  // Stage 4: Period 1 Consolidation (5 mins)
  procedures.push({
    id: 'proc_p1_consolidation',
    stageName: 'Period 1: Consolidation & Wrap-up (5 mins)',
    teacherActivities: [
      `Teacher summarizes key vocabulary and language points covered in Period 1.`,
      `Teacher praises active pupils and prepares the class for Period 2.`
    ],
    pupilActivities: [
      `Pupils review target words covered in Period 1.`,
      `Pupils answer quick review questions from the teacher.`
    ],
    expectedOutcome: 'Pupils consolidate key language points learned in Period 1.',
    evidence: 'Pupils demonstrate target language from Period 1.',
    postLessonAdjustments: ''
  });

  // Period 2 (35 mins total)
  // Stage 5: Period 2 Warm-up & Review (5 mins)
  procedures.push({
    id: 'proc_p2_warmup',
    stageName: 'Period 2: Warm-up & Review (5 mins)',
    teacherActivities: [
      `Teacher leads a quick review of Period 1 content using oral prompts and flashcards.`,
      `Teacher introduces the focus of Period 2 (${input.lessonTitle}).`
    ],
    pupilActivities: [
      `Pupils recall target vocabulary and language structures from Period 1.`,
      `Pupils prepare for Period 2 activities.`
    ],
    expectedOutcome: 'Pupils reactivate prior knowledge and get ready for Period 2.',
    evidence: 'Pupils answer review questions promptly.',
    postLessonAdjustments: ''
  });

  // Stage 6: Period 2 Presentation & Practice (10 mins)
  const phonicsText = hasValidPhonics(input.phonics) ? ` & Phonics (${input.phonics})` : '';
  procedures.push({
    id: 'proc_p2_pres',
    stageName: `Period 2: Presentation & Practice - ${act3}${phonicsText} (10 mins)`,
    teacherActivities: [
      `Teacher introduces Period 2 content using textbook Activity 3: "${act3}"${phonicsText}.`,
      `Teacher demonstrates activity procedures and models target responses clearly.`
    ],
    pupilActivities: [
      `Pupils follow textbook Activity 3: "${act3}"${phonicsText}.`,
      `Pupils perform the activity step by step under teacher guidance.`
    ],
    expectedOutcome: `Pupils master Period 2 target language and textbook Activity 3.`,
    evidence: `Pupils complete textbook Activity 3 accurately.`,
    postLessonAdjustments: ''
  });

  // Handle Integrations (if user opted-in)
  const userIntegrations = input.availableIntegrations || [];
  let p2PracticeMins = 15;
  if (userIntegrations.length > 0) {
    p2PracticeMins = Math.max(5, 15 - userIntegrations.length * 5);
  }

  // Stage 7: Period 2 Practice & Production
  procedures.push({
    id: 'proc_p2_production',
    stageName: `Period 2: Practice & Production (${p2PracticeMins} mins)`,
    teacherActivities: [
      `Teacher organizes group or pair work for pupils to apply lesson content (${act4}).`,
      `Teacher encourages pupils to demonstrate classroom actions or language patterns independently.`,
      `Teacher monitors interaction and offers constructive support.`
    ],
    pupilActivities: [
      `Pupils work in groups or pairs to perform textbook tasks and demonstrate language skills.`,
      `Pupils present their work or perform actions in front of peers.`
    ],
    expectedOutcome: 'Pupils apply target language confidently in communicative tasks.',
    evidence: 'Pupils perform target tasks fluently during group/pair practice.',
    postLessonAdjustments: ''
  });

  // Insert Integration stages if opted-in
  if (userIntegrations.length > 0) {
    userIntegrations.forEach((req, idx) => {
      const labelName = req.isCustomLabel ? (req.customLabelText || 'Custom Integration') : (INTEGRATION_LABEL_NAMES[req.type] || req.type);
      const codeStr = req.officialCode || '';
      const customWording = req.customTeacherContent || req.officialWording || getDefaultIntegrationSuggestion(req.type, vocabText, mainPattern);

      procedures.push({
        id: `proc_p2_int_${idx}`,
        stageName: `Period 2: Integration (${labelName}${codeStr ? ` - ${codeStr}` : ''}) (5 mins)`,
        teacherActivities: [
          `Teacher introduces a ${labelName} integration activity: ${customWording}`,
          `Teacher guides pupils to apply target lesson content in this integration task.`
        ],
        pupilActivities: [
          `Pupils engage in the ${labelName} integration activity.`,
          `Pupils perform the task: ${customWording}`
        ],
        expectedOutcome: `Pupils demonstrate ${labelName} integration competencies.`,
        evidence: `Pupils complete the integration activity: ${customWording}`,
        integrationCode: codeStr,
        integrationLabel: labelName,
        postLessonAdjustments: ''
      });
    });
  }

  // Stage 8: Period 2 Consolidation & Wrap-up (5 mins)
  procedures.push({
    id: 'proc_p2_wrapup',
    stageName: 'Period 2: Consolidation & Wrap-up (5 mins)',
    teacherActivities: [
      `Teacher summarizes the 70-minute lesson (Periods ${input.sourcePeriods || '1 & 2'}).`,
      `Teacher praises pupil efforts and assigns home practice / workbook tasks.`
    ],
    pupilActivities: [
      `Pupils review overall lesson achievements.`,
      `Pupils note home practice tasks.`
    ],
    expectedOutcome: 'Pupils consolidate 70-minute lesson content and know home practice tasks.',
    evidence: 'Pupils state key learning points and record homework.',
    postLessonAdjustments: ''
  });

  return procedures;
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

  const matchedTitle = (input.matchedVideoTitle || '').trim();
  const matchedUrl = (input.matchedVideoUrl || input.youtubeChannelUrl || '').trim();
  const videoSource = input.matchedVideoSource || 'teacher';

  let activeVideoMetadata: { title: string; url: string; source: 'teacher' | 'external' } | undefined = undefined;
  if (matchedTitle) {
    activeVideoMetadata = {
      title: matchedTitle,
      url: matchedUrl,
      source: videoSource
    };
  }

  // Branch specifically for MOVE UP
  if (input.programCode === 'MOVE_UP') {
    const moveUpProcedures = generateMoveUpProcedures(
      input,
      vocabText,
      mainPattern,
      patternsText,
      activeVideoMetadata
    );

    const finalIntegrations: IntegrationItem[] = [];
    if (input.availableIntegrations && input.availableIntegrations.length > 0) {
      input.availableIntegrations.forEach((req, idx) => {
        const defaultContent = getDefaultIntegrationSuggestion(req.type, vocabText, mainPattern);
        let rawCustom = req.customTeacherContent || req.officialWording || defaultContent;
        if (isVietnameseText(rawCustom)) {
          rawCustom = translateVietnameseIntegrationToEnglish(rawCustom, { vocabulary: cleanVocab, mainPattern });
        }
        const intItem: IntegrationItem = {
          id: `int_${idx + 1}`,
          type: req.type as any,
          code: req.officialCode,
          wording: rawCustom,
          official_code: req.officialCode,
          official_wording: req.officialWording ? (isVietnameseText(req.officialWording) ? translateVietnameseIntegrationToEnglish(req.officialWording) : req.officialWording) : undefined,
          custom_teacher_content: rawCustom,
          isCustomLabel: req.isCustomLabel,
          customLabelText: req.customLabelText,
          domain: req.domain
        };
        finalIntegrations.push(intItem);
      });
    }

    let unitStr = input.unitTitle ? input.unitTitle.trim().toUpperCase() : 'STARTER UNIT';
    let lessonStr = input.lessonTitle ? input.lessonTitle.trim().toUpperCase() : 'LESSON 1';

    const rawVocabStr = input.rawVocabulary || cleanVocab.join(', ');
    const rawPatternStr = input.rawSentencePatterns || cleanPatterns.join('; ');
    const rawOutcomeStr = input.learningOutcomes || getSkillsObjective(derivedSkills, cleanVocab, cleanPatterns);

    const moveUpPlan: LessonPlan = {
      teaching_program_code: 'MOVE_UP',
      grade_level: input.gradeLevel,
      unit_id: input.unitNumber ? `unit_${input.unitNumber}` : undefined,
      lesson_id: input.lessonNumber ? `lesson_${input.lessonNumber}` : undefined,
      title: `Lesson Plan Grade ${input.gradeLevel} - MOVE UP`,
      unit_title: unitStr,
      lesson_title: lessonStr,
      week_number: input.weekNumber,
      lesson_plan_label: input.lessonPlanLabel,
      source_periods: input.sourcePeriods,
      pages: input.pages,
      duration_minutes: 70,
      vocabulary: cleanVocab,
      sentence_patterns: cleanPatterns,
      phonics: input.phonics || null,
      vocabulary_text: rawVocabStr,
      sentence_patterns_text: rawPatternStr,
      learning_outcomes_text: rawOutcomeStr,
      activities_text: input.activities || null,
      skills: derivedSkills,
      vocab_objective: rawVocabStr,
      pattern_objective: rawPatternStr,
      skills_objective: rawOutcomeStr,
      competences_qualities_text: getCompetencesQualitiesObjective(),
      integrations: deduplicateIntegrations(finalIntegrations),
      teaching_aids: teachingAids,
      procedures: moveUpProcedures,
      post_reflection: "Teacher's reflection after the lesson: ____________________________________________________________________________________________________",
      teacher_instructions: input.teacherInstructions,
      videoMetadata: activeVideoMetadata
    };

    return sanitizeLessonPlanLanguage(moveUpPlan);
  }

  // 4. Procedures Construction & Specific Warm-up (Global Success & Others)
  const procedures: ProcedureRow[] = [];

  if (matchedTitle) {
    // Verified matching video exists (Teacher channel or External resource)
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

  // 5. Integrations Mapping (Strict: Authoritative Master Integration Preserved & 100% English)
  const finalIntegrations: IntegrationItem[] = [];

  if (input.integration_detail_exact) {
    const parsedItems = parseAndStandardizeIntegrations(
      input.integration_name_exact,
      input.integration_code_exact,
      input.integration_detail_exact,
      cleanVocab
    );

    parsedItems.forEach((p, idx) => {
      let englishWording = p.wording;
      if (isVietnameseText(englishWording)) {
        englishWording = translateVietnameseIntegrationToEnglish(englishWording, { vocabulary: cleanVocab, mainPattern });
      }

      const intItem: IntegrationItem = {
        id: `int_master_${idx + 1}`,
        type: p.type as any,
        code: p.code,
        wording: englishWording,
        official_code: p.code,
        official_wording: englishWording,
        custom_teacher_content: englishWording,
        isCustomLabel: true,
        customLabelText: p.fullTitle
      };
      finalIntegrations.push(intItem);

      const cleanWordingPrefix = englishWording.toLowerCase().startsWith('encourage') || englishWording.toLowerCase().startsWith('raise') || englishWording.toLowerCase().startsWith('guide')
        ? englishWording.charAt(0).toLowerCase() + englishWording.slice(1)
        : englishWording;

      procedures.push({
        id: `proc_int_master_${idx + 1}`,
        stageName: `Production & Integration (${p.fullTitle}) (5 mins)`,
        teacherActivities: [
          `Teacher introduces a ${p.label} integration activity to ${cleanWordingPrefix}`,
          `Teacher guides pupils to apply target language (${vocabText} / ${mainPattern}) in the activity.`,
          'Teacher monitors and provides constructive feedback.'
        ],
        pupilActivities: [
          `Pupils engage in the ${p.label} integration activity.`,
          `Pupils perform the activity: ${englishWording}`,
          'Pupils present their findings to the class.'
        ],
        expectedOutcome: p.outcome && !isVietnameseText(p.outcome) ? p.outcome : englishWording,
        evidence: `Pupils successfully complete the integration activity: ${englishWording}`,
        integrationCode: p.code,
        integrationLabel: p.fullTitle,
        postLessonAdjustments: ''
      });
    });
  } else if (input.availableIntegrations && input.availableIntegrations.length > 0) {
    input.availableIntegrations.forEach((req, idx) => {
      const defaultContent = getDefaultIntegrationSuggestion(req.type, vocabText, mainPattern);
      let rawCustom = req.customTeacherContent || req.officialWording || defaultContent;
      if (isVietnameseText(rawCustom)) {
        rawCustom = translateVietnameseIntegrationToEnglish(rawCustom, { vocabulary: cleanVocab, mainPattern });
      }

      const labelName = req.isCustomLabel ? (req.customLabelText || 'Custom Integration') : (INTEGRATION_LABEL_NAMES[req.type] || req.type);

      const intItem: IntegrationItem = {
        id: `int_${idx + 1}`,
        type: req.type as any,
        code: req.officialCode,
        wording: rawCustom,
        official_code: req.officialCode,
        official_wording: req.officialWording ? (isVietnameseText(req.officialWording) ? translateVietnameseIntegrationToEnglish(req.officialWording) : req.officialWording) : undefined,
        custom_teacher_content: rawCustom,
        isCustomLabel: req.isCustomLabel,
        customLabelText: req.customLabelText,
        domain: req.domain
      };
      finalIntegrations.push(intItem);

      const codeStr = req.officialCode || '';
      const cleanCustomPrefix = rawCustom.toLowerCase().startsWith('encourage') || rawCustom.toLowerCase().startsWith('raise') || rawCustom.toLowerCase().startsWith('guide')
        ? rawCustom.charAt(0).toLowerCase() + rawCustom.slice(1)
        : rawCustom;

      procedures.push({
        id: `proc_int_${idx}`,
        stageName: `Production & Integration (${labelName}${codeStr ? ` - ${codeStr}` : ''}) (5 mins)`,
        teacherActivities: [
          `Teacher introduces a ${labelName} integration activity to ${cleanCustomPrefix}`,
          `Teacher guides pupils to apply target language (${vocabText} / ${mainPattern}) in the integration activity.`,
          'Teacher monitors and provides constructive feedback.'
        ],
        pupilActivities: [
          `Pupils engage in the ${labelName} integration activity.`,
          `Pupils perform the activity: ${rawCustom}`,
          'Pupils present their findings to the class.'
        ],
        expectedOutcome: `Pupils demonstrate ${labelName} integration competencies and apply target language appropriately.`,
        evidence: `Pupils successfully complete the integration activity: ${rawCustom}`,
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

  // Title formatting - Strict rules: Never duplicate "UNIT X:" or "LESSON Y"
  let unitStr = '';
  if (input.unitTitle) {
    const upper = input.unitTitle.trim().toUpperCase();
    if (upper.startsWith('UNIT')) {
      unitStr = upper;
    } else if (input.unitNumber) {
      unitStr = `UNIT ${input.unitNumber}: ${upper}`;
    } else {
      unitStr = upper;
    }
  } else if (input.unitNumber) {
    unitStr = `UNIT ${input.unitNumber}`;
  } else {
    unitStr = 'UNIT 1';
  }

  let lessonStr = '';
  if (input.lessonTitle) {
    const upperLesson = input.lessonTitle.trim().toUpperCase();
    if (upperLesson.startsWith('LESSON')) {
      lessonStr = upperLesson;
    } else if (input.lessonNumber) {
      lessonStr = `LESSON ${input.lessonNumber}`;
    } else {
      lessonStr = upperLesson;
    }
  } else if (input.lessonNumber) {
    lessonStr = `LESSON ${input.lessonNumber}`;
  } else {
    lessonStr = 'LESSON 1';
  }

  const durationMinutes = input.durationMinutes || 35;

  const rawPlan: LessonPlan = {
    teaching_program_code: input.programCode,
    grade_level: input.gradeLevel,
    unit_id: input.unitNumber ? `unit_${input.unitNumber}` : undefined,
    lesson_id: input.lessonNumber ? `lesson_${input.lessonNumber}` : undefined,
    title: `Lesson Plan Grade ${input.gradeLevel} - ${programName}`,
    unit_title: unitStr,
    lesson_title: lessonStr,
    week_number: input.weekNumber,
    lesson_plan_label: input.lessonPlanLabel,
    source_periods: input.sourcePeriods,
    pages: input.pages,
    duration_minutes: durationMinutes,
    publisher: input.programCode === 'GLOBAL_SUCCESS' ? 'VIETNAM EDUCATION PUBLISHING HOUSE' : undefined,
    vocabulary: cleanVocab,
    sentence_patterns: cleanPatterns,
    skills: derivedSkills,
    vocab_objective: getVocabObjective(cleanVocab, input.gradeLevel),
    pattern_objective: getPatternObjective(cleanPatterns, input.gradeLevel),
    skills_objective: getSkillsObjective(derivedSkills, cleanVocab, cleanPatterns),
    competences_qualities_text: getCompetencesQualitiesObjective(),
    integrations: deduplicateIntegrations(finalIntegrations),
    teaching_aids: teachingAids,
    procedures,
    post_reflection: postReflection,
    teacher_instructions: input.teacherInstructions,
    videoMetadata: activeVideoMetadata
  };

  return sanitizeLessonPlanLanguage(rawPlan);
}
