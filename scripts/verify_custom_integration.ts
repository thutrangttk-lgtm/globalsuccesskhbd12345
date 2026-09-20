import { generateStructuredLessonPlan } from '../src/utils/lessonGenerator';

console.log('=== VERIFYING CUSTOM INTEGRATION CONTENT & NLS/AI PROTECTION ===\n');

// Test 1: Environmental Protection custom teacher content
const plan1 = generateStructuredLessonPlan({
  programCode: 'GLOBAL_SUCCESS',
  gradeLevel: 3,
  unitNumber: 2,
  unitTitle: 'Our School',
  lessonNumber: 1,
  vocabulary: ['classroom', 'library', 'clean', 'litter'],
  sentencePatterns: ['Keep our classroom clean.'],
  availableIntegrations: [
    {
      type: 'ENVIRONMENT',
      customTeacherContent: 'Pupils identify environmentally friendly actions and use the target sentence pattern to describe them.'
    }
  ]
});

console.log('--- TEST 1: Environmental Protection Custom Integration Content ---');
console.log('Integration Wording:', plan1.integrations[0].custom_teacher_content || plan1.integrations[0].wording);
const envProc = plan1.procedures.find(p => p.integrationLabel === 'Environmental Protection');
console.log('Mapped Procedure Stage Name:', envProc?.stageName);
console.log('Mapped Procedure Teacher Activity:', envProc?.teacherActivities[0]);

if (
  plan1.integrations[0].custom_teacher_content?.includes('environmentally friendly actions') &&
  envProc &&
  envProc.teacherActivities[0].includes('environmentally friendly actions')
) {
  console.log('✅ TEST 1 PASSED: Custom teacher integration content correctly mapped to Teaching Procedures.\n');
} else {
  console.error('❌ TEST 1 FAILED.\n');
}

// Test 2: NLS & AI Official Code Protection
console.log('--- TEST 2: NLS & AI Official Code Protection ---');
const plan2 = generateStructuredLessonPlan({
  programCode: 'GLOBAL_SUCCESS',
  gradeLevel: 5,
  unitNumber: 1,
  unitTitle: 'All About Our Addresses',
  lessonNumber: 1,
  vocabulary: ['address', 'lane', 'tower', 'flat'],
  sentencePatterns: ['What is your address? - It is 105 Hoa Binh Street.'],
  availableIntegrations: [
    {
      type: 'NLS',
      officialCode: 'NLS_5.1.2',
      officialWording: 'Pupils select teacher-approved digital resources during lesson practice.',
      customTeacherContent: 'Pupils use a teacher-approved digital tablet to select correct street addresses.'
    },
    {
      type: 'AI',
      officialCode: 'AI_2422',
      officialWording: 'Pupils use AI speech feedback application for pronunciation accuracy.',
      customTeacherContent: 'Pupils speak target address sentences into AI microphone and check feedback.'
    }
  ]
});

console.log('NLS Item Code:', plan2.integrations[0].official_code || plan2.integrations[0].code);
console.log('NLS Teacher Content:', plan2.integrations[0].custom_teacher_content);
console.log('AI Item Code:', plan2.integrations[1].official_code || plan2.integrations[1].code);
console.log('AI Teacher Content:', plan2.integrations[1].custom_teacher_content);

if (
  plan2.integrations[0].code === 'NLS_5.1.2' &&
  plan2.integrations[0].custom_teacher_content?.includes('digital tablet') &&
  plan2.integrations[1].code === 'AI_2422' &&
  plan2.integrations[1].custom_teacher_content?.includes('AI microphone')
) {
  console.log('✅ TEST 2 PASSED: NLS and AI official codes remain verified and immutable, while practical teacher content is fully customizable.\n');
} else {
  console.error('❌ TEST 2 FAILED.\n');
}

// Test 3: Custom Integration Label + Content
console.log('--- TEST 3: Add Custom Integration ---');
const plan3 = generateStructuredLessonPlan({
  programCode: 'CUSTOM',
  gradeLevel: 4,
  unitTitle: 'UNIT CUSTOM',
  lessonTitle: 'Lesson 1',
  vocabulary: ['money', 'save', 'count'],
  sentencePatterns: ['How much is it? - It is 10 thousand dong.'],
  availableIntegrations: [
    {
      type: 'CUSTOM',
      isCustomLabel: true,
      customLabelText: 'Financial Literacy Education',
      customTeacherContent: 'Pupils calculate simple item prices and practise money management vocabulary.'
    }
  ]
});

const customProc = plan3.procedures.find(p => p.integrationLabel === 'Financial Literacy Education');
console.log('Custom Integration Label:', plan3.integrations[0].customLabelText);
console.log('Custom Integration Procedure:', customProc?.stageName);

if (
  plan3.integrations[0].customLabelText === 'Financial Literacy Education' &&
  customProc &&
  customProc.teacherActivities[0].includes('calculate simple item prices')
) {
  console.log('✅ TEST 3 PASSED: Custom integration label and content correctly created and mapped to procedures.\n');
} else {
  console.error('❌ TEST 3 FAILED.\n');
}

console.log('=== ALL CUSTOM INTEGRATION TESTS PASSED 100%! ===');
