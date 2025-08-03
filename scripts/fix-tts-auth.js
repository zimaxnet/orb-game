import fs from 'fs';

console.log('🔧 Fixing TTS Authorization Headers');
console.log('=' .repeat(50));

async function fixTTSAuth() {
  try {
    // Read the backend file
    const filePath = 'backend/backend-server.js';
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log('📋 Original file loaded');
    console.log(`  File size: ${content.length} characters`);
    
    // Count occurrences of the old header
    const oldHeaderCount = (content.match(/'api-key': process\.env\.AZURE_OPENAI_API_KEY/g) || []).length;
    console.log(`  Found ${oldHeaderCount} occurrences of old 'api-key' header`);
    
    // Replace all occurrences
    const newContent = content.replace(
      /'api-key': process\.env\.AZURE_OPENAI_API_KEY/g,
      "'Authorization': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`"
    );
    
    // Count occurrences of the new header
    const newHeaderCount = (newContent.match(/'Authorization': `Bearer \${process\.env\.AZURE_OPENAI_API_KEY}`/g) || []).length;
    console.log(`  Replaced with ${newHeaderCount} occurrences of new 'Authorization' header`);
    
    // Write the updated file
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('✅ File updated successfully');
    
    // Verify the changes
    const updatedContent = fs.readFileSync(filePath, 'utf8');
    const finalHeaderCount = (updatedContent.match(/'Authorization': `Bearer \${process\.env\.AZURE_OPENAI_API_KEY}`/g) || []).length;
    console.log(`  Final count: ${finalHeaderCount} Authorization headers`);
    
    console.log('=' .repeat(50));
    console.log('🎉 TTS Authorization Headers Fixed!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Error fixing TTS auth headers:', error.message);
    process.exit(1);
  }
}

// Run the fix
if (import.meta.url === `file://${process.argv[1]}`) {
  fixTTSAuth()
    .then(() => {
      console.log('\n🔧 TTS Auth Fix Complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 TTS auth fix failed:', error);
      process.exit(1);
    });
}

export { fixTTSAuth }; 