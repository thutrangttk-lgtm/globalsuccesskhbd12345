import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzumhlmueqadgaxjahic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dW1obG11ZXFhZGdheGphaGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4Nzk4NzcsImV4cCI6MjEwNTQ1NTg3N30.HoXF2lnsM97QIgYgPPVYSZygzAub9KRrSZMXgiwD0AY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnon() {
  console.log('=== TESTING SUPABASE CLIENT ACCESS WITH ANON KEY ===');

  const { data: programs, error: progErr } = await supabase.from('teaching_programs').select('*');
  console.log('teaching_programs query:', progErr ? `ERROR: ${progErr.message}` : `SUCCESS (${programs?.length || 0} rows found)`);

  const { data: grades, error: gradeErr } = await supabase.from('grades').select('*');
  console.log('grades query:', gradeErr ? `ERROR: ${gradeErr.message}` : `SUCCESS (${grades?.length || 0} rows found)`);
}

testAnon();
