import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzumhlmueqadgaxjahic.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dW1obG11ZXFhZGdheGphaGljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTg3OTg3NywiZXhwIjoyMTA1NDU1ODc3fQ.AMr2t7r-fMt0jbJosjrD7oFgIQZAJHPQSl3rgEOfvfU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testSelect() {
  console.log('--- TESTING DIRECT TABLE ACCESS ---');
  
  const { data: programs, error: progErr } = await supabase.from('teaching_programs').select('*');
  console.log('teaching_programs:', progErr ? `ERROR: ${progErr.message}` : `SUCCESS (${programs.length} rows found)`);
  if (programs && programs.length > 0) {
    console.log('Programs data:', programs);
  }

  const { data: grades, error: gradeErr } = await supabase.from('grades').select('*');
  console.log('grades:', gradeErr ? `ERROR: ${gradeErr.message}` : `SUCCESS (${grades.length} rows found)`);

  const { data: plans, error: planErr } = await supabase.from('lesson_plans').select('*');
  console.log('lesson_plans:', planErr ? `ERROR: ${planErr.message}` : `SUCCESS (${plans.length} rows found)`);
}

testSelect();
