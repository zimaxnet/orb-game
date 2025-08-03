import fs from 'fs';
import path from 'path';

async function testHistoricalFigures() {
  try {
    console.log('Testing historical figures loading...');
    
    // Test different file paths
    const paths = [
      'OrbGameInfluentialPeopleSeeds',
      './OrbGameInfluentialPeopleSeeds',
      path.join(process.cwd(), 'OrbGameInfluentialPeopleSeeds'),
      path.join(process.cwd(), '..', 'OrbGameInfluentialPeopleSeeds')
    ];
    
    for (const filePath of paths) {
      console.log(`\nTrying path: ${filePath}`);
      try {
        if (fs.existsSync(filePath)) {
          console.log(`✅ File exists at: ${filePath}`);
          const data = fs.readFileSync(filePath, 'utf8');
          const seedData = JSON.parse(data);
          
          if (seedData.Technology && seedData.Technology.Modern) {
            console.log(`✅ Found Technology/Modern data:`, seedData.Technology.Modern);
            return true;
          } else {
            console.log(`❌ No Technology/Modern data found`);
          }
        } else {
          console.log(`❌ File does not exist at: ${filePath}`);
        }
      } catch (error) {
        console.log(`❌ Error reading ${filePath}:`, error.message);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

testHistoricalFigures().then(success => {
  console.log(`\nTest result: ${success ? 'SUCCESS' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
}); 