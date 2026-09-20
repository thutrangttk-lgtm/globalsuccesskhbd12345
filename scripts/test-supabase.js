import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
const env = {};

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\r\n').join('\n').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        env[key] = val;
      }
    }
  });
}

const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

async function testConnection() {
  console.log('--- SUPABASE CONFIGURATION TEST ---');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '[SET]' : '[MISSING]');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[SET]' : '[MISSING]');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('RESULT: MISSING_CREDENTIALS');
    process.exit(1);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('RESULT: ERROR', error.message);
      process.exit(1);
    }
    console.log('RESULT: SUCCESS');
  } catch (err) {
    console.log('RESULT: ERROR', err.message);
    process.exit(1);
  }
}

testConnection();
