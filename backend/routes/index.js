const express = require("express");
const router = express.Router();

const PORT = 5000
const urlDatabase = {}; // { code: { originalUrl, expiresAt, visits } }

// shorten endpoint
router.post("/shorturls", (req, res) => {
  const { url, visibility = 30, code } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // generate or use custom code
  const shortCode = code || Math.random().toString(36).substring(2, 8);
  const expiresAt = Date.now() + visibility * 60 * 1000; // ms

  urlDatabase[shortCode] = {
    originalUrl: url,
    expiresAt,
    visits: 0,
  };

  const shortUrl = `http://localhost:${PORT}/${shortCode}`;

  res.json({ shortUrl, expiresAt });
});

// redirect
router.get("/:code", (req, res) => {
  const record = urlDatabase[req.params.code];
  if (!record) {
    return res.status(404).send("URL not found");
  }

  if (Date.now() > record.expiresAt) {
    delete urlDatabase[req.params.code]; // remove expired
    return res.status(410).send("URL expired");
  }

  record.visits++;
  res.redirect(record.originalUrl);
});

module.exports = router;
