const http = require('http');
const serveStatic = require('serve-static');
const path = require('path');
const fs = require('fs');

const BASE_PATH = '/dicoding-story-app';
const DIST_DIR = path.join(__dirname, 'dist');

const serve = serveStatic(DIST_DIR, {
  index: ['index.html'],
  fallthrough: true
});

const server = http.createServer((req, res) => {
  // Remove base path from request URL
  if (req.url.startsWith(BASE_PATH)) {
    req.url = req.url.slice(BASE_PATH.length);
  }
  
  // If URL is empty or '/', redirect to base path
  if (req.url === '') {
    req.url = '/';
  }

  serve(req, res, () => {
    // If no file is found, serve index.html
    res.setHeader('Content-Type', 'text/html');
    res.end(fs.readFileSync(path.join(DIST_DIR, 'index.html')));
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at:`);
  console.log(`http://localhost:${PORT}${BASE_PATH}`);
  console.log(`http://127.0.0.1:${PORT}${BASE_PATH}`);
}); 