import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzumhlmueqadgaxjahic.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dW1obG11ZXFhZGdheGphaGljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTg3OTg3NywiZXhwIjoyMTA1NDU1ODc3fQ.AMr2t7r-fMt0jbJosjrD7oFgIQZAJHPQSl3rgEOfvfU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function listStorageFiles() {
  console.log('=== LISTING FILES IN SUPABASE STORAGE BUCKET: curriculum-sources ===');

  const { data, error } = await supabase.storage.from('curriculum-sources').list('', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  });

  if (error) {
    console.error('Error listing curriculum-sources bucket:', error.message);
  } else {
    console.log(`Found ${data.length} files in curriculum-sources:`);
    data.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name} (${file.metadata?.size || 'N/A'} bytes, mime: ${file.metadata?.mimetype || 'N/A'})`);
    });
  }
}

listStorageFiles();
