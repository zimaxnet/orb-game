const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Check if dist folder exists, otherwise serve from current directory
const staticPath = fs.existsSync(path.join(__dirname, 'dist')) ? 'dist' : '.';

console.log(`Serving static files from: ${path.join(__dirname, staticPath)}`);

// Serve static files
app.use(express.static(path.join(__dirname, staticPath)));

// For SPA: serve index.html for any unknown route
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, staticPath)}`);
}); 