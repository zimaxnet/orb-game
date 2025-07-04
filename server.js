const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;
const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

// For SPA: serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 