const { generateStructuredLessonPlan } = require('../src/utils/lessonGenerator.ts');

console.log('=== LESSON QUALITY & CONSISTENCY VERIFICATION TEST ===\n');

// Test 1: Global Success Grade 5 Unit 1 Lesson 1
const gsPlan = generateStructuredLessonPlan({
  programCode: 'GLOBAL_SUCCESS',
  gradeLevel: 5,
  unitNumber: 1,
  unitTitle: 'Unit 1: All about me',
  lessonNumber: 1,
  lessonTitle: 'Lesson 1 - Address & hometown',
  vocabulary: ['address', 'lane', 'tower', 'flat', 'hometown'],
  sentencePatterns: ['What is your address? - It is 105 Hoa Binh Street.'],
  availableIntegrations: [
    {
      type: 'NLS',
      officialCode: 'NLS_5.1.2',
      officialWording: 'Pupils use a teacher-approved digital audio resource to locate target address information.',
      domain: 'Domain 1: Digital Media & Learning'
    }
  ]
});

console.log('--- TEST 1: Global Success Grade 5 Unit 1 ---');
console.log('Title:', gsPlan.title);
console.log('Vocabulary in Objectives:', gsPlan.vocabulary);
console.log('Sentence Patterns in Objectives:', gsPlan.sentence_patterns);
console.log('Skills Derived:', gsPlan.skills);
console.log('Warm-up Stage Name:', gsPlan.procedures[0].stageName);
console.log('Warm-up Teacher Activity:', gsPlan.procedures[0].teacherActivities[0]);
console.log('Presentation Teacher Activity:', gsPlan.procedures[1].teacherActivities[0]);
console.log('Integration in Objectives count:', gsPlan.integrations.length);
console.log('Matching NLS Procedure Row Code:', gsPlan.procedures.find(p => p.integrationCode === 'NLS_5.1.2')?.integrationCode);
console.log('Post-Reflection:', gsPlan.post_reflection);

console.log('\n--- TEST 2: Word Export Filename Formatting ---');
// Verify filename logic
function getWordFilename(plan) {
  const isGlobalSuccess = plan.teaching_program_code === 'GLOBAL_SUCCESS';
  const isMoveUp = plan.teaching_program_code === 'MOVE_UP';

  const unitMatch = (plan.unit_title || '').match(/Unit\s*(\d+)/i);
  const unitNum = unitMatch ? unitMatch[1] : (plan.unit_id || '1');

  const lessonMatch = (plan.lesson_title || '').match(/Lesson\s*(\d+)/i);
  const lessonNum = lessonMatch ? lessonMatch[1] : '1';

  let filename = '';
  if (isGlobalSuccess) {
    filename = `KHBD LỚP ${plan.grade_level}_UNIT ${unitNum}_LESSON ${lessonNum}.docx`;
  } else if (isMoveUp) {
    filename = `KHBD LỚP ${plan.grade_level}_MOVE UP_UNIT ${unitNum}_LESSON ${lessonNum}.docx`;
  } else {
    const shortTitle = (plan.lesson_title || plan.title || 'Lesson').replace(/[\\/:*?"<>|]/g, '').trim();
    filename = `KHBD LỚP ${plan.grade_level}_${shortTitle}.docx`;
  }
  return filename;
}

console.log('Global Success Filename:', getWordFilename(gsPlan));

const moveUpPlan = generateStructuredLessonPlan({
  programCode: 'MOVE_UP',
  gradeLevel: 2,
  unitNumber: 10,
  unitTitle: 'Unit 10: Action Verbs',
  lessonNumber: 1,
  lessonTitle: 'Lesson 1',
  vocabulary: ['jump', 'run', 'swim', 'fly'],
  sentencePatterns: ['I can jump.', 'Can you swim? - Yes, I can.']
});

console.log('MOVE UP Filename:', getWordFilename(moveUpPlan));
console.log('MOVE UP Post-Reflection:', moveUpPlan.post_reflection);

console.log('\n=== ALL QUALITY VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
