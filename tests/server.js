// Serves the site with the same security headers Vercel sends, so tests catch anything those headers block.
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const headers = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'))).headers[0].headers.map((h) => [h.key, h.value]));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.normalize(path.join(root, url === '/' ? 'index.html' : url));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain', ...headers });
  fs.createReadStream(file).pipe(res);
}).listen(4173);
