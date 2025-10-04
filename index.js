require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory storage for URLs
let urlDatabase = [];
let id = 1;

// Helper to validate URL
function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  if (!isValidHttpUrl(original_url)) {
    return res.json({ error: 'invalid url' });
  }

  // DNS lookup to check if domain exists
  const hostname = urlParser.parse(original_url).hostname;
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // Check if already exists
      let found = urlDatabase.find(entry => entry.original_url === original_url);
      if (found) {
        return res.json({ original_url: found.original_url, short_url: found.short_url });
      }
      // Store and return
      let short_url = id++;
      urlDatabase.push({ original_url, short_url });
      res.json({ original_url, short_url });
    }
  });
});

// Redirect endpoint
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = parseInt(req.params.short_url);
  const entry = urlDatabase.find(e => e.short_url === short_url);
  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
