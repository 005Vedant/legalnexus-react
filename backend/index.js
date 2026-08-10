const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4000,http://127.0.0.1:5173,http://127.0.0.1:4000').split(',');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok' });
});

const lawyers = require('./routes/lawyers');
const cases = require('./routes/cases');
const faqs = require('./routes/faqs');
const hearings = require('./routes/hearings');
const profiles = require('./routes/profiles');
const reviews = require('./routes/reviews');

app.use('/api/lawyers', lawyers);
app.use('/api/cases', cases);
app.use('/api/faqs', faqs);
app.use('/api/hearings', hearings);
app.use('/api/profiles', profiles); 
app.use('/api/reviews', reviews);

// Serve static frontend build
const distPath = path.resolve(__dirname, '../frontend/dist');
const indexPath = path.resolve(distPath, 'index.html');

app.use(express.static(distPath, { index: 'index.html' }));

// Fallback handler for React SPA navigation & Chrome DevTools probes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  if (req.path.startsWith('/.well-known')) {
    return res.status(404).end();
  }
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      if (!res.headersSent) {
        res.status(500).send('Error loading page: ' + err.message);
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`LegalNexus unified server running on http://localhost:${PORT}`));