import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  const validUsername = process.env.OWNER_USERNAME || 'THUTRANG';
  const validPassword = process.env.OWNER_PASSWORD || process.env.VITE_OWNER_PASSWORD || '12345Trang?';

  if (
    !username ||
    !password ||
    username.trim().toUpperCase() !== validUsername.toUpperCase() ||
    password !== validPassword
  ) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  const ownerEmail = 'thutrang.ttk@gmail.com';
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://tzumhlmueqadgaxjahic.supabase.co';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dW1obG11ZXFhZGdheGphaGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4Nzk4NzcsImV4cCI6MjEwNTQ1NTg3N30.HoXF2lnsM97QIgYgPPVYSZygzAub9KRrSZMXgiwD0AY';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    if (serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
      let user = userData?.users?.find((u: any) => u.email?.toLowerCase() === ownerEmail);

      if (!user) {
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: ownerEmail,
          password: validPassword,
          email_confirm: true,
          user_metadata: { full_name: 'TRAN THI THU TRANG', role: 'teacher' }
        });
        if (createErr) throw createErr;
        user = newUser.user;
      } else if (!user.email_confirmed_at) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email_confirm: true,
          password: validPassword
        });
      }

      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: ownerEmail
      });

      if (linkErr) throw linkErr;

      const token = linkData.properties?.hashed_token || linkData.properties?.email_otp;
      if (token) {
        const client = createClient(supabaseUrl, anonKey);
        const { data: sessionData, error: verifyErr } = await client.auth.verifyOtp({
          email: ownerEmail,
          token,
          type: 'email'
        });

        if (sessionData?.session) {
          return res.status(200).json({
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
            user: sessionData.user
          });
        }
        if (verifyErr) throw verifyErr;
      }
    }

    // Direct server-side authentication using server credentials
    const client = createClient(supabaseUrl, anonKey);
    let { data: authData, error: authErr } = await client.auth.signInWithPassword({
      email: ownerEmail,
      password: validPassword
    });

    if (authErr && (authErr.message?.includes('Invalid login credentials') || authErr.message?.includes('User not found'))) {
      const { data: signUpData, error: signUpErr } = await client.auth.signUp({
        email: ownerEmail,
        password: validPassword,
        options: {
          data: { full_name: 'TRAN THI THU TRANG', role: 'teacher' }
        }
      });
      if (signUpErr) throw signUpErr;
      if (signUpData.session) {
        return res.status(200).json({
          access_token: signUpData.session.access_token,
          refresh_token: signUpData.session.refresh_token,
          user: signUpData.user
        });
      }
    } else if (authErr) {
      throw authErr;
    }

    if (authData?.session) {
      return res.status(200).json({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        user: authData.user
      });
    }

    throw new Error('Server-side authentication could not create session.');
  } catch (err: any) {
    console.error('Owner access error:', err);
    return res.status(500).json({ error: err.message || 'Authentication error.' });
  }
}
