require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  if (!req.body.url || !req.body.url.startsWith('http')) {
    return res.json({ error: 'invalid url' });
  } else {
    return res.json({ original_url: req.body.url, short_url: 1 });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
