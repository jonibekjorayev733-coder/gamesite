import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// API proxy - redirect to backend
app.use('/api', (req, res) => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  const proxyUrl = new URL(req.originalUrl, backendUrl);
  
  fetch(proxyUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  })
    .then(response => {
      res.status(response.status);
      response.headers.forEach((value, name) => res.setHeader(name, value));
      response.body.pipe(res);
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
