const { Client } = require('pg');

const pass = encodeURIComponent('8Q!nd4-RvK4+fk+');
const connectionString = `postgresql://postgres.tzumhlmueqadgaxjahic:${pass}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`;

async function fixRLS() {
  console.log('Connecting to PostgreSQL Pooler to update RLS policies...');
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');

    const tables = [
      'teaching_programs',
      'grades',
      'curriculum_units',
      'lessons',
      'lesson_content',
      'integration_requirements',
      'curriculum_sources'
    ];

    for (const t of tables) {
      console.log(`Updating RLS policies for table public.${t}...`);
      await client.query(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;`);
      await client.query(`DROP POLICY IF EXISTS "Public all ${t}" ON public.${t};`);
      await client.query(`CREATE POLICY "Public all ${t}" ON public.${t} FOR ALL USING (true) WITH CHECK (true);`);
    }

    console.log('All table RLS policies successfully updated!');
    await client.end();
  } catch (err) {
    console.error('Error updating RLS policies:', err);
    process.exit(1);
  }
}

fixRLS();
