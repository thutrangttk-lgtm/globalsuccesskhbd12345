const { Client } = require('pg');

const pass = encodeURIComponent('8Q!nd4-RvK4+fk+');
const projectRef = 'tzumhlmueqadgaxjahic';

const regions = [
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'eu-west-1',
  'eu-west-2',
  'eu-central-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'sa-east-1'
];

async function testRegions() {
  for (const reg of regions) {
    const connStr = `postgresql://postgres.${projectRef}:${pass}@aws-0-${reg}.pooler.supabase.com:6543/postgres`;
    console.log(`Testing region: ${reg}...`);
    const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      console.log(`SUCCESS CONNECTING TO REGION: ${reg}!`);
      const res = await client.query('SELECT current_database(), current_user;');
      console.log('Query result:', res.rows);
      await client.end();
      return connStr;
    } catch (err) {
      if (!err.message.includes('ENOTFOUND')) {
        console.log(`Region ${reg} returned:`, err.message);
      }
    }
  }
}

testRegions();
