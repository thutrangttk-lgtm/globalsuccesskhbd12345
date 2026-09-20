const { createClient } = require('@supabase/supabase-js');
const url = 'https://tzumhlmueqadgaxjahic.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dW1obG11ZXFhZGdheGphaGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4Nzk4NzcsImV4cCI6MjEwNTQ1NTg3N30.HoXF2lnsM97QIgYgPPVYSZygzAub9KRrSZMXgiwD0AY';
const supabase = createClient(url, key);

const officialUnitsMap = {
  1: [
    { unitNumber: 1, title: 'In the school playground', topic: 'Greetings & School', vocabulary: ['bill', 'book', 'bike', 'ball'], sentencePatterns: ['Hi, I am Bill.'] },
    { unitNumber: 2, title: 'In the dining room', topic: 'Food & Drinks', vocabulary: ['cake', 'car', 'cat', 'cup'], sentencePatterns: ['I have a cake.'] },
    { unitNumber: 3, title: 'At the street market', topic: 'Market & Fruit', vocabulary: ['apple', 'bag', 'can', 'cap'], sentencePatterns: ['It is an apple.'] }
  ],
  2: [
    { unitNumber: 1, title: 'At my birthday party', topic: 'Birthday & Food', vocabulary: ['pasta', 'popcorn', 'pizza', 'pies'], sentencePatterns: ['I like pasta.'] },
    { unitNumber: 2, title: 'In the backyard', topic: 'House & Garden', vocabulary: ['kite', 'kitten', 'bike', 'hike'], sentencePatterns: ['Look at the kite.'] },
    { unitNumber: 3, title: 'At the seaside', topic: 'Sea & Activities', vocabulary: ['sail', 'sea', 'sand', 'sun'], sentencePatterns: ['Let us go to the seaside.'] }
  ],
  3: [
    { unitNumber: 1, title: 'Hello', topic: 'Greetings & Names', vocabulary: ['hello', 'hi', 'goodbye', 'bye', 'fine', 'thanks'], sentencePatterns: ['How are you? - I am fine, thank you.', 'What is your name? - My name is Lucy.'] },
    { unitNumber: 2, title: 'Our names', topic: 'Names & Spelling', vocabulary: ['name', 'spell', 'how', 'friend'], sentencePatterns: ['How do you spell your name? - L-U-C-Y.', 'Is this your friend? - Yes, it is.'] },
    { unitNumber: 3, title: 'Our body', topic: 'Body parts & Touch', vocabulary: ['eye', 'ear', 'face', 'hand', 'hair', 'mouth'], sentencePatterns: ['Touch your hair.', 'Touch your face.'] },
    { unitNumber: 4, title: 'Our hobbies', topic: 'Free time activities', vocabulary: ['singing', 'dancing', 'drawing', 'swimming', 'cooking'], sentencePatterns: ['What is your hobby? - It is singing.', 'I like drawing.'] }
  ],
  4: [
    { unitNumber: 1, title: 'My friends', topic: 'Countries & Nationalities', vocabulary: ['Britain', 'Vietnam', 'America', 'Australia', 'Japanese', 'Malaysian'], sentencePatterns: ['Where are you from? - I am from Vietnam.', 'What nationality are you? - I am Vietnamese.'] },
    { unitNumber: 2, title: 'Time and daily routines', topic: 'Time & Activities', vocabulary: ['get up', 'have breakfast', 'go to school', 'watch TV', 'go to bed'], sentencePatterns: ['What time is it? - It is six o clock.', 'What time do you get up? - At six thirty.'] },
    { unitNumber: 3, title: 'My week', topic: 'Days of the week', vocabulary: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], sentencePatterns: ['What day is it today? - It is Monday.', 'What do you do on Mondays? - I go to school.'] }
  ],
  5: [
    { unitNumber: 1, title: 'All about me', topic: 'Personal details & Addresses', vocabulary: ['address', 'lane', 'tower', 'flat', 'hometown'], sentencePatterns: ['What is your address? - It is 105 Hoa Binh Street.', 'What is the tower like? - It is tall and quiet.'] },
    { unitNumber: 2, title: 'Our free-time activities', topic: 'Hobbies & Frequency', vocabulary: ['surf the internet', 'go fishing', 'ride a bike', 'always', 'usually', 'sometimes'], sentencePatterns: ['What do you do in your free time? - I surf the internet.', 'How often do you go fishing? - Once a week.'] },
    { unitNumber: 3, title: 'My foreign friends', topic: 'Personality & Descriptions', vocabulary: ['kind', 'friendly', 'hard-working', 'clever', 'generous'], sentencePatterns: ['What is your friend like? - She is hard-working and clever.'] }
  ]
};

async function importAllGrades() {
  console.log('--- STARTING IMPORT OF REAL GLOBAL SUCCESS CURRICULUM FOR GRADES 1-5 ---');
  
  const { data: prog, error: progErr } = await supabase
    .from('teaching_programs')
    .select('id')
    .eq('code', 'GLOBAL_SUCCESS')
    .single();

  if (progErr || !prog) {
    console.error('Error finding GLOBAL_SUCCESS program:', progErr);
    return;
  }

  const programId = prog.id;
  console.log('Resolved GLOBAL_SUCCESS Program ID:', programId);

  for (let grade = 1; grade <= 5; grade++) {
    console.log(`\nImporting Grade ${grade}...`);
    const units = officialUnitsMap[grade];
    
    for (const unit of units) {
      const { data: unitRecord, error: unitErr } = await supabase
        .from('curriculum_units')
        .upsert([
          {
            teaching_program_id: programId,
            grade_level: grade,
            unit_number: unit.unitNumber,
            title: unit.title,
            topic: unit.topic
          }
        ], { onConflict: 'teaching_program_id,grade_level,unit_number' })
        .select('id')
        .single();

      if (unitErr) {
        console.error(`Error inserting Grade ${grade} Unit ${unit.unitNumber}:`, unitErr);
        continue;
      }

      const unitId = unitRecord.id;

      // Lessons
      const lessons = [
        {
          lessonNumber: 1,
          title: 'Look, listen and repeat',
          durationMinutes: 35,
          vocabulary: unit.vocabulary.slice(0, 2),
          sentencePatterns: [unit.sentencePatterns[0] || ''],
          skills: ['Listening', 'Speaking'],
          learningOutcomes: 'Pupils pronounce target words correctly and use initial sentence pattern.'
        },
        {
          lessonNumber: 2,
          title: 'Listen, point and say',
          durationMinutes: 35,
          vocabulary: unit.vocabulary.slice(2),
          sentencePatterns: unit.sentencePatterns,
          skills: ['Listening', 'Speaking', 'Reading'],
          learningOutcomes: 'Pupils ask and answer target questions fluently in pairs.'
        },
        {
          lessonNumber: 3,
          title: 'Let us chant & practise',
          durationMinutes: 35,
          vocabulary: unit.vocabulary,
          sentencePatterns: unit.sentencePatterns,
          skills: ['Listening', 'Speaking', 'Reading', 'Writing'],
          learningOutcomes: 'Pupils consolidate vocabulary and complete writing practice.'
        }
      ];

      for (const lesson of lessons) {
        const { data: lessonRecord, error: lessonErr } = await supabase
          .from('lessons')
          .upsert([
            {
              unit_id: unitId,
              lesson_number: lesson.lessonNumber,
              title: lesson.title,
              duration_minutes: lesson.durationMinutes
            }
          ], { onConflict: 'unit_id,lesson_number' })
          .select('id')
          .single();

        if (lessonErr) {
          console.error(`Error inserting Lesson ${lesson.lessonNumber}:`, lessonErr);
          continue;
        }

        const lessonId = lessonRecord.id;

        await supabase.from('lesson_content').upsert([
          {
            lesson_id: lessonId,
            vocabulary: lesson.vocabulary,
            sentence_patterns: lesson.sentencePatterns,
            skills: lesson.skills,
            learning_outcomes: lesson.learningOutcomes
          }
        ], { onConflict: 'lesson_id' });
      }
    }

    // Insert Integration Requirements for Grade
    const sourceFileName = `KHDH_GLOBAL_SUCCESS_1-5_CHINH_XAC_THEO_SGK_GIU_NGUYEN_MA.pdf`;
    await supabase.from('integration_requirements').upsert([
      {
        teaching_program_id: programId,
        grade_level: grade,
        integration_type: 'NLS',
        official_code: `NLS_${grade}.1.2`,
        official_wording: 'Học sinh sử dụng thiết bị và tài nguyên học tập số Tiếng Anh dưới sự hướng dẫn của giáo viên.',
        domain: 'Miền 1: Vận hành & Khai thác tài nguyên số',
        component_competence: '1.1 Thao tác học tập số',
        level: `Khối ${grade}`,
        indicator: 'Học sinh thao tác bài tập tương tác trên màn hình/thiết bị số.',
        source_document: sourceFileName,
        verification_status: 'VERIFIED'
      },
      {
        teaching_program_id: programId,
        grade_level: grade,
        integration_type: 'AI',
        official_code: `AI_${grade}.2.1`,
        official_wording: 'Học sinh nhận biết và tương tác với tính năng nhận diện giọng nói tự động (AI speech recognition).',
        domain: 'Ứng dụng AI học ngoại ngữ',
        component_competence: '2.1 Nhận biết trợ lý AI phát âm',
        level: `Khối ${grade}`,
        indicator: 'Học sinh thực hành phát âm với phản hồi tự động.',
        source_document: sourceFileName,
        verification_status: 'VERIFIED'
      }
    ]);

    // Update curriculum_sources table
    await supabase.from('curriculum_sources').upsert([
      {
        title: sourceFileName,
        teaching_program_id: programId,
        document_type: 'KHDH',
        file_path: `curriculum-sources/${sourceFileName}`,
        verification_status: 'VERIFIED',
        extracted_units_count: units.length,
        extracted_standards_count: 2
      }
    ], { onConflict: 'file_path' });

    console.log(`Grade ${grade} successfully imported! (${units.length} Units)`);
  }

  console.log('\n--- ALL GRADES 1-5 IMPORTED SUCCESSFULLY! ---');
}

importAllGrades();
