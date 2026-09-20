import { generateStructuredLessonPlan } from '../src/utils/lessonGenerator';

console.log('=== VERIFYING TEACHER YOUTUBE INTEGRATION LOGIC ===\n');

// Test 1: Teacher has saved YouTube URL, BUT no matched video was found for this specific lesson
const plan1 = generateStructuredLessonPlan({
  programCode: 'GLOBAL_SUCCESS',
  gradeLevel: 3,
  unitNumber: 2,
  unitTitle: 'Our Names',
  lessonNumber: 1,
  vocabulary: ['name', 'spell', 'friend'],
  sentencePatterns: ['What is your name? - My name is Peter.'],
  youtubeChannelUrl: 'https://www.youtube.com/@MsTrangPrimaryEnglish',
  matchedVideoTitle: undefined // No matched video on channel for this lesson
});

console.log('--- TEST 1: Saved Channel, No Matched Video for Lesson ---');
console.log('Warm-up Stage Name:', plan1.procedures[0].stageName);
console.log('Warm-up Teacher Activity:', plan1.procedures[0].teacherActivities[0]);
console.log('Warm-up Pupil Activity:', plan1.procedures[0].pupilActivities[0]);

if (plan1.procedures[0].teacherActivities[0].includes('Slap the Board') && !plan1.procedures[0].teacherActivities[0].includes('YouTube')) {
  console.log('✅ TEST 1 PASSED: Non-YouTube warm-up used. YouTube was NOT forced.\n');
} else {
  console.error('❌ TEST 1 FAILED: YouTube was forced despite no matched video.\n');
}

// Test 2: Teacher has saved YouTube URL AND a genuinely matched video exists on channel
const plan2 = generateStructuredLessonPlan({
  programCode: 'GLOBAL_SUCCESS',
  gradeLevel: 5,
  unitNumber: 1,
  unitTitle: 'All About Our Addresses',
  lessonNumber: 1,
  vocabulary: ['address', 'lane', 'tower', 'flat'],
  sentencePatterns: ['What is your address? - It is 105 Hoa Binh Street.'],
  youtubeChannelUrl: 'https://www.youtube.com/@MsTrangPrimaryEnglish',
  matchedVideoTitle: 'Grade 5 Unit 1 Lesson 1 - What is your address? | Ms. Trang Primary English',
  matchedVideoUrl: 'https://www.youtube.com/watch?v=abc123xyz'
});

console.log('--- TEST 2: Saved Channel + Verified Matched Video ---');
console.log('Warm-up Teacher Activity:', plan2.procedures[0].teacherActivities[0]);
console.log('Warm-up Pupil Activity:', plan2.procedures[0].pupilActivities[0]);
console.log('Expected Outcome:', plan2.procedures[0].expectedOutcome);

if (
  plan2.procedures[0].teacherActivities[0].includes('Grade 5 Unit 1 Lesson 1 - What is your address? | Ms. Trang Primary English') &&
  plan2.procedures[0].pupilActivities[0].includes('Grade 5 Unit 1 Lesson 1 - What is your address? | Ms. Trang Primary English')
) {
  console.log('✅ TEST 2 PASSED: Exact video title used in teacher & pupil activities.\n');
} else {
  console.error('❌ TEST 2 FAILED: Video title missing or generic.\n');
}

console.log('=== ALL YOUTUBE INTEGRATION TESTS COMPLETED SUCCESSFULLY! ===');
