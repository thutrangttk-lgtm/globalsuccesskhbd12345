const { Client } = require('pg');

const pass = encodeURIComponent('8Q!nd4-RvK4+fk+');
// Try direct pooler connection or direct DB host
const connectionString = `postgresql://postgres:${pass}@db.tzumhlmueqadgaxjahic.supabase.co:5432/postgres`;

async function fixTeachingPrograms() {
  console.log('Connecting to Supabase PostgreSQL...');
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');

    console.log('Granting table permissions to anon & authenticated roles...');
    await client.query('GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;');
    await client.query('GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;');
    await client.query('GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;');

    console.log('Inserting master records into teaching_programs...');
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

    const res = await client.query('SELECT id, code, name FROM public.teaching_programs;');
    console.log('Current records in teaching_programs:');
    console.table(res.rows);

    await client.end();
    console.log('SUCCESS!');
  } catch (err) {
    console.error('Database connection / query error:', err);
    process.exit(1);
  }
}

fixTeachingPrograms();
