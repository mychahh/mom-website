const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 8080;
const MIME = {
  html: 'text/html; charset=utf-8',
  css: 'text/css',
  js: 'application/javascript',
  svg: 'image/svg+xml',
  png: 'image/png',
  ico: 'image/x-icon',
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.join(ROOT, urlPath);
  const ext = path.extname(file).slice(1);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => console.log('Server ready on http://localhost:' + PORT));
