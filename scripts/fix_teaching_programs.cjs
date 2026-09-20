const { Client } = require('pg');

const pass = encodeURIComponent('8Q!nd4-RvK4+fk+');
const connectionString = `postgresql://postgres.tzumhlmueqadgaxjahic:${pass}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`;

async function fixTeachingPrograms() {
  console.log('Connecting to Supabase PostgreSQL Pooler (ap-northeast-1)...');
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');

    console.log('Granting table permissions to anon & authenticated roles...');
    await client.query('GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;');
    await client.query('GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;');
    await client.query('GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;');

    console.log('Inserting / updating master records in teaching_programs...');
    const seedQuery = `
      INSERT INTO public.teaching_programs (code, name, description, publisher)
      VALUES 
          ('GLOBAL_SUCCESS', 'Global Success', 'Official Primary English textbook series by Vietnam Education Publishing House', 'VIETNAM EDUCATION PUBLISHING HOUSE'),
          ('MOVE_UP', 'MOVE UP', 'Enhanced Primary English program', NULL),
          ('ENHANCED', 'Bài Dạy Tăng Cường', 'Teacher-designed supplementary English lessons', NULL),
          ('CUSTOM', 'Custom Lesson Plan', 'Teacher custom lesson plan from pasted text, images, or manual input', NULL)
      ON CONFLICT (code) DO UPDATE 
      SET name = EXCLUDED.name, description = EXCLUDED.description, publisher = EXCLUDED.publisher;
    `;
    await client.query(seedQuery);

    const res = await client.query('SELECT id, code, name FROM public.teaching_programs ORDER BY code ASC;');
    console.log('Current records in teaching_programs:');
    console.table(res.rows);

    await client.end();
    console.log('SUCCESSFULLY INITIALIZED TEACHING_PROGRAMS!');
  } catch (err) {
    console.error('Database query error:', err);
    process.exit(1);
  }
}

fixTeachingPrograms();
