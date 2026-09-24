/**
 * Utility for generating observable and measurable learning outcomes for Section I. OBJECTIVES.
 * All objectives begin with or contain observable action verbs (identify, recognize, say, pronounce, use, ask, answer, listen, read, write, demonstrate, communicate, cooperate, complete).
 * Avoids vague/unmeasurable verbs (know, understand, learn, be aware of).
 */

export function getVocabObjective(
  vocabulary: string[] = [],
  gradeLevel: number = 3,
  itemType?: string,
  displayTitle?: string
): string {
  const clean = vocabulary
    .map(v => v.trim())
    .filter(v => Boolean(v) && !v.includes('[DATA MISSING'));

  const typeUpper = (itemType || '').toUpperCase();
  const titleLower = (displayTitle || '').toLowerCase();

  const isCorrection = titleLower.includes('correction');
  const isTest = typeUpper === 'TEST' || typeUpper === 'TEST_REVISION' || typeUpper === 'TEST_SEMESTER' || titleLower.includes('test');
  const isReview = typeUpper === 'REVIEW' || titleLower.includes('review');
  const isFunTime = typeUpper === 'FUN_TIME' || titleLower.includes('fun time');
  const isExtension = typeUpper === 'EXTENSION' || titleLower.includes('extension');
  const isRevision = typeUpper === 'REVISION' || titleLower.includes('revision');

  if (isTest) {
    if (isCorrection) {
      return clean.length > 0
        ? `Identify errors, correct answers, and consolidate target vocabulary (${clean.join(', ')}) from the test.`
        : 'Identify errors, review key vocabulary/structures, and consolidate target language knowledge through test correction.';
    }
    return clean.length > 0
      ? `Demonstrate retention and accuracy of target vocabulary (${clean.join(', ')}) across assessment tasks.`
      : 'Demonstrate target language retention and accuracy across assessment tasks.';
  }

  if (clean.length > 0) {
    const vocabText = clean.join(', ');
    if (isReview) {
      return `Recall, review, and apply key vocabulary (${vocabText}) accurately in listening, speaking, reading, and writing tasks.`;
    }
    if (isFunTime) {
      return `Recycle and practise target vocabulary (${vocabText}) through games and communicative activities.`;
    }
    if (isExtension) {
      return `Apply and extend target vocabulary (${vocabText}) through textbook extension tasks.`;
    }
    if (isRevision) {
      return `Systematically consolidate target vocabulary (${vocabText}) before assessment.`;
    }
    if (gradeLevel <= 2) {
      return `Recognize, say, and use target words (${vocabText}) correctly in simple classroom activities.`;
    }
    return `Identify, pronounce, and use target vocabulary (${vocabText}) accurately in speaking and writing tasks.`;
  }

  // Special item fallback objectives when DB vocabulary is empty
  if (isReview) {
    return 'Recall, recognize, and use the reviewed vocabulary accurately in listening, speaking, reading, and/or writing tasks.';
  }
  if (typeUpper === 'INTRO' || titleLower.includes('làm quen') || titleLower.includes('acquaint')) {
    return 'Get acquainted with English learning materials, classroom instructions, and basic course conventions.';
  }
  if (isExtension) {
    return 'Explore and apply extended vocabulary in creative learning activities.';
  }
  if (typeUpper === 'STARTER' || titleLower.includes('starter')) {
    return 'Recognize and practise introductory vocabulary items in classroom activities.';
  }
  if (isFunTime) {
    return 'Consolidate and review target vocabulary through engaging games and classroom activities.';
  }
  if (isRevision) {
    return 'Recall and consolidate target vocabulary from previous lessons.';
  }

  return 'Recall and practise target vocabulary according to lesson objectives.';
}

export function getPatternObjective(
  sentencePatterns: string[] = [],
  gradeLevel: number = 3,
  itemType?: string,
  displayTitle?: string
): string {
  const clean = sentencePatterns
    .map(p => p.trim())
    .filter(p => Boolean(p) && !p.includes('[DATA MISSING'));

  const typeUpper = (itemType || '').toUpperCase();
  const titleLower = (displayTitle || '').toLowerCase();

  const validPatterns = clean.filter(p => !p.toUpperCase().startsWith('N/A'));

  const isCorrection = titleLower.includes('correction');
  const isTest = typeUpper === 'TEST' || typeUpper === 'TEST_REVISION' || typeUpper === 'TEST_SEMESTER' || titleLower.includes('test');
  const isReview = typeUpper === 'REVIEW' || titleLower.includes('review');
  const isFunTime = typeUpper === 'FUN_TIME' || titleLower.includes('fun time');
  const isExtension = typeUpper === 'EXTENSION' || titleLower.includes('extension');
  const isRevision = typeUpper === 'REVISION' || titleLower.includes('revision');

  if (isTest) {
    if (isCorrection) {
      return validPatterns.length > 0
        ? `Identify errors, correct answers, and consolidate sentence patterns ("${validPatterns.join('; ')}") from test tasks.`
        : 'Demonstrate accurate sentence structures and correct errors in test tasks.';
    }
    return validPatterns.length > 0
      ? `Demonstrate accuracy in applying sentence patterns ("${validPatterns.join('; ')}") during test activities.`
      : 'Demonstrate accuracy in applying target sentence structures during test activities.';
  }

  if (validPatterns.length > 0) {
    const patternText = validPatterns.join('; ');
    if (isReview) {
      return `Recall, review, and apply key sentence patterns ("${patternText}") accurately in pair and group communication tasks.`;
    }
    if (isFunTime) {
      return `Recycle and practise sentence patterns ("${patternText}") through interactive games and group tasks.`;
    }
    if (isExtension) {
      return `Apply and extend sentence patterns ("${patternText}") in communicative activities.`;
    }
    if (isRevision) {
      return `Systematically consolidate sentence patterns ("${patternText}") through review exercises.`;
    }
    if (gradeLevel <= 2) {
      return `Ask and answer using target sentence pattern ("${patternText}") in simple pair dialogues.`;
    }
    return `Use target sentence pattern ("${patternText}") to ask and answer questions appropriately in pair and group communication tasks.`;
  }

  // Special item fallback pattern objectives when DB sentence patterns are empty or N/A
  if (isReview) {
    return 'Recall, recognize, and apply reviewed sentence patterns accurately in communication activities.';
  }
  if (typeUpper === 'INTRO' || titleLower.includes('làm quen') || titleLower.includes('acquaint')) {
    return 'Respond to basic classroom commands and introductory interactions appropriately.';
  }
  if (isExtension) {
    return 'Consolidate and extend sentence pattern usage in communicative tasks.';
  }
  if (typeUpper === 'STARTER' || titleLower.includes('starter')) {
    return 'Use introductory sentence patterns to communicate with peers and teacher.';
  }
  if (isFunTime) {
    return 'Practise sentence patterns through interactive language games and group tasks.';
  }
  if (isRevision) {
    return 'Consolidate sentence pattern structures through review exercises.';
  }

  return 'Use target sentence patterns to ask and answer questions in communication tasks.';
}

export function getSkillsObjective(skills: string[] = [], _vocabulary: string[] = [], _sentencePatterns: string[] = []): string {
  const lowerSkills = (skills || []).map(s => s.toLowerCase());
  const hasListen = lowerSkills.some(s => s.includes('listen'));
  const hasSpeak = lowerSkills.some(s => s.includes('speak'));
  const hasRead = lowerSkills.some(s => s.includes('read'));
  const hasWrite = lowerSkills.some(s => s.includes('write'));

  const clauses: string[] = [];

  if (hasListen || (!hasRead && !hasWrite)) {
    clauses.push('listen to teacher models and audio tracks to identify target language');
  }
  if (hasSpeak || (!hasRead && !hasWrite)) {
    clauses.push('say target words accurately and communicate with peers using target sentence patterns');
  }
  if (hasRead) {
    clauses.push('read simple texts and recognize target vocabulary in context');
  }
  if (hasWrite) {
    clauses.push('write target words and complete sentence pattern exercises accurately');
  }

  if (clauses.length === 0) {
    return 'Listen to audio models, say target words accurately, and communicate with peers using target sentence patterns.';
  }

  const result = clauses.join('; ');
  return result.charAt(0).toUpperCase() + result.slice(1) + '.';
}

export function getCompetencesQualitiesObjective(customText?: string): string {
  if (
    customText &&
    customText.trim().length > 10 &&
    !customText.toLowerCase().includes('thereby contributing to the development')
  ) {
    return customText.trim();
  }
  return "Demonstrate active communication and cooperation by working effectively in pair and group activities; show self-reliance, diligence, and responsibility in completing learning tasks.";
}
