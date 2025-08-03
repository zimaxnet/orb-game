import fs from 'fs';

console.log('🔧 Fixing max_tokens to max_completion_tokens');
console.log('=' .repeat(50));

async function fixMaxTokens() {
  try {
    // Read the backend file
    const filePath = 'backend/backend-server.js';
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log('📋 Original file loaded');
    console.log(`  File size: ${content.length} characters`);
    
    // Count occurrences of max_tokens
    const oldTokenCount = (content.match(/max_tokens:/g) || []).length;
    console.log(`  Found ${oldTokenCount} occurrences of max_tokens`);
    
    // Replace all occurrences
    const newContent = content.replace(
      /max_tokens:/g,
      'max_completion_tokens:'
    );
    
    // Count occurrences of max_completion_tokens
    const newTokenCount = (newContent.match(/max_completion_tokens:/g) || []).length;
    console.log(`  Replaced with ${newTokenCount} occurrences of max_completion_tokens`);
    
    // Write the updated file
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('✅ File updated successfully');
    
    // Verify the changes
    const updatedContent = fs.readFileSync(filePath, 'utf8');
    const finalTokenCount = (updatedContent.match(/max_completion_tokens:/g) || []).length;
    console.log(`  Final count: ${finalTokenCount} max_completion_tokens`);
    
    console.log('=' .repeat(50));
    console.log('🎉 Max Tokens Fix Complete!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Error fixing max tokens:', error.message);
    process.exit(1);
  }
}

// Run the fix
if (import.meta.url === `file://${process.argv[1]}`) {
  fixMaxTokens()
    .then(() => {
      console.log('\n🔧 Max Tokens Fix Complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Max tokens fix failed:', error);
      process.exit(1);
    });
}

export { fixMaxTokens }; 