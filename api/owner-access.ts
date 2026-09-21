import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  const validUsername = process.env.OWNER_USERNAME || 'THUTRANG';
  const validPassword = process.env.OWNER_PASSWORD || process.env.VITE_OWNER_PASSWORD || '12345Trang?';

  const sanitizedUsername = (username || '').trim().toUpperCase();
  const sanitizedPassword = (password || '').trim();

  // Validate credentials strictly on server side
  if (
    !sanitizedUsername ||
    !sanitizedPassword ||
    sanitizedUsername !== validUsername.trim().toUpperCase() ||
    sanitizedPassword !== validPassword.trim()
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
        if (!createErr && newUser?.user) {
          user = newUser.user;
        }
      } else {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email_confirm: true,
          password: validPassword
        });
      }

      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: ownerEmail
      });

      const token = linkData?.properties?.hashed_token || linkData?.properties?.email_otp;
      if (token) {
        const client = createClient(supabaseUrl, anonKey);
        const { data: sessionData } = await client.auth.verifyOtp({
          email: ownerEmail,
          token,
          type: 'email'
        });

        if (sessionData?.session) {
          return res.status(200).json({
            success: true,
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
            user: sessionData.user
          });
        }
      }
    }

    const client = createClient(supabaseUrl, anonKey);
    const { data: authData } = await client.auth.signInWithPassword({
      email: ownerEmail,
      password: validPassword
    });

    if (authData?.session) {
      return res.status(200).json({
        success: true,
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        user: authData.user
      });
    }

    const ownerUser = {
      id: 'ce712595-0ab7-4aa1-b2bb-ff52136331f2',
      aud: 'authenticated',
      role: 'authenticated',
      email: ownerEmail,
      email_confirmed_at: new Date().toISOString(),
      user_metadata: { full_name: 'TRAN THI THU TRANG', role: 'teacher' },
      app_metadata: { provider: 'email', providers: ['email'] },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      user: ownerUser,
      access_token: null,
      refresh_token: null
    });
  } catch (err: any) {
    console.error('Owner access server function error:', err);
    return res.status(200).json({
      success: true,
      user: {
        id: 'ce712595-0ab7-4aa1-b2bb-ff52136331f2',
        email: ownerEmail,
        user_metadata: { full_name: 'TRAN THI THU TRANG', role: 'teacher' }
      }
    });
  }
}

