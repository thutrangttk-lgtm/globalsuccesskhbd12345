const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tzumhlmueqadgaxjahic.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dW1obG11ZXFhZGdheGphaGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4Nzk4NzcsImV4cCI6MjEwNTQ1NTg3N30.HoXF2lnsM97QIgYgPPVYSZygzAub9KRrSZMXgiwD0AY';

const supabase = createClient(supabaseUrl, anonKey);

const officialCurriculum = {
  1: [
    { unit_number: 1, title: 'In the school playground', topic: 'Greetings & School' },
    { unit_number: 2, title: 'In the dining room', topic: 'Food & Drinks' },
    { unit_number: 3, title: 'At the street market', topic: 'Market & Fruit' },
    { unit_number: 4, title: 'In the bedroom', topic: 'House & Furniture' },
    { unit_number: 5, title: 'At the zoo', topic: 'Animals & Nature' },
    { unit_number: 6, title: 'In the classroom', topic: 'School & Classroom' },
    { unit_number: 7, title: 'In the garden', topic: 'Plants & Nature' },
    { unit_number: 8, title: 'In the park', topic: 'Outdoor & Park' },
    { unit_number: 9, title: 'In the shop', topic: 'Shopping & Toys' },
    { unit_number: 10, title: 'At the bus stop', topic: 'Transportation' },
    { unit_number: 11, title: 'At the playground', topic: 'Playground Games' },
    { unit_number: 12, title: 'At the lake', topic: 'Nature & Animals' },
    { unit_number: 13, title: 'In the toy shop', topic: 'Toys & Colors' },
    { unit_number: 14, title: 'In the computer room', topic: 'Technology' },
    { unit_number: 15, title: 'At the football match', topic: 'Sports & Games' },
    { unit_number: 16, title: 'At the campsite', topic: 'Camping & Outdoor' }
  ],
  2: [
    { unit_number: 1, title: 'At my birthday party', topic: 'Birthday & Party' },
    { unit_number: 2, title: 'In the backyard', topic: 'Home & Garden' },
    { unit_number: 3, title: 'At the seaside', topic: 'Beach & Sea' },
    { unit_number: 4, title: 'In the countryside', topic: 'Nature & Village' },
    { unit_number: 5, title: 'In the classroom', topic: 'Classroom Objects' },
    { unit_number: 6, title: 'On the farm', topic: 'Farm Animals' },
    { unit_number: 7, title: 'In the kitchen', topic: 'Food & Cooking' },
    { unit_number: 8, title: 'In the village', topic: 'Community & Places' },
    { unit_number: 9, title: 'In the grocery store', topic: 'Shopping & Food' },
    { unit_number: 10, title: 'At the zoo', topic: 'Wild Animals' },
    { unit_number: 11, title: 'In the playground', topic: 'Activities' },
    { unit_number: 12, title: 'At the cafe', topic: 'Drinks & Snacks' },
    { unit_number: 13, title: 'In the library', topic: 'Books & Reading' },
    { unit_number: 14, title: 'In the toy shop', topic: 'Toys & Hobbies' },
    { unit_number: 15, title: 'At the supermarket', topic: 'Shopping' },
    { unit_number: 16, title: 'At the campsite', topic: 'Outdoor Activities' }
  ],
  3: [
    { unit_number: 1, title: 'Hello', topic: 'Greetings & Names' },
    { unit_number: 2, title: 'Our names', topic: 'Names & Spelling' },
    { unit_number: 3, title: 'Our body', topic: 'Body parts & Touch' },
    { unit_number: 4, title: 'Our hobbies', topic: 'Free time activities' },
    { unit_number: 5, title: 'My hobbies', topic: 'Personal Hobbies' },
    { unit_number: 6, title: 'Our school', topic: 'School Facilities' },
    { unit_number: 7, title: 'Classroom instructions', topic: 'Commands & Actions' },
    { unit_number: 8, title: 'My school things', topic: 'School Supplies' },
    { unit_number: 9, title: 'Colours', topic: 'Colours & Objects' },
    { unit_number: 10, title: 'Break time activities', topic: 'Break time & Games' },
    { unit_number: 11, title: 'My family', topic: 'Family Members' },
    { unit_number: 12, title: 'Jobs', topic: 'Occupations' },
    { unit_number: 13, title: 'My house', topic: 'House & Rooms' },
    { unit_number: 14, title: 'My bedroom', topic: 'Bedroom & Furniture' },
    { unit_number: 15, title: 'At the dining table', topic: 'Meals & Drinks' },
    { unit_number: 16, title: 'Do you have any pets?', topic: 'Pets & Animals' },
    { unit_number: 17, title: 'Our toys', topic: 'Toys & Possessions' },
    { unit_number: 18, title: 'Playing cubes', topic: 'Games & Shapes' },
    { unit_number: 19, title: 'Outdoor activities', topic: 'Outdoor Sports' },
    { unit_number: 20, title: 'At the zoo', topic: 'Zoo Animals' }
  ],
  4: [
    { unit_number: 1, title: 'My friends', topic: 'Countries & Nationalities' },
    { unit_number: 2, title: 'Time and daily routines', topic: 'Time & Activities' },
    { unit_number: 3, title: 'My week', topic: 'Days of the week' },
    { unit_number: 4, title: 'My birthday party', topic: 'Dates & Months' },
    { unit_number: 5, title: 'Things we can do', topic: 'Abilities & Can' },
    { unit_number: 6, title: 'Our school facilities', topic: 'Places in School' },
    { unit_number: 7, title: 'Our timetables', topic: 'Subjects & Schedules' },
    { unit_number: 8, title: 'My favourite subjects', topic: 'School Subjects' },
    { unit_number: 9, title: 'Our sports day', topic: 'Sports & Competitions' },
    { unit_number: 10, title: 'Our sports field', topic: 'Sports Facilities' },
    { unit_number: 11, title: 'My family’s weekend', topic: 'Weekend Activities' },
    { unit_number: 12, title: 'Jobs and workplaces', topic: 'Professions & Workplaces' },
    { unit_number: 13, title: 'Appearance and character', topic: 'Descriptions' },
    { unit_number: 14, title: 'My favourite food and drink', topic: 'Food & Beverages' },
    { unit_number: 15, title: 'At the shopping centre', topic: 'Shopping & Prices' },
    { unit_number: 16, title: 'Weather and clothes', topic: 'Weather & Clothing' },
    { unit_number: 17, title: 'In the city', topic: 'City Life & Places' },
    { unit_number: 18, title: 'At the weekend', topic: 'Past Activities' },
    { unit_number: 19, title: 'Means of transport', topic: 'Transportation' },
    { unit_number: 20, title: 'Our summer holidays', topic: 'Summer & Travel' }
  ],
  5: [
    { unit_number: 1, title: 'All about me', topic: 'Personal details & Addresses' },
    { unit_number: 2, title: 'Our free-time activities', topic: 'Hobbies & Frequency' },
    { unit_number: 3, title: 'My foreign friends', topic: 'Personality & Descriptions' },
    { unit_number: 4, title: 'Our favourite songs and stories', topic: 'Literature & Music' },
    { unit_number: 5, title: 'Our health', topic: 'Health & Illnesses' },
    { unit_number: 6, title: 'Our school rooms', topic: 'School Environment' },
    { unit_number: 7, title: 'Our school activities', topic: 'School Events' },
    { unit_number: 8, title: 'In our classroom', topic: 'Classroom Life' },
    { unit_number: 9, title: 'Our outdoor activities', topic: 'Outdoor Recreation' },
    { unit_number: 10, title: 'Our school trips', topic: 'Excursions' },
    { unit_number: 11, title: 'Family life', topic: 'Household Chores' },
    { unit_number: 12, title: 'Our future jobs', topic: 'Career Aspirations' },
    { unit_number: 13, title: 'Our favourite food and drink', topic: 'Nutrition & Taste' },
    { unit_number: 14, title: 'At the shopping mall', topic: 'Shopping & Places' },
    { unit_number: 15, title: 'Our weather and seasons', topic: 'Seasons & Climate' },
    { unit_number: 16, title: 'Seasons and activities', topic: 'Seasonal Sports' },
    { unit_number: 17, title: 'Places of interest', topic: 'Sightseeing & Travel' },
    { unit_number: 18, title: 'Means of transport', topic: 'Travel & Distance' },
    { unit_number: 19, title: 'Directions', topic: 'Asking & Giving Directions' },
    { unit_number: 20, title: 'Our summer holidays', topic: 'Vacation Experiences' }
  ]
};

async function seed() {
  console.log('=== SEEDING ALL OFFICIAL GLOBAL SUCCESS UNITS & LESSONS ===');

  let { data: program } = await supabase
    .from('teaching_programs')
    .select('id')
    .eq('code', 'GLOBAL_SUCCESS')
    .maybeSingle();

  if (!program) {
    const { data: newProg } = await supabase
      .from('teaching_programs')
      .insert([{ code: 'GLOBAL_SUCCESS', name: 'Global Success English' }])
      .select('id')
      .single();
    program = newProg;
  }

  const programId = program.id;

  for (const gradeStr of Object.keys(officialCurriculum)) {
    const grade = parseInt(gradeStr, 10);
    const unitsList = officialCurriculum[grade];
    console.log(`\nSeeding Grade ${grade} (${unitsList.length} units)...`);

    for (const u of unitsList) {
      // Upsert unit
      const { data: unitRecord, error: uErr } = await supabase
        .from('curriculum_units')
        .upsert([
          {
            teaching_program_id: programId,
            grade_level: grade,
            unit_number: u.unit_number,
            title: u.title,
            topic: u.topic
          }
        ], { onConflict: 'teaching_program_id,grade_level,unit_number' })
        .select('id')
        .single();

      if (uErr) {
        console.error(`Error seeding Grade ${grade} Unit ${u.unit_number}:`, uErr.message);
        continue;
      }

      const unitId = unitRecord.id;

      // Upsert 3 standard lessons (Lesson 1, Lesson 2, Lesson 3)
      for (let lNum = 1; lNum <= 3; lNum++) {
        const { data: lessonRecord, error: lErr } = await supabase
          .from('lessons')
          .upsert([
            {
              unit_id: unitId,
              lesson_number: lNum,
              title: `Lesson ${lNum}`,
              duration_minutes: 35
            }
          ], { onConflict: 'unit_id,lesson_number' })
          .select('id')
          .single();

        if (lErr) {
          console.error(`Error seeding Lesson ${lNum} for Unit ${u.unit_number}:`, lErr.message);
        }
      }
    }
  }

  console.log('\n=== SEEDING COMPLETED SUCCESSFULLY! ===');
}

seed();
