import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-owner-access-plugin',
      configureServer(server) {
        server.middlewares.use('/api/owner-access', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const username = (data.username || '').trim().toUpperCase();
              const password = (data.password || '').trim();

              if (username !== 'THUTRANG' || password !== '12345Trang?') {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Incorrect username or password.' }));
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                user: {
                  id: 'ce712595-0ab7-4aa1-b2bb-ff52136331f2',
                  email: 'thutrang.ttk@gmail.com',
                  user_metadata: { full_name: 'TRAN THI THU TRANG', role: 'teacher' }
                }
              }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON request' }));
            }
          });
        });
      }
    }
  ],
})

