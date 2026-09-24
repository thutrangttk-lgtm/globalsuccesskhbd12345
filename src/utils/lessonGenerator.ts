import type { LessonPlan, ProcedureRow, IntegrationItem } from '../types';
import { parseAndStandardizeIntegrations } from './integrationParser';
import { deduplicateIntegrations, sanitizeLessonPlanLanguage, translateVietnameseIntegrationToEnglish, isVietnameseText, generateModulePostLessonReflection } from './integrationTranslator';
import { getVocabObjective, getPatternObjective, getSkillsObjective, getCompetencesQualitiesObjective } from './objectiveGenerator';
import { selectDynamicActivity, type ActivityContextInput } from './activitySelector';


export interface LessonGenInput {
  programCode: 'GLOBAL_SUCCESS' | 'MOVE_UP' | 'ENHANCED' | 'CUSTOM';
  gradeLevel: number;
  unitNumber?: number;
  unitTitle?: string;
  topic?: string;
  lessonNumber?: number;
  lessonTitle?: string;
  itemType?: string;
  displayTitle?: string;
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

export { generateModulePostLessonReflection } from './integrationTranslator';

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
    const actCtx: ActivityContextInput = {
      gradeLevel: input.gradeLevel,
      unitNumber: input.unitNumber,
      unitTitle: input.unitTitle,
      topic: input.topic,
      lessonNumber: input.lessonNumber,
      lessonTitle: input.lessonTitle,
      vocabulary: input.vocabulary || [],
      sentencePatterns: input.sentencePatterns || [],
      phonics: input.phonics,
      skills: input.skills
    };
    const warmupAct = selectDynamicActivity('WARMUP', actCtx);
    procedures.push({
      id: 'proc_p1_warmup',
      ...warmupAct,
      stageName: `Period 1: ${warmupAct.stageName}`,
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

export function isGlobalSuccessSpecialLesson(input: LessonGenInput): boolean {
  if (input.programCode !== 'GLOBAL_SUCCESS') return false;
  const typeUpper = (input.itemType || '').toUpperCase();
  if (['REVIEW', 'FUN_TIME', 'EXTENSION', 'REVISION', 'TEST', 'TEST_REVISION', 'TEST_SEMESTER', 'STARTER', 'INTRO'].includes(typeUpper)) {
    return true;
  }
  const titleCombined = `${input.displayTitle || ''} ${input.lessonTitle || ''} ${input.unitTitle || ''}`.toLowerCase();
  return (
    titleCombined.includes('review') ||
    titleCombined.includes('fun time') ||
    titleCombined.includes('extension') ||
    titleCombined.includes('revision') ||
    titleCombined.includes('test') ||
    titleCombined.includes('correction') ||
    titleCombined.includes('làm quen') ||
    titleCombined.includes('starter')
  );
}

function getSpecialLessonType(input: LessonGenInput): 'REVIEW' | 'FUN_TIME' | 'EXTENSION' | 'REVISION' | 'TEST' | 'TEST_CORRECTION' {
  const typeUpper = (input.itemType || '').toUpperCase();
  const titleLower = `${input.displayTitle || ''} ${input.lessonTitle || ''} ${input.unitTitle || ''}`.toLowerCase();

  if (titleLower.includes('correction') || typeUpper === 'TEST_REVISION') {
    return 'TEST_CORRECTION';
  }
  if (typeUpper === 'TEST' || typeUpper === 'TEST_SEMESTER' || titleLower.includes('test')) {
    return 'TEST';
  }
  if (typeUpper === 'FUN_TIME' || titleLower.includes('fun time')) {
    return 'FUN_TIME';
  }
  if (typeUpper === 'EXTENSION' || titleLower.includes('extension')) {
    return 'EXTENSION';
  }
  if (typeUpper === 'REVISION' || titleLower.includes('revision')) {
    return 'REVISION';
  }
  return 'REVIEW';
}

function generateGlobalSuccessSpecialProcedures(
  input: LessonGenInput,
  cleanVocab: string[],
  cleanPatterns: string[],
  activeVideoMetadata?: { title: string; url: string; source: 'teacher' | 'external' }
): ProcedureRow[] {
  const specialType = getSpecialLessonType(input);
  const procedures: ProcedureRow[] = [];

  const subsetVocab = cleanVocab.length > 0 ? cleanVocab.slice(0, Math.min(5, cleanVocab.length)).join(', ') : 'reviewed vocabulary';
  const subsetPattern = cleanPatterns.length > 0 ? cleanPatterns[0] : 'target sentence pattern';

  const sourceLabel = activeVideoMetadata?.source === 'teacher'
    ? `teacher YouTube channel (${activeVideoMetadata.url})`
    : `educational YouTube resource (${activeVideoMetadata?.url})`;

  // STAGE 1: Warm-up & Lead-in (5 mins)
  if (activeVideoMetadata?.title) {
    procedures.push({
      id: 'proc_special_warmup',
      stageName: 'Warm-up & Lead-in (5 mins)',
      teacherActivities: [
        `Teacher plays video "${activeVideoMetadata.title}" from ${sourceLabel}.`,
        `Teacher asks pupils to listen/watch and identify reviewed vocabulary and sentence patterns.`,
        `Teacher elicits pupils' answers and introduces the ${specialType.replace('_', ' ')} lesson focus.`
      ],
      pupilActivities: [
        `Pupils watch/listen to "${activeVideoMetadata.title}".`,
        `Pupils identify reviewed target words and sentence patterns heard in the video.`,
        `Pupils respond to teacher questions and prepare for ${specialType.replace('_', ' ')} activities.`
      ],
      expectedOutcome: `Pupils recall reviewed language from the video and prepare for the lesson.`,
      evidence: `Pupils correctly identify reviewed target words in the video.`,
      videoMetadata: activeVideoMetadata,
      postLessonAdjustments: ''
    });
  } else {
    switch (specialType) {
      case 'FUN_TIME':
        procedures.push({
          id: 'proc_special_warmup',
          stageName: 'Warm-up & Lead-in: Mystery Picture (5 mins)',
          teacherActivities: [
            `Teacher presents a partially hidden "Mystery Picture" on the board to reveal the lesson theme.`,
            `Teacher reveals grid squares one by one and elicits target vocabulary from pupils.`,
            `Teacher praises quick guesses and introduces Fun Time activities.`
          ],
          pupilActivities: [
            `Pupils observe the mystery picture grid attentively and guess target vocabulary.`,
            `Pupils shout out guessed words and repeat target vocabulary in chorus when revealed.`,
            `Pupils prepare for game activities.`
          ],
          expectedOutcome: `Pupils get energized and identify target language enthusiastically.`,
          evidence: `Pupils guess mystery picture items correctly.`,
          postLessonAdjustments: ''
        });
        break;
      case 'EXTENSION':
        procedures.push({
          id: 'proc_special_warmup',
          stageName: 'Warm-up & Lead-in: Quick Match (5 mins)',
          teacherActivities: [
            `Teacher displays picture prompts and flashcards on the board for a "Quick Match" activity.`,
            `Teacher asks pupils to pair picture cards with key vocabulary (${subsetVocab}).`,
            `Teacher introduces the extension task topic.`
          ],
          pupilActivities: [
            `Pupils observe picture prompts and match them to target vocabulary.`,
            `Pupils raise hands to state matched pairs and repeat words in chorus.`,
            `Pupils prepare for the extension task.`
          ],
          expectedOutcome: `Pupils activate prior knowledge related to extension tasks.`,
          evidence: `Pupils match target words and respond to visual prompts.`,
          postLessonAdjustments: ''
        });
        break;
      case 'REVISION':
        procedures.push({
          id: 'proc_special_warmup',
          stageName: 'Warm-up & Knowledge Activation: Visual Speed Quiz (5 mins)',
          teacherActivities: [
            `Teacher conducts a rapid visual speed quiz using flashcards of key vocabulary.`,
            `Teacher asks pupils to recall target words and sentence structures quickly.`,
            `Teacher introduces the revision focus areas.`
          ],
          pupilActivities: [
            `Pupils participate in the visual speed quiz and recall target language quickly.`,
            `Pupils respond chorally and individually to flashcard prompts.`
          ],
          expectedOutcome: `Pupils activate memory of core language points before revision tasks.`,
          evidence: `Pupils state core vocabulary items accurately.`,
          postLessonAdjustments: ''
        });
        break;
      case 'TEST':
        procedures.push({
          id: 'proc_special_warmup',
          stageName: 'Test Preparation & Instructions (5 mins)',
          teacherActivities: [
            `Teacher arranges classroom seating for test conditions and distributes test papers.`,
            `Teacher explains test sections, rules, and time limits clearly.`
          ],
          pupilActivities: [
            `Pupils sit in assigned seats quietly and receive test papers.`,
            `Pupils listen to test instructions and prepare stationery.`
          ],
          expectedOutcome: `Pupils understand test procedures and requirements.`,
          evidence: `Pupils prepare test papers properly and follow instructions.`,
          postLessonAdjustments: ''
        });
        break;
      case 'TEST_CORRECTION':
        procedures.push({
          id: 'proc_special_warmup',
          stageName: 'Warm-up & General Feedback (5 mins)',
          teacherActivities: [
            `Teacher returns graded test papers, commends overall class effort, and highlights test strengths.`,
            `Teacher sets positive expectations for error correction and learning.`
          ],
          pupilActivities: [
            `Pupils receive graded test papers and review their test marks and feedback.`,
            `Pupils listen to teacher general feedback.`
          ],
          expectedOutcome: `Pupils understand overall test performance and approach correction positively.`,
          evidence: `Pupils review test marks and error feedback.`,
          postLessonAdjustments: ''
        });
        break;
      case 'REVIEW':
      default:
        procedures.push({
          id: 'proc_special_warmup',
          stageName: 'Warm-up & Lead-in: Pass the Ball (5 mins)',
          teacherActivities: [
            `Teacher leads a quick "Pass the Ball" game using background music to review target language.`,
            `Teacher stops music randomly and asks pupil holding the ball to recall a reviewed word or sentence pattern (${subsetPattern}).`,
            `Teacher elicits previously learnt language from pupils and introduces Review focus.`
          ],
          pupilActivities: [
            `Pupils pass the ball quickly around the class while music plays.`,
            `Pupils answer teacher prompts using reviewed sentence patterns when music pauses.`,
            `Pupils recall and use reviewed language.`
          ],
          expectedOutcome: `Pupils reactivate previously learnt language and prepare for review activities.`,
          evidence: `Pupils recall target words and sentence patterns accurately.`,
          postLessonAdjustments: ''
        });
        break;
    }
  }

  // STAGE 2: Presentation / Review / Guidance (10 mins)
  switch (specialType) {
    case 'FUN_TIME':
      procedures.push({
        id: 'proc_special_pres',
        stageName: 'Game Rules & Demonstration (10 mins)',
        teacherActivities: [
          `Teacher introduces textbook Fun Time game rules and demonstrates sample turns with a pupil volunteer.`,
          `Teacher highlights selected sentence patterns required during gameplay.`,
          `Teacher checks pupil understanding of game procedures.`
        ],
        pupilActivities: [
          `Pupils observe the game demonstration attentively.`,
          `Pupils repeat selected sentence patterns in chorus and individually.`,
          `Pupils ask clarifying questions about game rules.`
        ],
        expectedOutcome: `Pupils understand game procedures and target language requirements.`,
        evidence: `Pupils demonstrate correct game turns during modeling.`,
        postLessonAdjustments: ''
      });
      break;
    case 'EXTENSION':
      procedures.push({
        id: 'proc_special_pres',
        stageName: 'Extension Task Presentation (10 mins)',
        teacherActivities: [
          `Teacher presents textbook extension project steps and demonstrates sample extended sentence models.`,
          `Teacher sets clear success criteria for pair/group extension activities.`
        ],
        pupilActivities: [
          `Pupils review extension project instructions in their textbooks.`,
          `Pupils listen to teacher guidance and practise repeating extended sentence models.`
        ],
        expectedOutcome: `Pupils understand extension project requirements and required language.`,
        evidence: `Pupils follow project steps and repeat extended models accurately.`,
        postLessonAdjustments: ''
      });
      break;
    case 'REVISION':
      procedures.push({
        id: 'proc_special_pres',
        stageName: 'Systematic Review of Key Structures (10 mins)',
        teacherActivities: [
          `Teacher systematically reviews key sentence patterns and grammar points on the board.`,
          `Teacher clarifies common errors and models structural sentence examples.`
        ],
        pupilActivities: [
          `Pupils analyze structural patterns on the board attentively.`,
          `Pupils answer concept check questions and take notes in notebooks.`
        ],
        expectedOutcome: `Pupils consolidate key language rules and structural patterns systematically.`,
        evidence: `Pupils answer concept check questions correctly.`,
        postLessonAdjustments: ''
      });
      break;
    case 'TEST':
      procedures.push({
        id: 'proc_special_pres',
        stageName: 'Listening Assessment Section (10 mins)',
        teacherActivities: [
          `Teacher plays test audio tracks (2-3 times per task) and manages timing for listening tasks.`,
          `Teacher ensures quiet listening conditions throughout the room.`
        ],
        pupilActivities: [
          `Pupils listen attentively to audio recordings.`,
          `Pupils complete listening test items independently on their test sheets.`
        ],
        expectedOutcome: `Pupils demonstrate listening comprehension of target vocabulary and sentence patterns.`,
        evidence: `Pupils record answers for listening tasks on test sheets.`,
        postLessonAdjustments: ''
      });
      break;
    case 'TEST_CORRECTION':
      procedures.push({
        id: 'proc_special_pres',
        stageName: 'Error Analysis & Model Answers (10 mins)',
        teacherActivities: [
          `Teacher displays common test error examples on the board and elicits correct answers from pupils.`,
          `Teacher explains underlying grammar rules and vocabulary usages.`
        ],
        pupilActivities: [
          `Pupils analyze board error examples and identify why mistakes occurred.`,
          `Pupils state correct answer choices and note model answers in notebooks.`
        ],
        expectedOutcome: `Pupils understand root causes of common test errors.`,
        evidence: `Pupils explain correct answer choices during error analysis.`,
        postLessonAdjustments: ''
      });
      break;
    case 'REVIEW':
    default:
      procedures.push({
        id: 'proc_special_pres',
        stageName: 'Guided Review & Categorising (10 mins)',
        teacherActivities: [
          `Teacher reviews key vocabulary (${subsetVocab}) and sentence patterns using visual flashcards and board charts.`,
          `Teacher guides pupils to categorize reviewed words into thematic groups on the board.`,
          `Teacher models sample dialogues and checks pupil pronunciation.`
        ],
        pupilActivities: [
          `Pupils observe visual flashcards and categorize reviewed vocabulary on the board.`,
          `Pupils recall and repeat target sentence patterns in chorus and individually.`
        ],
        expectedOutcome: `Pupils systematically recall and categorize reviewed language items.`,
        evidence: `Pupils categorize reviewed words correctly on the board.`,
        postLessonAdjustments: ''
      });
      break;
  }

  // STAGE 3: Practice / Communicative Task (12 mins)
  switch (specialType) {
    case 'FUN_TIME':
      procedures.push({
        id: 'proc_special_prac',
        stageName: 'Interactive Group Gameplay (12 mins)',
        teacherActivities: [
          `Teacher divides pupils into small groups to play the language game.`,
          `Teacher circulates around the room to monitor group play and ensure target sentence patterns are used.`
        ],
        pupilActivities: [
          `Pupils play the game in groups, taking turns asking and answering with target sentence patterns.`,
          `Pupils keep score and encourage group peers.`
        ],
        expectedOutcome: `Pupils recycle vocabulary and sentence patterns naturally through gameplay.`,
        evidence: `Pupils complete game rounds using target sentence patterns accurately.`,
        postLessonAdjustments: ''
      });
      break;
    case 'EXTENSION':
      procedures.push({
        id: 'proc_special_prac',
        stageName: 'Guided Extension Practice (12 mins)',
        teacherActivities: [
          `Teacher guides pupils in pairs/groups to complete extension tasks (posters/mini-surveys/role-plays).`,
          `Teacher offers support and encourages creative language application.`
        ],
        pupilActivities: [
          `Pupils collaborate in pairs/groups using target vocabulary and extended sentence patterns.`,
          `Pupils prepare their extension project materials.`
        ],
        expectedOutcome: `Pupils apply and extend previously learnt language in creative tasks.`,
        evidence: `Pupils produce extension project work using target language.`,
        postLessonAdjustments: ''
      });
      break;
    case 'REVISION':
      procedures.push({
        id: 'proc_special_prac',
        stageName: 'Targeted Revision Exercises (12 mins)',
        teacherActivities: [
          `Teacher assigns revision exercises (matching, fill-in-the-blanks, sentence transformation).`,
          `Teacher monitors pupil progress and provides targeted guidance.`
        ],
        pupilActivities: [
          `Pupils complete revision exercises individually or in pairs, checking work with partners.`
        ],
        expectedOutcome: `Pupils solidify language accuracy and task-solving techniques.`,
        evidence: `Pupils complete revision tasks with high accuracy.`,
        postLessonAdjustments: ''
      });
      break;
    case 'TEST':
      procedures.push({
        id: 'proc_special_prac',
        stageName: 'Reading & Writing Assessment Section (12 mins)',
        teacherActivities: [
          `Teacher monitors the classroom during reading and writing test sections, maintaining quiet testing conditions.`
        ],
        pupilActivities: [
          `Pupils complete reading and writing test items independently.`
        ],
        expectedOutcome: `Pupils demonstrate reading comprehension and writing accuracy.`,
        evidence: `Pupils complete reading and writing questions on test papers.`,
        postLessonAdjustments: ''
      });
      break;
    case 'TEST_CORRECTION':
      procedures.push({
        id: 'proc_special_prac',
        stageName: 'Guided Self-Correction & Pair Discussion (12 mins)',
        teacherActivities: [
          `Teacher guides pupils to correct personal mistakes on test papers or correction sheets.`,
          `Teacher encourages peer explanations and checks corrected items.`
        ],
        pupilActivities: [
          `Pupils correct incorrect test items, discuss tricky questions with peers, and rewrite correct sentences.`
        ],
        expectedOutcome: `Pupils correct personal errors and consolidate target sentence structures.`,
        evidence: `Pupils write correct answers on test sheets.`,
        postLessonAdjustments: ''
      });
      break;
    case 'REVIEW':
    default:
      procedures.push({
        id: 'proc_special_prac',
        stageName: 'Communicative Practice & Pair Interview (12 mins)',
        teacherActivities: [
          `Teacher organizes pair work for a communicative interview task (Find Someone Who / Pair Interview).`,
          `Teacher distributes activity worksheets and models Q&A using selected sentence patterns.`,
          `Teacher monitors pair interactions around the classroom and offers immediate support.`
        ],
        pupilActivities: [
          `Pupils work in pairs to ask and answer questions using selected sentence patterns.`,
          `Pupils record peer responses on their activity worksheets.`
        ],
        expectedOutcome: `Pupils apply reviewed language fluently in communicative pair tasks.`,
        evidence: `Pupils complete interview worksheets using target sentence patterns accurately.`,
        postLessonAdjustments: ''
      });
      break;
  }

  // STAGE 4: Production / Integration / Showcase (5 mins)
  const userIntegrations = input.availableIntegrations || [];
  if (input.integration_detail_exact) {
    const parsedItems = parseAndStandardizeIntegrations(
      input.integration_name_exact,
      input.integration_code_exact,
      input.integration_detail_exact,
      cleanVocab
    );
    if (parsedItems.length > 0) {
      const p = parsedItems[0];
      let englishWording = p.wording;
      if (isVietnameseText(englishWording)) {
        englishWording = translateVietnameseIntegrationToEnglish(englishWording, { vocabulary: cleanVocab, mainPattern: subsetPattern });
      }
      procedures.push({
        id: 'proc_special_prod_int',
        stageName: `Production & Integration (${p.fullTitle}) (5 mins)`,
        teacherActivities: [
          `Teacher introduces a ${p.label} integration task: ${englishWording}`,
          `Teacher guides pupils to apply reviewed language in this task.`
        ],
        pupilActivities: [
          `Pupils engage in the ${p.label} integration activity.`,
          `Pupils perform the task: ${englishWording}`
        ],
        expectedOutcome: p.outcome && !isVietnameseText(p.outcome) ? p.outcome : englishWording,
        evidence: `Pupils complete the integration activity: ${englishWording}`,
        integrationCode: p.code,
        integrationLabel: p.fullTitle,
        postLessonAdjustments: ''
      });
    }
  } else if (userIntegrations.length > 0) {
    const req = userIntegrations[0];
    const defaultContent = getDefaultIntegrationSuggestion(req.type, subsetVocab, subsetPattern);
    let rawCustom = req.customTeacherContent || req.officialWording || defaultContent;
    if (isVietnameseText(rawCustom)) {
      rawCustom = translateVietnameseIntegrationToEnglish(rawCustom, { vocabulary: cleanVocab, mainPattern: subsetPattern });
    }
    const labelName = req.isCustomLabel ? (req.customLabelText || 'Custom Integration') : (INTEGRATION_LABEL_NAMES[req.type] || req.type);
    const codeStr = req.officialCode || '';

    procedures.push({
      id: 'proc_special_prod_int',
      stageName: `Production & Integration (${labelName}${codeStr ? ` - ${codeStr}` : ''}) (5 mins)`,
      teacherActivities: [
        `Teacher introduces a ${labelName} integration task: ${rawCustom}`,
        `Teacher guides pupils to apply reviewed language in this task.`
      ],
      pupilActivities: [
        `Pupils engage in the ${labelName} integration activity.`,
        `Pupils perform the task: ${rawCustom}`
      ],
      expectedOutcome: `Pupils demonstrate ${labelName} integration competencies and apply reviewed language appropriately.`,
      evidence: `Pupils complete the integration activity: ${rawCustom}`,
      integrationCode: codeStr,
      integrationLabel: labelName,
      postLessonAdjustments: ''
    });
  } else {
    switch (specialType) {
      case 'FUN_TIME':
        procedures.push({
          id: 'proc_special_prod',
          stageName: 'Game Showcase & Peer Appreciation (5 mins)',
          teacherActivities: [
            `Teacher invites winning groups to demonstrate sample game dialogues in front of class.`,
            `Teacher provides positive feedback and awards achievement stars.`
          ],
          pupilActivities: [
            `Pupils perform game dialogues before class and applaud peer presentations.`
          ],
          expectedOutcome: `Pupils demonstrate communicative confidence and celebrate learning achievements.`,
          evidence: `Pupils present game dialogues fluently.`,
          postLessonAdjustments: ''
        });
        break;
      case 'EXTENSION':
        procedures.push({
          id: 'proc_special_prod',
          stageName: 'Extension Showcase & Peer Feedback (5 mins)',
          teacherActivities: [
            `Teacher organizes mini-presentations for pupils to share extension projects.`,
            `Teacher facilitates peer feedback.`
          ],
          pupilActivities: [
            `Pupils present group extension projects to peers and share constructive feedback.`
          ],
          expectedOutcome: `Pupils present extended language projects confidently.`,
          evidence: `Pupils deliver short group presentations using extended sentence patterns.`,
          postLessonAdjustments: ''
        });
        break;
      case 'REVISION':
        procedures.push({
          id: 'proc_special_prod',
          stageName: 'Revision Check Quiz (5 mins)',
          teacherActivities: [
            `Teacher conducts a quick 5-item check quiz and provides immediate corrective feedback.`
          ],
          pupilActivities: [
            `Pupils complete check quiz and self-correct using teacher feedback.`
          ],
          expectedOutcome: `Pupils verify test readiness and clarify remaining doubts.`,
          evidence: `Pupils correct error items on check quiz papers.`,
          postLessonAdjustments: ''
        });
        break;
      case 'TEST':
        procedures.push({
          id: 'proc_special_prod',
          stageName: 'Speaking Check & Paper Collection (5 mins)',
          teacherActivities: [
            `Teacher conducts brief individual speaking checks or collects test papers systematically.`
          ],
          pupilActivities: [
            `Pupils respond to speaking prompts or submit test papers orderly.`
          ],
          expectedOutcome: `Pupils complete all assessment sections.`,
          evidence: `Pupils submit completed test papers.`,
          postLessonAdjustments: ''
        });
        break;
      case 'TEST_CORRECTION':
        procedures.push({
          id: 'proc_special_prod',
          stageName: 'Targeted Remedial Practice (5 mins)',
          teacherActivities: [
            `Teacher provides 2-3 short practice questions targeting frequently missed test items.`
          ],
          pupilActivities: [
            `Pupils solve practice questions independently to confirm mastery.`
          ],
          expectedOutcome: `Pupils demonstrate mastery of previously missed test items.`,
          evidence: `Pupils answer remedial practice items correctly.`,
          postLessonAdjustments: ''
        });
        break;
      case 'REVIEW':
      default:
        procedures.push({
          id: 'proc_special_prod',
          stageName: 'Application & Team Quiz Challenge (5 mins)',
          teacherActivities: [
            `Teacher conducts a quick team quiz to consolidate reviewed language.`,
            `Teacher praises team efforts and reinforces key sentence patterns.`
          ],
          pupilActivities: [
            `Pupils participate in team quiz rounds and state answers aloud.`,
            `Pupils check answer accuracy with peers.`
          ],
          expectedOutcome: `Pupils consolidate and apply reviewed language in competitive tasks.`,
          evidence: `Pupils answer team quiz questions accurately.`,
          postLessonAdjustments: ''
        });
        break;
    }
  }

  // STAGE 5: Consolidation & Wrap-up (3 mins)
  switch (specialType) {
    case 'TEST':
      procedures.push({
        id: 'proc_special_wrapup',
        stageName: 'Post-Test Wrap-up (3 mins)',
        teacherActivities: [
          `Teacher collects remaining papers, praises class concentration, and concludes test session.`
        ],
        pupilActivities: [
          `Pupils pack away test materials and return to normal classroom routine.`
        ],
        expectedOutcome: `Pupils conclude assessment session smoothly.`,
        evidence: `Pupils submit test papers and resume quiet seating.`,
        postLessonAdjustments: ''
      });
      break;
    default:
      procedures.push({
        id: 'proc_special_wrapup',
        stageName: 'Consolidation & Wrap-up (3 mins)',
        teacherActivities: [
          `Teacher summarizes key learning outcomes of today's lesson.`,
          `Teacher assigns home practice exercises in workbook.`
        ],
        pupilActivities: [
          `Pupils review main learning points covered today.`,
          `Pupils record home practice assignments in notebooks.`
        ],
        expectedOutcome: `Pupils consolidate lesson content and note home practice tasks.`,
        evidence: `Pupils state key learning points during wrap-up.`,
        postLessonAdjustments: ''
      });
      break;
  }

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
      post_reflection: generateModulePostLessonReflection(
        'MOVE_UP',
        cleanVocab,
        cleanPatterns,
        derivedSkills,
        unitStr,
        lessonStr,
        input.activities || ''
      ),
      teacher_instructions: input.teacherInstructions,
      videoMetadata: activeVideoMetadata
    };

    return sanitizeLessonPlanLanguage(moveUpPlan);
  }

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

  // Branch specifically for GLOBAL SUCCESS SPECIAL LESSONS (Review, Fun Time, Extension, Revision, Test, Test Correction)
  if (isGlobalSuccessSpecialLesson(input)) {
    const specialProcedures = generateGlobalSuccessSpecialProcedures(
      input,
      cleanVocab,
      cleanPatterns,
      activeVideoMetadata
    );

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
        finalIntegrations.push({
          id: `int_master_${idx + 1}`,
          type: p.type as any,
          code: p.code,
          wording: englishWording,
          official_code: p.code,
          official_wording: englishWording,
          custom_teacher_content: englishWording,
          isCustomLabel: true,
          customLabelText: p.fullTitle
        });
      });
    } else if (input.availableIntegrations && input.availableIntegrations.length > 0) {
      input.availableIntegrations.forEach((req, idx) => {
        const defaultContent = getDefaultIntegrationSuggestion(req.type, vocabText, mainPattern);
        let rawCustom = req.customTeacherContent || req.officialWording || defaultContent;
        if (isVietnameseText(rawCustom)) {
          rawCustom = translateVietnameseIntegrationToEnglish(rawCustom, { vocabulary: cleanVocab, mainPattern });
        }
        finalIntegrations.push({
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
        });
      });
    }

    const specialPlan: LessonPlan = {
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
      duration_minutes: 35,
      publisher: 'VIETNAM EDUCATION PUBLISHING HOUSE',
      vocabulary: cleanVocab,
      sentence_patterns: cleanPatterns,
      skills: derivedSkills,
      vocab_objective: getVocabObjective(cleanVocab, input.gradeLevel, input.itemType, input.displayTitle || input.lessonTitle || input.unitTitle),
      pattern_objective: getPatternObjective(cleanPatterns, input.gradeLevel, input.itemType, input.displayTitle || input.lessonTitle || input.unitTitle),
      skills_objective: getSkillsObjective(derivedSkills, cleanVocab, cleanPatterns),
      competences_qualities_text: getCompetencesQualitiesObjective(),
      integrations: deduplicateIntegrations(finalIntegrations),
      teaching_aids: teachingAids,
      procedures: specialProcedures,
      post_reflection: generateModulePostLessonReflection(
        input.programCode,
        cleanVocab,
        cleanPatterns,
        derivedSkills,
        unitStr,
        lessonStr,
        input.activities || '',
        input.itemType,
        input.displayTitle
      ),
      teacher_instructions: input.teacherInstructions,
      videoMetadata: activeVideoMetadata
    };

    return sanitizeLessonPlanLanguage(specialPlan);
  }

  // 4. Procedures Construction & Dynamic Activity Selection (Global Success Normal Unit Lessons & Others)
  const procedures: ProcedureRow[] = [];

  const activityCtxInput: ActivityContextInput = {
    gradeLevel: input.gradeLevel,
    unitNumber: input.unitNumber,
    unitTitle: input.unitTitle,
    topic: input.topic,
    lessonNumber: input.lessonNumber,
    lessonTitle: input.lessonTitle,
    vocabulary: cleanVocab,
    sentencePatterns: cleanPatterns,
    phonics: input.phonics,
    skills: derivedSkills,
    durationMinutes: input.durationMinutes
  };

  if (matchedTitle) {
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
    const warmupAct = selectDynamicActivity('WARMUP', activityCtxInput);
    procedures.push({
      id: 'proc_warmup',
      ...warmupAct,
      postLessonAdjustments: ''
    });
  }

  // Stage 2: Presentation (10 mins)
  const presAct = selectDynamicActivity('PRESENTATION', activityCtxInput);
  procedures.push({
    id: 'proc_presentation',
    ...presAct,
    postLessonAdjustments: ''
  });

  // Stage 3: Practice (12 mins)
  const pracAct = selectDynamicActivity('PRACTICE', activityCtxInput);
  procedures.push({
    id: 'proc_practice',
    ...pracAct,
    postLessonAdjustments: ''
  });

  // 5. Integrations Mapping
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
  } else {
    const prodAct = selectDynamicActivity('PRODUCTION', activityCtxInput);
    procedures.push({
      id: 'proc_production',
      ...prodAct,
      postLessonAdjustments: ''
    });
  }

  // Stage 5: Consolidation (3 mins)
  const consolAct = selectDynamicActivity('CONSOLIDATION', activityCtxInput);
  procedures.push({
    id: 'proc_consolidation',
    ...consolAct,
    postLessonAdjustments: ''
  });

  // 6. Specific Post-Reflection (Exactly 2 short English sentences)
  const postReflection = generateModulePostLessonReflection(
    input.programCode,
    cleanVocab,
    cleanPatterns,
    derivedSkills,
    unitStr,
    lessonStr,
    input.activities || '',
    input.itemType,
    input.displayTitle
  );

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
    vocab_objective: getVocabObjective(cleanVocab, input.gradeLevel, input.itemType, input.displayTitle || input.lessonTitle || input.unitTitle),
    pattern_objective: getPatternObjective(cleanPatterns, input.gradeLevel, input.itemType, input.displayTitle || input.lessonTitle || input.unitTitle),
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
