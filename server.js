import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, serveFile } from './src/api.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use('/api', api);
app.get('/files/:id', serveFile);
app.use(express.static(path.join(root, 'public'), { extensions: ['html'] }));

// Error handler - including multer file size limits
app.use((err, _req, res, _next) => {
  const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port);

server.on('listening', () => {
  console.log(`\n  ISAEV AI  ->  http://localhost:${port}`);
  console.log(`  Default Model :  ${(process.env.CHAT_MODELS || '').split(',')[0].split('|')[0] || 'undefined'}`);
  console.log(`  Image Model   :  ${process.env.IMAGE_MODEL || 'google/gemini-2.5-flash-image'}`);
  console.log(`  Press Ctrl+C to stop.\n`);
});

// Handle port conflicts gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ERROR: Port ${port} is already in use.`);
    console.error(`  The server may already be running in another terminal. Options:`);
    console.error(`    1) Check running instance: http://localhost:${port}`);
    console.error(`    2) Terminate old process:  lsof -ti:${port} | xargs -r kill`);
    console.error(`    3) Use a different port:   PORT=3005 npm start\n`);
  } else if (err.code === 'EACCES') {
    console.error(`\n  ERROR: Permission denied on port ${port}. Try a port above 1024: PORT=3005 npm start\n`);
  } else {
    console.error(`\n  Failed to start server: ${err.message}\n`);
  }
  process.exit(1);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    console.log('\n  Shutting down...');
    server.close(() => process.exit(0));
    // Force exit if hanging connections remain
    setTimeout(() => process.exit(0), 2000).unref();
  });
}
