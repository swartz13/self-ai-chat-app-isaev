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

// Hata yakalayici - multer boyut hatalari dahil.
app.use((err, _req, res, _next) => {
  const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 500;
  res.status(status).json({ error: err.message || 'Sunucu hatasi' });
});

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port);

server.on('listening', () => {
  console.log(`\n  ISAEV AI  ->  http://localhost:${port}`);
  console.log(`  Sohbet modeli  :  ${(process.env.CHAT_MODELS || '').split(',')[0].split('|')[0] || 'tanimsiz'}`);
  console.log(`  Gorsel modeli  :  ${process.env.IMAGE_MODEL || 'google/gemini-2.5-flash-image'}`);
  console.log(`  Durdurmak icin :  Ctrl+C\n`);
});

// Hata dinleyicisi olmadan port dolulugu, basarili gibi gorunup sessizce cikiyordu.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  HATA: ${port} portu zaten kullanimda.`);
    console.error(`  Muhtemelen sunucu baska bir terminalde acik. Secenekler:`);
    console.error(`    1) Zaten calisiyor olabilir: http://localhost:${port} adresini deneyin.`);
    console.error(`    2) Eskisini kapatin:  lsof -ti:${port} | xargs -r kill`);
    console.error(`    3) Baska port kullanin:  PORT=3005 npm start\n`);
  } else if (err.code === 'EACCES') {
    console.error(`\n  HATA: ${port} portunu acma izniniz yok. 1024 ustu bir port deneyin: PORT=3005 npm start\n`);
  } else {
    console.error(`\n  Sunucu baslatilamadi: ${err.message}\n`);
  }
  process.exit(1);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    console.log('\n  Kapatiliyor...');
    server.close(() => process.exit(0));
    // Acik baglantilar takilirsa yine de cik.
    setTimeout(() => process.exit(0), 2000).unref();
  });
}
