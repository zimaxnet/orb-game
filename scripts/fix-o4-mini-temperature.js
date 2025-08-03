import fs from 'fs';

console.log('🔧 Fixing o4-mini temperature parameter');
console.log('=' .repeat(50));

async function fixO4MiniTemperature() {
  try {
    // Read the backend file
    const filePath = 'backend/backend-server.js';
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log('📋 Original file loaded');
    console.log(`  File size: ${content.length} characters`);
    
    // Find and fix the Azure OpenAI story generation function
    // Replace the temperature parameter in the o4-mini requests
    const newContent = content.replace(
      /max_completion_tokens: 800,\s*temperature: 0\.7/g,
      'max_completion_tokens: 800'
    );
    
    // Also fix the fallback story generation
    const finalContent = newContent.replace(
      /max_completion_tokens: 300,\s*temperature: 0\.7/g,
      'max_completion_tokens: 300'
    );
    
    // Write the updated file
    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log('✅ File updated successfully');
    
    // Verify the changes
    const updatedContent = fs.readFileSync(filePath, 'utf8');
    const temperatureCount = (updatedContent.match(/temperature: 0\.7/g) || []).length;
    console.log(`  Remaining temperature: 0.7 occurrences: ${temperatureCount}`);
    
    console.log('=' .repeat(50));
    console.log('🎉 o4-mini Temperature Fix Complete!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Error fixing o4-mini temperature:', error.message);
    process.exit(1);
  }
}

// Run the fix
if (import.meta.url === `file://${process.argv[1]}`) {
  fixO4MiniTemperature()
    .then(() => {
      console.log('\n🔧 o4-mini Temperature Fix Complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 o4-mini temperature fix failed:', error);
      process.exit(1);
    });
}

export { fixO4MiniTemperature }; 