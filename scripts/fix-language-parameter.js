import fs from 'fs';

// Read the backend server file
const filePath = 'backend/backend-server.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of generateDirectFallbackStory(category) with generateDirectFallbackStory(category, language)
const oldPattern = /generateDirectFallbackStory\(category\)/g;
const newPattern = 'generateDirectFallbackStory(category, language)';

content = content.replace(oldPattern, newPattern);

// Write the updated content back
fs.writeFileSync(filePath, content);

console.log('✅ Fixed all generateDirectFallbackStory calls to include language parameter'); 