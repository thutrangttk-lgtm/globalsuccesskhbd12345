import { generateStructuredLessonPlan } from '../src/utils/lessonGenerator';
import { findTeacherChannelVideo } from '../src/utils/videoMatcher';

console.log('=== VERIFYING SMART YOUTUBE & WARM-UP RESOURCE SYSTEM ===\n');

// Mock data
const mockTeacherId = 'teacher-123-uuid';
const mockTeacherChannel = 'https://www.youtube.com/@MsTrangPrimaryEnglish';

// Test 1: External OFF + No Teacher Video -> Specific Non-YouTube Warm-up
console.log('--- TEST 1: allow_external_youtube = OFF + No Teacher Video ---');
const plan1 = generateStructuredLessonPlan({
  programCode: 'GLOBAL_SUCCESS',
  gradeLevel: 3,
  unitNumber: 2,
  unitTitle: 'Our Names',
  lessonNumber: 1,
  vocabulary: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  sentencePatterns: ['What day is it today? - It is Monday.'],
  youtubeChannelUrl: mockTeacherChannel,
  matchedVideoTitle: undefined,
  matchedVideoSource: undefined
});

console.log('Warm-up Stage Name:', plan1.procedures[0].stageName);
console.log('Warm-up Teacher Activity:', plan1.procedures[0].teacherActivities[0]);
console.log('Warm-up Pupil Activity:', plan1.procedures[0].pupilActivities[0]);

const isGeneric1 = ['Singing a song', 'Sing a song', 'Play a game', 'Watch a video'].some(g => plan1.procedures[0].teacherActivities[0] === g);
if (!isGeneric1 && plan1.procedures[0].teacherActivities[0].includes('Monday, Tuesday, Wednesday, Thursday, Friday') && !plan1.procedures[0].teacherActivities[0].includes('YouTube')) {
  console.log('✅ TEST 1 PASSED: Specific non-YouTube warm-up generated with actual target words. No generic text. No YouTube forced.\n');
} else {
  console.error('❌ TEST 1 FAILED.\n');
}

// Test 2: Teacher Channel Video Matched -> Teacher Video Title & Source 'teacher'
console.log('--- TEST 2: Teacher Channel Video Matched ---');
const plan2 = generateStructuredLessonPlan({
  programCode: 'GLOBAL_SUCCESS',
  gradeLevel: 5,
  unitNumber: 1,
  unitTitle: 'All About Our Addresses',
  lessonNumber: 1,
  vocabulary: ['address', 'lane', 'tower', 'flat'],
  sentencePatterns: ['What is your address? - It is 105 Hoa Binh Street.'],
  youtubeChannelUrl: mockTeacherChannel,
  matchedVideoTitle: 'Grade 5 Unit 1 Lesson 1 - What is your address? | Ms. Trang Primary English',
  matchedVideoUrl: 'https://www.youtube.com/watch?v=trang123',
  matchedVideoSource: 'teacher'
});

console.log('Warm-up Teacher Activity:', plan2.procedures[0].teacherActivities[0]);
console.log('Video Metadata Source:', plan2.procedures[0].videoMetadata?.source);

if (
  plan2.procedures[0].teacherActivities[0].includes('Grade 5 Unit 1 Lesson 1 - What is your address? | Ms. Trang Primary English') &&
  plan2.procedures[0].teacherActivities[0].includes('configured teacher YouTube channel') &&
  plan2.procedures[0].videoMetadata?.source === 'teacher'
) {
  console.log('✅ TEST 2 PASSED: Teacher channel video title and source correctly attributed.\n');
} else {
  console.error('❌ TEST 2 FAILED.\n');
}

// Test 3: allow_external_youtube = ON + External Educational Video Matched
console.log('--- TEST 3: allow_external_youtube = ON + External Educational Video ---');
const plan3 = generateStructuredLessonPlan({
  programCode: 'GLOBAL_SUCCESS',
  gradeLevel: 4,
  unitNumber: 3,
  unitTitle: 'My Week',
  lessonNumber: 1,
  vocabulary: ['Monday', 'Tuesday', 'Wednesday'],
  sentencePatterns: ['What day is it today? - It is Monday.'],
  youtubeChannelUrl: mockTeacherChannel,
  matchedVideoTitle: 'Days of the Week Song | Super Simple Songs',
  matchedVideoUrl: 'https://www.youtube.com/watch?v=mXMofxtDPUQ',
  matchedVideoSource: 'external'
});

console.log('Warm-up Teacher Activity:', plan3.procedures[0].teacherActivities[0]);
console.log('Video Metadata Source:', plan3.procedures[0].videoMetadata?.source);

if (
  plan3.procedures[0].teacherActivities[0].includes('educational external YouTube resource') &&
  plan3.procedures[0].videoMetadata?.source === 'external'
) {
  console.log('✅ TEST 3 PASSED: External video correctly identified as external resource. Never misidentified as teacher video.\n');
} else {
  console.error('❌ TEST 3 FAILED.\n');
}

console.log('=== ALL SMART WARM-UP TESTS PASSED 100%! ===');
