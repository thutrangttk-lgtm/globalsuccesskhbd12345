const { Client } = require('pg');

const pass = encodeURIComponent('8Q!nd4-RvK4+fk+');
const hosts = [
  `postgresql://postgres.tzumhlmueqadgaxjahic:${pass}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.tzumhlmueqadgaxjahic:${pass}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.tzumhlmueqadgaxjahic:${pass}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.tzumhlmueqadgaxjahic:${pass}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${pass}@db.tzumhlmueqadgaxjahic.supabase.co:5432/postgres`
];

async function testAllHosts() {
  for (const connStr of hosts) {
    console.log('Testing connection string:', connStr.replace(pass, '***'));
    const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log('SUCCESS CONNECTING!');
      const res = await client.query('SELECT current_database(), current_user;');
      console.log('Query result:', res.rows);
      await client.end();
      return connStr;
    } catch (err) {
      console.log('Error:', err.message);
    }
  }
}

testAllHosts();
