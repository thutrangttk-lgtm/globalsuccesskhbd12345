import type { ProcedureRow } from '../types';

export type ActivityStage = 'WARMUP' | 'PRESENTATION' | 'PRACTICE' | 'PRODUCTION' | 'CONSOLIDATION';

export interface ActivityContextInput {
  gradeLevel: number;
  unitNumber?: number;
  unitTitle?: string;
  topic?: string;
  lessonNumber?: number;
  lessonTitle?: string;
  vocabulary: string[];
  sentencePatterns: string[];
  phonics?: string | null;
  skills?: string[];
  durationMinutes?: number;
}

export interface ActivityTemplate {
  id: string;
  name: string;
  category: 'MOVEMENT' | 'VISUAL' | 'GAME' | 'INTERACTIVE' | 'CREATIVE' | 'LISTENING_SPEAKING';
  suitableStages: ActivityStage[];
  minGrade?: number;
  maxGrade?: number;
  matchKeywords?: string[];
  generateProcedure: (input: ActivityContextInput, vocabText: string, mainPattern: string, patternsText: string) => Omit<ProcedureRow, 'id' | 'postLessonAdjustments'>;
}

// ----------------------------------------------------------------------
// CONTENT CATEGORY DETECTOR
// ----------------------------------------------------------------------
function detectContentType(input: ActivityContextInput): 'ACTIONS' | 'VISUAL_NOUNS' | 'QA_PATTERNS' | 'PHONICS' | 'GENERAL' {
  const combined = [...input.vocabulary, ...input.sentencePatterns, input.topic || '', input.lessonTitle || ''].join(' ').toLowerCase();

  const actionKeywords = ['run', 'jump', 'swim', 'dance', 'sing', 'cook', 'play', 'walk', 'fly', 'draw', 'write', 'read', 'climb', 'skip', 'hop', 'listen', 'look', 'open', 'close', 'touch', 'stand', 'sit'];
  if (actionKeywords.some(kw => combined.includes(kw))) {
    return 'ACTIONS';
  }

  if (input.phonics && input.phonics.trim().length > 0 && !/no (dedicated|new) (phonics|sound)/i.test(input.phonics)) {
    return 'PHONICS';
  }

  const qaKeywords = ['what', 'where', 'who', 'when', 'why', 'how', 'do you', 'can you', 'is this', 'are these', 'would you'];
  if (qaKeywords.some(kw => combined.includes(kw))) {
    return 'QA_PATTERNS';
  }

  return 'VISUAL_NOUNS';
}

// ----------------------------------------------------------------------
// WARM-UP ACTIVITIES (16 Diverse Activities)
// ----------------------------------------------------------------------
const WARMUP_ACTIVITIES: ActivityTemplate[] = [
  {
    id: 'warmup_kims_game',
    name: "Kim's Game",
    category: 'VISUAL',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText) => ({
      stageName: 'Warm-up & Lead-in: Kim\'s Game (5 mins)',
      teacherActivities: [
        `Teacher displays 6-8 picture flashcards of target vocabulary (${vocabText}) on the board for 10 seconds.`,
        'Teacher asks pupils to memorize all items, then turns off screen or covers board cards.',
        'Teacher asks pupils to recall and name as many target words as possible within 1 minute.'
      ],
      pupilActivities: [
        `Pupils observe target picture cards (${vocabText}) attentively for 10 seconds.`,
        'Pupils work in 2 teams to recall and write/say the target vocabulary items from memory.',
        'Pupils pronounce target words in chorus as teacher reveals the cards.'
      ],
      expectedOutcome: `Pupils activate prior memory and pronounce target vocabulary (${vocabText}) accurately.`,
      evidence: `Pupils correctly identify and recall target word cards from memory.`
    })
  },
  {
    id: 'warmup_mystery_picture',
    name: 'Mystery Picture Quiz',
    category: 'VISUAL',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText) => ({
      stageName: 'Warm-up & Lead-in: Mystery Picture Quiz (5 mins)',
      teacherActivities: [
        `Teacher shows a partially covered or zoomed-in picture of target vocabulary (${vocabText}) on the board.`,
        'Teacher reveals 1 grid square at a time and asks: "What is it?" or "What can you see?"',
        'Teacher rewards the fastest pupil/team to guess correctly and introduces the lesson topic.'
      ],
      pupilActivities: [
        `Pupils look closely at the mystery picture grid on the board.`,
        `Pupils shout out or raise hands to guess the target vocabulary item (${vocabText}).`,
        'Pupils repeat the target word with proper pronunciation when revealed.'
      ],
      expectedOutcome: `Pupils stay highly focused and identify target vocabulary (${vocabText}) with enthusiasm.`,
      evidence: `Pupils correctly guess target pictures and chant vocabulary words.`
    })
  },
  {
    id: 'warmup_simon_says',
    name: 'Simon Says',
    category: 'MOVEMENT',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText) => ({
      stageName: 'Warm-up & Lead-in: Simon Says (5 mins)',
      teacherActivities: [
        `Teacher leads the physical movement game "Simon Says" using target actions/words (${vocabText}).`,
        'Teacher gives instructions: "Simon says: [Action]" (pupils do action) or "[Action]" (pupils stay still).',
        'Teacher gradually speeds up prompts and congratulates surviving pupils.'
      ],
      pupilActivities: [
        `Pupils stand up and listen carefully to teacher commands.`,
        `Pupils perform actions when "Simon says" is heard and maintain freeze position otherwise.`,
        `Pupils say target words (${vocabText}) aloud while performing matching actions.`
      ],
      expectedOutcome: `Pupils energize through movement and demonstrate physical comprehension of target vocabulary.`,
      evidence: `Pupils follow physical action instructions quickly and correctly.`
    })
  },
  {
    id: 'warmup_pass_the_ball',
    name: 'Pass the Ball',
    category: 'GAME',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, _vocabText, mainPattern) => ({
      stageName: 'Warm-up & Lead-in: Pass the Ball (5 mins)',
      teacherActivities: [
        `Teacher plays upbeat background music while pupils pass a soft ball around the classroom.`,
        'Teacher pauses music randomly; the pupil holding the ball answers a teacher prompt or asks a classmate using target pattern.',
        `Teacher guides Q&A with sentence pattern (${mainPattern}).`
      ],
      pupilActivities: [
        `Pupils pass the soft ball quickly to peers while music plays.`,
        `When music stops, pupil holding ball answers teacher prompt or asks peer using target pattern (${mainPattern}).`,
        'Whole class listens and repeats answer in chorus.'
      ],
      expectedOutcome: `Pupils interact enthusiastically and practise target sentence structure (${mainPattern}).`,
      evidence: `Pupils respond fluently to Q&A prompts when holding the ball.`
    })
  },
  {
    id: 'warmup_whispering_game',
    name: 'Whispering Telephone',
    category: 'LISTENING_SPEAKING',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Warm-up & Lead-in: Whispering Telephone (5 mins)',
      teacherActivities: [
        `Teacher arranges pupils into 3-4 line rows.`,
        `Teacher whispers a target word (${vocabText}) or sentence pattern (${mainPattern}) to the first pupil in each line.`,
        'Teacher cues pupils to whisper down the line; the last pupil writes or speaks the word at the board.'
      ],
      pupilActivities: [
        `First pupils in line listen to teacher's secret whisper.`,
        `Pupils carefully whisper target language down the line to team partners.`,
        'Last pupil in line says the sentence aloud or selects the matching picture card.'
      ],
      expectedOutcome: `Pupils develop acute listening skills and pronounce target words accurately under team cooperation.`,
      evidence: `Last pupils successfully deliver exact target sentence/word.`
    })
  },
  {
    id: 'warmup_charades_mime',
    name: 'Charades & Mime Guess',
    category: 'MOVEMENT',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText) => ({
      stageName: 'Warm-up & Lead-in: Charades & Mime Guess (5 mins)',
      teacherActivities: [
        `Teacher invites 1 representative from Team A to front of class and shows secret flashcard (${vocabText}).`,
        'Teacher instructs pupil to mime target word without speaking.',
        'Teacher encourages class/team members to guess using target phrases.'
      ],
      pupilActivities: [
        `Volunteer pupil mimes body actions/gestures representing the secret word (${vocabText}).`,
        `Classmates watch mimes closely and call out target vocabulary guesses.`,
        'Team earning correct guess chorally repeats target phrase.'
      ],
      expectedOutcome: `Pupils connect physical gestures with target English vocabulary naturally.`,
      evidence: `Pupils identify target words from peer mimes within 15 seconds.`
    })
  },
  {
    id: 'warmup_picture_quiz',
    name: 'Flashcard Speed Quiz',
    category: 'VISUAL',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText) => ({
      stageName: 'Warm-up & Lead-in: Flashcard Speed Quiz (5 mins)',
      teacherActivities: [
        `Teacher flashes picture cards (${vocabText}) quickly (1 second per card) in front of the class.`,
        'Teacher asks pupils to raise hands and state the target word seen.',
        'Teacher praises quick visual recognition and awards team points.'
      ],
      pupilActivities: [
        `Pupils track flashcards attentively as teacher flips through them quickly.`,
        `Pupils raise hands to name target visual cards (${vocabText}) rapidly.`,
        'Pupils repeat target vocabulary in chorus to consolidate recognition.'
      ],
      expectedOutcome: `Pupils build high speed word-picture recognition skills.`,
      evidence: `Pupils identify target visual cards immediately on flash.`
    })
  },
  {
    id: 'warmup_stand_up_if',
    name: 'Stand Up If...',
    category: 'MOVEMENT',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, _vocabText, mainPattern) => ({
      stageName: 'Warm-up & Lead-in: Stand Up If... (5 mins)',
      teacherActivities: [
        `Teacher makes statements using target vocabulary/patterns: "Stand up if you [like/have/can...] (${_vocabText})".`,
        'Teacher asks standing pupils to chant target pattern in chorus before sitting back down.'
      ],
      pupilActivities: [
        `Pupils listen to teacher prompts carefully while seated.`,
        `Pupils stand up quickly if statement applies to them and chant target phrase (${mainPattern}).`,
        'Seated pupils check peer responses and repeat key words.'
      ],
      expectedOutcome: `Pupils engage physically and associate personal experiences with target English patterns.`,
      evidence: `Pupils react promptly to oral prompts and chant target patterns.`
    })
  },
  {
    id: 'warmup_four_corners',
    name: 'Four Corners Movement',
    category: 'MOVEMENT',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText) => ({
      stageName: 'Warm-up & Lead-in: Four Corners Movement (5 mins)',
      teacherActivities: [
        `Teacher labels 4 corners of classroom with flashcards of target vocabulary (${vocabText}).`,
        'Teacher counts down 5 seconds while pupils walk quietly to a corner of their choice.',
        'Teacher closes eyes, calls out 1 target word; pupils in that corner answer a target prompt.'
      ],
      pupilActivities: [
        `Pupils choose and walk quietly to 1 of 4 labelled vocabulary corners.`,
        `When teacher calls out target word (${vocabText}), pupils in selected corner repeat sentence pattern together.`,
        'Pupils rotate corners for 3 rapid rounds.'
      ],
      expectedOutcome: `Pupils move around safely and practise oral repetition in small corner groups.`,
      evidence: `Pupils move to designated corners and pronounce target vocabulary in groups.`
    })
  },
  {
    id: 'warmup_true_or_false',
    name: 'True or False Challenge',
    category: 'GAME',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Warm-up & Lead-in: True or False Challenge (5 mins)',
      teacherActivities: [
        `Teacher holds up a flashcard (${vocabText}) and makes a statement (sometimes true, sometimes false).`,
        'Teacher asks pupils to show thumbs UP for True and thumbs DOWN for False.',
        'Teacher elicits correct sentence structure if false: "No, it is [correct word]".'
      ],
      pupilActivities: [
        `Pupils examine flashcard and listen to teacher's statement.`,
        `Pupils evaluate statement and show thumbs UP/DOWN gestures.`,
        `If statement is False, pupils shout out the correct target sentence (${mainPattern}).`
      ],
      expectedOutcome: `Pupils practice critical listening and sentence correction skills.`,
      evidence: `Pupils correctly identify false statements and provide accurate corrections.`
    })
  },
  {
    id: 'warmup_whats_missing',
    name: "What's Missing?",
    category: 'VISUAL',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText) => ({
      stageName: 'Warm-up & Lead-in: What\'s Missing? (5 mins)',
      teacherActivities: [
        `Teacher places 5 target picture cards (${vocabText}) on board and leads choral repetition.`,
        'Teacher instructs pupils to close eyes: "Close your eyes! No peeking!"',
        'Teacher removes 1-2 cards, asks pupils to open eyes: "What\'s missing?"'
      ],
      pupilActivities: [
        `Pupils review cards on board, then cover eyes tightly on command.`,
        `Pupils open eyes, inspect remaining cards, and raise hands to identify missing target item (${vocabText}).`,
        'Class chorally spells or chants the missing target word.'
      ],
      expectedOutcome: `Pupils strengthen visual memory and recall missing target vocabulary items.`,
      evidence: `Pupils name missing flashcard items immediately upon opening eyes.`
    })
  },
  {
    id: 'warmup_odd_one_out',
    name: 'Odd One Out',
    category: 'GAME',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Warm-up & Lead-in: Odd One Out (5 mins)',
      teacherActivities: [
        `Teacher displays 4 pictures/words on board (3 belonging to target category, 1 odd item).`,
        'Teacher asks pupils: "Which one is the odd one out? Why?"',
        `Teacher guides pupils to justify using target sentence pattern (${mainPattern}).`
      ],
      pupilActivities: [
        `Pupils analyze 4 items on board and spot the odd category item.`,
        `Pupils raise hands and state: "[Item] is odd because..." using target words (${vocabText}).`,
        'Class confirms answer and repeats target category items.'
      ],
      expectedOutcome: `Pupils develop analytical thinking while practicing target vocabulary classification.`,
      evidence: `Pupils correctly identify odd item and explain rationale using target language.`
    })
  },
  {
    id: 'warmup_pelmanism_memory',
    name: 'Pelmanism Memory Match',
    category: 'VISUAL',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText) => ({
      stageName: 'Warm-up & Lead-in: Pelmanism Memory Match (5 mins)',
      teacherActivities: [
        `Teacher posts 6 numbered word cards and 6 numbered picture cards face down on board.`,
        'Teacher calls pairs of pupils to choose 2 numbers (e.g., "Card 2 and Card 5").',
        'Teacher turns cards over; if word and picture match, team keeps cards and chants word.'
      ],
      pupilActivities: [
        `Pupils remember positions of hidden word and picture cards.`,
        `Selected pupils pick card numbers to find matching pairs (${vocabText}).`,
        'Whole class chorally recites matching vocabulary when revealed.'
      ],
      expectedOutcome: `Pupils combine word-picture recognition with engaging memory matching.`,
      evidence: `Pupils successfully pair word cards with target picture cards.`
    })
  },
  {
    id: 'warmup_hot_seat',
    name: 'Hot Seat Guess',
    category: 'INTERACTIVE',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText) => ({
      stageName: 'Warm-up & Lead-in: Hot Seat Guess (5 mins)',
      teacherActivities: [
        `Teacher places 1 chair facing class with back to board (The Hot Seat).`,
        `Teacher writes a target word (${vocabText}) or shows flashcard behind pupil on Hot Seat.`,
        'Teacher guides class to mime or give 1-word hints without saying secret word.'
      ],
      pupilActivities: [
        `Volunteer pupil sits on Hot Seat facing away from board.`,
        `Classmates perform gestures/hints for target vocabulary (${vocabText}).`,
        'Hot Seat pupil guesses target word; class confirms with applause.'
      ],
      expectedOutcome: `Pupils collaborate creatively using mimes and hints to aid peer vocabulary recall.`,
      evidence: `Hot Seat pupil successfully guesses target word from peer hints.`
    })
  },
  {
    id: 'warmup_spin_the_wheel',
    name: 'Spin the Wheel',
    category: 'GAME',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Warm-up & Lead-in: Spin the Wheel (5 mins)',
      teacherActivities: [
        `Teacher projects an interactive spinning wheel containing target vocabulary pictures (${vocabText}).`,
        'Teacher spins wheel; pupil selected by wheel pointer answers teacher prompt or asks peer.',
        `Teacher guides target sentence practice (${mainPattern}).`
      ],
      pupilActivities: [
        `Pupils watch spinning wheel with high anticipation.`,
        `When wheel lands on target item (${vocabText}), selected pupil reads/answers prompt using sentence pattern (${mainPattern}).`,
        'Class repeats response in chorus.'
      ],
      expectedOutcome: `Pupils maintain high excitement while reviewing target vocabulary and structures.`,
      evidence: `Pupils pronounce landed wheel items fluently.`
    })
  },
  {
    id: 'warmup_slap_the_board',
    name: 'Word Race on Board',
    category: 'GAME',
    suitableStages: ['WARMUP'],
    generateProcedure: (_input, vocabText) => ({
      stageName: 'Warm-up & Lead-in: Word & Picture Race (5 mins)',
      teacherActivities: [
        `Teacher attaches 6 target word/picture cards (${vocabText}) across board.`,
        'Teacher invites 2 pupils from opposing teams to stand 2 steps back.',
        'Teacher calls out target word; pupils race to point to/touch correct card and say word.'
      ],
      pupilActivities: [
        `Two team representatives listen attentively to teacher audio cue.`,
        `Pupils race to touch correct target card on board (${vocabText}) and pronounce it clearly.`,
        'Cheering team members chant target word.'
      ],
      expectedOutcome: `Pupils react quickly to spoken English cues through competitive team play.`,
      evidence: `Pupils correctly touch and pronounce target cards on board.`
    })
  }
];

// ----------------------------------------------------------------------
// PRESENTATION ACTIVITIES
// ----------------------------------------------------------------------
const PRESENTATION_ACTIVITIES: ActivityTemplate[] = [
  {
    id: 'pres_audio_visual_drill',
    name: 'Look, Listen and Point (Audio-Visual Drill)',
    category: 'LISTENING_SPEAKING',
    suitableStages: ['PRESENTATION'],
    generateProcedure: (_input, vocabText, _mainPattern, patternsText) => ({
      stageName: 'Presentation: Look, Listen & Point (10 mins)',
      teacherActivities: [
        `Teacher presents new vocabulary (${vocabText}) using textbook illustrations, realia, and audio recordings.`,
        'Teacher plays audio track 3 times: 1st time pupils listen; 2nd time pupils listen and point; 3rd time pupils repeat.',
        `Teacher writes key sentence structure (${patternsText}) on board and highlights grammar focus.`
      ],
      pupilActivities: [
        `Pupils look at textbook illustrations and listen carefully to model pronunciation.`,
        `Pupils point to target pictures in textbooks while repeating vocabulary (${vocabText}) in chorus and individually.`,
        `Pupils observe sentence pattern (${patternsText}) on board and repeat model dialogue.`
      ],
      expectedOutcome: `Pupils recognize, point to, and pronounce new target vocabulary (${vocabText}) accurately.`,
      evidence: `Pupils correctly pronounce vocabulary and repeat model dialogue with proper intonation.`
    })
  },
  {
    id: 'pres_disappearing_text',
    name: 'Disappearing Dialogue Drill',
    category: 'VISUAL',
    suitableStages: ['PRESENTATION'],
    generateProcedure: (_input, vocabText, mainPattern, patternsText) => ({
      stageName: 'Presentation: Disappearing Dialogue Drill (10 mins)',
      teacherActivities: [
        `Teacher writes full target dialogue (${patternsText}) on board featuring new vocabulary (${vocabText}).`,
        'Teacher models dialogue with class, then erases 2-3 words at a time.',
        'Teacher challenges pupils to recite complete dialogue from memory as text disappears.'
      ],
      pupilActivities: [
        `Pupils read full target dialogue on board with teacher.`,
        `Pupils continue reciting dialogue confidently as teacher erases words step-by-step.`,
        'Pupils memorize sentence structures and target vocabulary naturally.'
      ],
      expectedOutcome: `Pupils internalize target sentence patterns (${mainPattern}) through visual memory drill.`,
      evidence: `Pupils recite complete dialogue without text prompts on board.`
    })
  },
  {
    id: 'pres_real_life_context',
    name: 'Real-Life Context & Puppet Modeling',
    category: 'INTERACTIVE',
    suitableStages: ['PRESENTATION'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Presentation: Real-Life Context & Puppet Modeling (10 mins)',
      teacherActivities: [
        `Teacher uses 2 finger puppets / real classroom props to act out a natural mini-dialogue introducing target words (${vocabText}).`,
        `Teacher asks checking questions (ICQs/CCQs) to verify pupils understand sentence pattern (${mainPattern}).`,
        'Teacher models choral repetition with clear rhythm and hand gestures.'
      ],
      pupilActivities: [
        `Pupils watch puppet demonstration attentively and listen to authentic dialogue context.`,
        `Pupils answer teacher checking questions to demonstrate comprehension.`,
        `Pupils mimic puppet gestures while practicing target sentence pattern (${mainPattern}).`
      ],
      expectedOutcome: `Pupils grasp target language meaning in context and mimic natural intonation.`,
      evidence: `Pupils answer checking questions correctly and repeat dialogue naturally.`
    })
  },
  {
    id: 'pres_flashcard_rhythm_chant',
    name: 'Flashcard Rhythm Chant',
    category: 'MOVEMENT',
    suitableStages: ['PRESENTATION'],
    generateProcedure: (_input, vocabText, _mainPattern) => ({
      stageName: 'Presentation: Flashcard Rhythm Chant (10 mins)',
      teacherActivities: [
        `Teacher introduces vocabulary flashcards (${vocabText}) accompanied by a rhythmic clap-clap beat.`,
        'Teacher models chant: "[Word] - [Word] - Yes it is!" or "[Pattern]!" to set speed and intonation.',
        'Teacher invites rows and individual pupils to take turns leading the rhythm.'
      ],
      pupilActivities: [
        `Pupils clap to rhythmic beat while chanting target vocabulary (${vocabText}).`,
        `Pupils adjust voice volume (whisper, loud, chorus) according to teacher hand signals.`,
        'Pupils master pronunciation through musical cadence.'
      ],
      expectedOutcome: `Pupils pronounce target words smoothly with correct stress and rhythm.`,
      evidence: `Pupils chant target vocabulary accurately in rhythm.`
    })
  }
];

// ----------------------------------------------------------------------
// PRACTICE ACTIVITIES
// ----------------------------------------------------------------------
const PRACTICE_ACTIVITIES: ActivityTemplate[] = [
  {
    id: 'prac_pair_roleplay',
    name: 'Pair Work Dialogue Role-Play',
    category: 'INTERACTIVE',
    suitableStages: ['PRACTICE'],
    generateProcedure: (_input, _vocabText, mainPattern) => ({
      stageName: 'Practice: Pair Work Dialogue Role-Play (12 mins)',
      teacherActivities: [
        `Teacher organizes pair work for pupils to practise asking and answering with sentence pattern (${mainPattern}).`,
        'Teacher distributes picture prompts, models pair interaction with a volunteer pupil, and monitors around the room.',
        'Teacher offers constructive feedback on pronunciation and grammar accuracy.'
      ],
      pupilActivities: [
        `Pupils work in pairs (pair work), taking turns asking and answering using textbook picture prompts and pattern (${mainPattern}).`,
        `Pupils switch roles with partners to ensure equal speaking time for both asking and answering.`,
        'Pupils self-correct based on teacher monitoring feedback.'
      ],
      expectedOutcome: `Pupils apply target sentence pattern (${mainPattern}) fluently in structured pair dialogue.`,
      evidence: `Pupils take turns asking and answering target questions with pair partners accurately.`
    })
  },
  {
    id: 'prac_info_gap',
    name: 'Information-Gap Partner Swap',
    category: 'INTERACTIVE',
    suitableStages: ['PRACTICE'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Practice: Information-Gap Partner Swap (12 mins)',
      teacherActivities: [
        `Teacher hands Sheet A (missing details) to Pupil A and Sheet B (complementary details) to Pupil B.`,
        `Teacher explains pupils must ask target questions (${mainPattern}) without looking at partner's sheet.`,
        'Teacher monitors pairs, checking that information is exchanged orally in English.'
      ],
      pupilActivities: [
        `Pupil A asks Pupil B target questions using sentence pattern (${mainPattern}) to fill missing sheet items.`,
        `Pupil B answers using target vocabulary (${vocabText}) and then asks Pupil A for missing data.`,
        'Pairs compare completed sheets at the end to check accuracy.'
      ],
      expectedOutcome: `Pupils use target language for genuine communication to solve an information gap.`,
      evidence: `Pupils complete their information sheets correctly through oral interaction.`
    })
  },
  {
    id: 'prac_musical_cards',
    name: 'Musical Cards Pair Swap',
    category: 'MOVEMENT',
    suitableStages: ['PRACTICE'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Practice: Musical Cards Pair Swap (12 mins)',
      teacherActivities: [
        `Teacher gives each pupil a prompt card (picture/word of ${vocabText}) and plays background music.`,
        'Teacher instructs pupils to walk around; when music stops, pupils pair with nearest classmate.',
        `Pairs perform target dialogue (${mainPattern}), exchange cards, and walk again when music resumes.`
      ],
      pupilActivities: [
        `Pupils walk around classroom holding prompt cards while music plays.`,
        `When music stops, pupils freeze, pair up with nearest peer, and ask/answer using target pattern (${mainPattern}).`,
        'Pupils swap prompt cards and repeat with 3 different partners.'
      ],
      expectedOutcome: `Pupils interact with multiple peers dynamically while reinforcing sentence patterns.`,
      evidence: `Pupils complete 3 different pair dialogues with correct language structure.`
    })
  },
  {
    id: 'prac_sentence_bingo',
    name: 'Vocabulary & Pattern Bingo',
    category: 'GAME',
    suitableStages: ['PRACTICE'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Practice: Vocabulary & Pattern Bingo (12 mins)',
      teacherActivities: [
        `Teacher asks pupils to select 4 target words (${vocabText}) and draw them in a 2x2 grid.`,
        `Teacher or peer leaders call out target sentence patterns (${mainPattern}) containing target words.`,
        'Teacher checks pupil grids when "Bingo!" is called and asks pupil to read selected line aloud.'
      ],
      pupilActivities: [
        `Pupils create 2x2 Bingo grid with target vocabulary pictures.`,
        `Pupils listen to oral sentence prompts and cross off matching target items.`,
        'Pupil completing a line shouts "Bingo!" and reads target sentences to the class.'
      ],
      expectedOutcome: `Pupils hone listening comprehension and oral sentence verification.`,
      evidence: `Pupils identify called vocabulary in sentences and read grid lines aloud correctly.`
    })
  },
  {
    id: 'prac_jumbled_sentence_race',
    name: 'Jumbled Sentence Unscramble',
    category: 'GAME',
    suitableStages: ['PRACTICE'],
    generateProcedure: (_input, _vocabText, mainPattern) => ({
      stageName: 'Practice: Jumbled Sentence Unscramble (12 mins)',
      teacherActivities: [
        `Teacher gives pairs an envelope containing scrambled word cards of target sentence (${mainPattern}).`,
        'Teacher signals "Go!" and monitors pairs as they arrange cards into correct grammatical order.',
        'Teacher invites fastest pair to read unscrambled sentence aloud to class.'
      ],
      pupilActivities: [
        `Pupils work in pairs to arrange word cards into target sentence order (${mainPattern}).`,
        `Pairs double-check word order, capital letters, and punctuation.`,
        'Pairs raise hands when finished and read complete target sentence aloud.'
      ],
      expectedOutcome: `Pupils consolidate word order syntax and structural sentence rules.`,
      evidence: `Pupils unscramble word cards into correct target sentence order.`
    })
  }
];

// ----------------------------------------------------------------------
// PRODUCTION / APPLICATION ACTIVITIES
// ----------------------------------------------------------------------
const PRODUCTION_ACTIVITIES: ActivityTemplate[] = [
  {
    id: 'prod_find_someone_who',
    name: 'Find Someone Who... (Classroom Survey)',
    category: 'INTERACTIVE',
    suitableStages: ['PRODUCTION'],
    generateProcedure: (_input, _vocabText, mainPattern) => ({
      stageName: 'Production: Find Someone Who... Survey (10 mins)',
      teacherActivities: [
        `Teacher hands out survey grids with target questions (${mainPattern}).`,
        'Teacher models survey interaction with a pupil: "Do you [like/have/can...]?" - "Yes, I do / No, I don\'t."',
        'Teacher instructs pupils to move around room, interview 3 peers, and write down names.'
      ],
      pupilActivities: [
        `Pupils move around classroom carrying survey sheets.`,
        `Pupils interview 3 classmates using target sentence pattern (${mainPattern}).`,
        'Pupils record peer responses and report 1 result to the class: "[Name] likes/can [word]".'
      ],
      expectedOutcome: `Pupils apply target language independently in an authentic classroom survey.`,
      evidence: `Pupils complete survey sheets and report peer answers using target structures.`
    })
  },
  {
    id: 'prod_show_and_tell',
    name: 'Mini Show & Tell Presentation',
    category: 'CREATIVE',
    suitableStages: ['PRODUCTION'],
    generateProcedure: (input, vocabText, mainPattern) => ({
      stageName: 'Production: Mini Show & Tell Presentation (10 mins)',
      teacherActivities: [
        `Teacher asks pupils to choose an object/drawing related to topic (${input.topic || vocabText}).`,
        'Teacher gives 2 minutes for pupils to prepare 2 target sentences.',
        'Teacher invites pupil representatives to present their item in front of small groups or class.'
      ],
      pupilActivities: [
        `Pupils select or draw a target object/picture.`,
        `Pupils prepare 2 sentences using target vocabulary (${vocabText}) and pattern (${mainPattern}).`,
        'Pupils stand up in front of group/class and present their item confidently.'
      ],
      expectedOutcome: `Pupils gain speaking confidence by delivering short creative presentations.`,
      evidence: `Pupils present target drawings/objects using 2 correct target sentences.`
    })
  },
  {
    id: 'prod_mini_poster',
    name: 'Group Mini-Poster Project',
    category: 'CREATIVE',
    suitableStages: ['PRODUCTION'],
    generateProcedure: (input, vocabText, mainPattern) => ({
      stageName: 'Production: Group Mini-Poster Project (10 mins)',
      teacherActivities: [
        `Teacher divides class into groups of 4 and distributes A3 paper and colored pens.`,
        `Teacher assigns poster task: Draw and label items (${vocabText}) using target pattern (${mainPattern}).`,
        'Teacher monitors group collaboration and assists with vocabulary spelling.'
      ],
      pupilActivities: [
        `Pupils collaborate in groups of 4 to create a mini-poster on topic (${input.topic || 'Lesson Topic'}).`,
        `Pupils label drawings with target words (${vocabText}) and write sentence captions (${mainPattern}).`,
        'Groups display poster on wall and read their captions to peer groups.'
      ],
      expectedOutcome: `Pupils synthesize visual art and English writing/speaking in a collaborative team task.`,
      evidence: `Groups produce a completed mini-poster with accurate target language labels.`
    })
  },
  {
    id: 'prod_roleplay_market',
    name: 'Real-Life Situation Role-Play',
    category: 'INTERACTIVE',
    suitableStages: ['PRODUCTION'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Production: Real-Life Situation Role-Play (10 mins)',
      teacherActivities: [
        `Teacher sets up a real-life scenario (e.g. store, park, home, school context) using classroom props.`,
        `Teacher assigns roles (e.g., customer/seller, friend A/friend B) using target sentence structure (${mainPattern}).`,
        'Teacher monitors pairs as they perform authentic role-play dialogues.'
      ],
      pupilActivities: [
        `Pupils assume assigned roles in the real-life scenario.`,
        `Pupils improvise dialogue using target vocabulary (${vocabText}) and sentence patterns (${mainPattern}).`,
        'Pairs showcase their role-play to the class.'
      ],
      expectedOutcome: `Pupils transfer classroom English into meaningful real-world communicative situations.`,
      evidence: `Pupils perform creative role-plays using appropriate target vocabulary and tone.`
    })
  }
];

// ----------------------------------------------------------------------
// CONSOLIDATION ACTIVITIES
// ----------------------------------------------------------------------
const CONSOLIDATION_ACTIVITIES: ActivityTemplate[] = [
  {
    id: 'consol_exit_ticket',
    name: 'Quick Questions & Exit Ticket',
    category: 'LISTENING_SPEAKING',
    suitableStages: ['CONSOLIDATION'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Consolidation & Wrap-up: Exit Ticket (3 mins)',
      teacherActivities: [
        `Teacher invites 2-3 pupil pairs to showcase their dialogue in front of the whole class.`,
        `Teacher asks quick individual exit questions using target vocabulary (${vocabText}) before pupils pack up.`,
        'Teacher summarizes key learning points, praises active pupils, and assigns workbook homework.'
      ],
      pupilActivities: [
        `Pupil pairs perform dialogue before class and receive peer applause.`,
        `Pupils answer teacher quick exit prompt using target sentence pattern (${mainPattern}).`,
        'Pupils review key lesson vocabulary and note homework tasks.'
      ],
      expectedOutcome: `Pupils consolidate key language points and demonstrate individual learning mastery.`,
      evidence: `Pupils answer exit questions correctly and note home practice assignments.`
    })
  },
  {
    id: 'consol_memory_chain',
    name: 'Memory Chain Wrap-up',
    category: 'GAME',
    suitableStages: ['CONSOLIDATION'],
    generateProcedure: (_input, vocabText, _mainPattern) => ({
      stageName: 'Consolidation & Wrap-up: Memory Chain (3 mins)',
      teacherActivities: [
        `Teacher starts a memory sentence chain: "In today's lesson, I learned [Word 1]."`,
        'Teacher calls next pupil to add a 2nd word: "...[Word 1] and [Word 2]."',
        'Teacher praises pupils for building a long sentence chain together.'
      ],
      pupilActivities: [
        `Pupil 1 states target sentence with 1 vocabulary item.`,
        `Pupil 2 repeats Pupil 1's item and adds a new target word (${vocabText}).`,
        'Whole class chorally recites the final complete memory chain.'
      ],
      expectedOutcome: `Pupils review lesson vocabulary in a fun, cumulative group challenge.`,
      evidence: `Pupils successfully build and recite a 5-item vocabulary memory chain.`
    })
  },
  {
    id: 'consol_two_truths_lie',
    name: 'Two Truths & One Lie',
    category: 'GAME',
    suitableStages: ['CONSOLIDATION'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Consolidation & Wrap-up: Two Truths & One Lie (3 mins)',
      teacherActivities: [
        `Teacher states 3 sentences using target pattern (${mainPattern}) — 2 true statements about lesson content, 1 lie.`,
        'Teacher asks class to spot the lie and state the correct truth.',
        'Teacher summarizes lesson achievements and assigns home practice.'
      ],
      pupilActivities: [
        `Pupils listen attentively to teacher's 3 target sentences.`,
        `Pupils identify the false sentence and explain why using target words (${vocabText}).`,
        'Pupils record homework tasks in notebooks.'
      ],
      expectedOutcome: `Pupils sharpen critical listening and summarize lesson language effectively.`,
      evidence: `Pupils spot the false statement and state the correct target sentence.`
    })
  },
  {
    id: 'consol_321_reflection',
    name: '3-2-1 Quick Summary',
    category: 'LISTENING_SPEAKING',
    suitableStages: ['CONSOLIDATION'],
    generateProcedure: (_input, vocabText, mainPattern) => ({
      stageName: 'Consolidation & Wrap-up: 3-2-1 Summary (3 mins)',
      teacherActivities: [
        'Teacher prompts class: "Tell me 3 new words, 2 sentence patterns, and 1 activity you liked today!"',
        'Teacher writes pupil contributions quickly on board as a visual summary.',
        'Teacher summarizes lesson performance and sets home assignments.'
      ],
      pupilActivities: [
        `Pupils raise hands to name 3 target words (${vocabText}).`,
        `Pupils recite 2 target sentence patterns (${mainPattern}).`,
        'Pupils share their favorite activity of the lesson and record homework.'
      ],
      expectedOutcome: `Pupils reflect on personal learning outcomes and celebrate lesson achievements.`,
      evidence: `Pupils name 3 target words and 2 sentence patterns accurately during wrap-up.`
    })
  }
];

// ----------------------------------------------------------------------
// DYNAMIC SELECTION ENGINE (CONTENT-AWARE & DETERMINISTIC ROTATION)
// ----------------------------------------------------------------------

export function selectDynamicActivity(
  stage: ActivityStage,
  input: ActivityContextInput,
  rotationOffset: number = 0
): Omit<ProcedureRow, 'id' | 'postLessonAdjustments'> {
  const cleanVocab = (input.vocabulary || []).map(v => v.trim()).filter(Boolean);
  const cleanPatterns = (input.sentencePatterns || []).map(p => p.trim()).filter(Boolean);

  const vocabText = cleanVocab.length > 0 ? cleanVocab.join(', ') : 'target vocabulary';
  const mainPattern = cleanPatterns.length > 0 ? cleanPatterns[0] : 'target sentence pattern';
  const patternsText = cleanPatterns.length > 0 ? cleanPatterns.join('; ') : mainPattern;

  const contentType = detectContentType(input);

  // Compute a deterministic seed using unit number, lesson number, grade level, and offset
  const seed = (input.gradeLevel * 7) + ((input.unitNumber || 1) * 13) + ((input.lessonNumber || 1) * 19) + rotationOffset;

  let pool: ActivityTemplate[] = [];

  switch (stage) {
    case 'WARMUP':
      pool = [...WARMUP_ACTIVITIES];
      // Filter/Prioritize based on content type
      if (contentType === 'ACTIONS') {
        const priority = pool.filter(a => a.category === 'MOVEMENT');
        if (priority.length > 0) pool = [...priority, ...pool.filter(a => a.category !== 'MOVEMENT')];
      } else if (contentType === 'VISUAL_NOUNS') {
        const priority = pool.filter(a => a.category === 'VISUAL');
        if (priority.length > 0) pool = [...priority, ...pool.filter(a => a.category !== 'VISUAL')];
      } else if (contentType === 'QA_PATTERNS') {
        const priority = pool.filter(a => a.category === 'GAME' || a.category === 'INTERACTIVE');
        if (priority.length > 0) pool = [...priority, ...pool.filter(a => a.category !== 'GAME' && a.category !== 'INTERACTIVE')];
      }
      break;

    case 'PRESENTATION':
      pool = [...PRESENTATION_ACTIVITIES];
      break;

    case 'PRACTICE':
      pool = [...PRACTICE_ACTIVITIES];
      break;

    case 'PRODUCTION':
      pool = [...PRODUCTION_ACTIVITIES];
      break;

    case 'CONSOLIDATION':
      pool = [...CONSOLIDATION_ACTIVITIES];
      break;
  }

  // Select item from pool deterministically based on seed
  const selectedTemplate = pool[Math.abs(seed) % pool.length];
  return selectedTemplate.generateProcedure(input, vocabText, mainPattern, patternsText);
}

/**
 * Returns a list of all available warm-up activity names for manual rotation UI
 */
export function getWarmupActivityList(): string[] {
  return WARMUP_ACTIVITIES.map(a => a.name);
}
