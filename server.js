const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the public directory
app.use(express.static('public'));

// Serve the main HTML file for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`AIMCS Frontend server running on port ${port}`);
  console.log(`Visit: http://localhost:${port}`);
}); 