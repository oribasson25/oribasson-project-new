import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

/*
 * `npm run dev` serves the site and the /api functions together, so the
 * whole thing runs locally without the Vercel CLI. Each request loads the
 * function file fresh through Vite, so edits to api/ and server/ apply on the
 * next request.
 */
function vercelFunctions() {
  return {
    name: 'local-vercel-functions',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://local');
        if (!url.pathname.startsWith('/api/')) return next();
        const file = path.join(process.cwd(), `${url.pathname.replace(/\/$/, '')}.js`);
        if (!fs.existsSync(file)) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Not found' }));
        }
        try {
          const mod = await server.ssrLoadModule(file);
          await mod.default(req, res);
        } catch (err) {
          console.error(`[api] ${url.pathname}`, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          } else {
            res.end();
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // The functions read process.env, as they do on Vercel.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [react(), vercelFunctions()],
    server: { port: 5173 },
  };
});
