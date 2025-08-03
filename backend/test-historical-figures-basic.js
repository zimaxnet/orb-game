import { HistoricalFiguresService } from './historical-figures-service.js';

async function testHistoricalFiguresServiceBasic() {
  console.log('🧪 Testing Historical Figures Service (Basic Structure)...');
  
  try {
    // Test service instantiation
    console.log('🔧 Testing service instantiation...');
    const service = new HistoricalFiguresService('mongodb://test-uri');
    console.log('✅ Service instantiated successfully');
    
    // Test available categories
    console.log('\n📋 Testing available categories...');
    const categories = await service.getAvailableCategories();
    console.log('✅ Available categories:', categories);
    
    // Test available epochs
    console.log('\n⏰ Testing available epochs...');
    const epochs = await service.getAvailableEpochs();
    console.log('✅ Available epochs:', epochs);
    
    // Test available languages
    console.log('\n🌍 Testing available languages...');
    const languages = await service.getAvailableLanguages();
    console.log('✅ Available languages:', languages);
    
    // Test seed data loading (without database connection)
    console.log('\n📚 Testing seed data loading...');
    await service.loadSeedData();
    console.log('✅ Seed data loaded successfully');
    
    // Test getting historical figures list
    console.log('\n👥 Testing historical figures list...');
    const figures = await service.getHistoricalFiguresList('Technology', 'Modern');
    console.log('✅ Historical figures for Technology-Modern:', figures);
    
    console.log('\n🎉 Basic structure tests completed successfully!');
    console.log('📝 Note: Full functionality requires Key Vault access and MongoDB connection');
    return true;
    
  } catch (error) {
    console.error('❌ Basic test failed:', error.message);
    return false;
  }
}

// Run the basic test
testHistoricalFiguresServiceBasic().then(success => {
  console.log(`\nTest result: ${success ? 'SUCCESS' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
}); 