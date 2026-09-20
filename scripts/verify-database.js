import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzumhlmueqadgaxjahic.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dW1obG11ZXFhZGdheGphaGljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTg3OTg3NywiZXhwIjoyMTA1NDU1ODc3fQ.AMr2t7r-fMt0jbJosjrD7oFgIQZAJHPQSl3rgEOfvfU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkDatabase() {
  console.log('=== SUPABASE DATABASE TABLE VERIFICATION ===');

  const tables = [
    'profiles',
    'teaching_programs',
    'grades',
    'curriculum_units',
    'lessons',
    'lesson_content',
    'lesson_plans',
    'curriculum_sources',
    'integration_requirements',
    'lesson_integrations',
    'teaching_resources',
    'lesson_source_inputs',
    'lesson_source_images'
  ];

  let missingTables = [];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`[x] Table '${table}': NOT CREATED YET (${error.message})`);
      missingTables.push(table);
    } else {
      console.log(`[✓] Table '${table}': READY`);
    }
  }

  if (missingTables.length === 0) {
    console.log('\nALL 13 TABLES ARE ACTIVE AND READY IN SUPABASE!');
  } else {
    console.log(`\nNote: ${missingTables.length} tables need to be created by executing schema.sql in Supabase SQL Editor.`);
  }
}

checkDatabase();
