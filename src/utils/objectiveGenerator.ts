/**
 * Utility for generating observable and measurable learning outcomes for Section I. OBJECTIVES.
 * All objectives begin with or contain observable action verbs (identify, recognize, say, pronounce, use, ask, answer, listen, read, write, demonstrate, communicate, cooperate, complete).
 * Avoids vague/unmeasurable verbs (know, understand, learn, be aware of).
 */

export function getVocabObjective(vocabulary: string[] = [], gradeLevel: number = 3): string {
  const clean = vocabulary.map(v => v.trim()).filter(Boolean);
  if (clean.length === 0) {
    return 'Identify, pronounce, and use target vocabulary accurately in lesson activities.';
  }
  const vocabText = clean.join(', ');
  if (gradeLevel <= 2) {
    return `Recognize, say, and use target words (${vocabText}) correctly in simple classroom activities.`;
  }
  return `Identify, pronounce, and use target vocabulary (${vocabText}) accurately in speaking and writing tasks.`;
}

export function getPatternObjective(sentencePatterns: string[] = [], gradeLevel: number = 3): string {
  const clean = sentencePatterns.map(p => p.trim()).filter(Boolean);
  if (clean.length === 0) {
    return 'Use target sentence patterns to ask and answer questions in communication tasks.';
  }
  const patternText = clean.join('; ');
  if (gradeLevel <= 2) {
    return `Ask and answer using target sentence pattern ("${patternText}") in simple pair dialogues.`;
  }
  return `Use target sentence pattern ("${patternText}") to ask and answer questions appropriately in pair and group communication tasks.`;
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
