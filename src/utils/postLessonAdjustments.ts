/**
 * Utility to generate short, realistic post-lesson adjustments based on lesson content and stage.
 */

export function generatePostLessonAdjustment(
  stageName: string,
  vocabulary: string[] = [],
  sentencePatterns: string[] = [],
  rowIndex: number = 0
): string {
  const lowerStage = (stageName || '').toLowerCase();
  const firstVocab = vocabulary.length > 0 ? vocabulary[0] : '';
  const firstPattern = sentencePatterns.length > 0 ? sentencePatterns[0] : '';

  // Stage 1: Warm-up & Lead-in
  if (lowerStage.includes('warm-up') || lowerStage.includes('warmup') || lowerStage.includes('lead-in')) {
    const options = [
      firstVocab ? `Provide more practice with the target vocabulary (${firstVocab}).` : "Provide more practice with the target vocabulary.",
      "Allow more time for pupils to get warmed up.",
      "Review key vocabulary before starting the warm-up game.",
      "Use more visual support for vocabulary."
    ];
    return options[rowIndex % options.length];
  }

  // Stage 2: Presentation
  if (lowerStage.includes('presentation')) {
    const options = [
      "Use more visual support for vocabulary.",
      "Review pronunciation in the next lesson.",
      firstPattern ? `Review the sentence pattern (${firstPattern}) before the next activity.` : "Review the sentence pattern before the next activity.",
      "Simplify instructions for weaker pupils during vocabulary modeling."
    ];
    return options[rowIndex % options.length];
  }

  // Stage 3: Practice
  if (lowerStage.includes('practice')) {
    const options = [
      "Allow more time for pair work.",
      "Provide additional support for slower learners.",
      firstPattern ? `Review the sentence pattern (${firstPattern}) before moving to pair work.` : "Review the sentence pattern before the next activity.",
      "Add more speaking practice."
    ];
    return options[rowIndex % options.length];
  }

  // Stage 4: Production / Integration
  if (lowerStage.includes('production') || lowerStage.includes('integration')) {
    const options = [
      "Simplify the instructions for weaker pupils.",
      "Add more speaking practice.",
      "Provide additional support for slower learners.",
      "Allow more time for group presentations."
    ];
    return options[rowIndex % options.length];
  }

  // Stage 5: Consolidation / Wrap-up
  if (lowerStage.includes('consolidation') || lowerStage.includes('wrap-up') || lowerStage.includes('wrap up')) {
    const options = [
      "Review pronunciation in the next lesson.",
      "Provide additional support for slower learners.",
      "Re-check key sentence patterns in the warm-up of the next lesson.",
      "Provide more practice with the target vocabulary."
    ];
    return options[rowIndex % options.length];
  }

  // Generic fallback pool of concise realistic adjustments (strictly from requirement examples)
  const genericOptions = [
    "Provide more practice with the target vocabulary.",
    "Allow more time for pair work.",
    "Review pronunciation in the next lesson.",
    "Simplify the instructions for weaker pupils.",
    "Add more speaking practice.",
    "Use more visual support for vocabulary.",
    "Review the sentence pattern before the next activity.",
    "Provide additional support for slower learners."
  ];

  return genericOptions[rowIndex % genericOptions.length];
}
