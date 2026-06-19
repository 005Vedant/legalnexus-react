const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok' })
})

const lawyers = require('./routes/lawyers');
const cases = require('./routes/cases');
const faqs = require('./routes/faqs');
const items = require('./routes/items');
const hearings = require('./routes/hearings');
const profiles = require('./routes/profiles');
const reviews = require('./routes/reviews');

app.use('/api/lawyers', lawyers);
app.use('/api/cases', cases);
app.use('/api/faqs', faqs);
app.use('/api/items', items);
app.use('/api/hearings', hearings);
app.use('/api/profiles', profiles); 
app.use('/api/reviews', reviews);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));