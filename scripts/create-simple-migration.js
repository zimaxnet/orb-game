import fs from 'fs';
import path from 'path';

async function createSimpleMigration() {
  try {
    console.log('🔄 Creating simple migration file...');
    
    // Read the grouped images data
    const groupedData = JSON.parse(fs.readFileSync('grouped_images_for_mongodb.json', 'utf8'));
    
    // Create simple migration structure
    const migrationData = {};
    
    // Process each figure
    for (const figure of groupedData) {
      const { figure_name, category, epoch, images } = figure;
      
      if (!migrationData[figure_name]) {
        migrationData[figure_name] = {
          category: category,
          epoch: epoch,
          images: [],
          gallery: []
        };
      }
      
      // Add image data
      if (images && images.length > 0) {
        for (const image of images) {
          migrationData[figure_name].images.push({
            url: image.url,
            source: image.source,
            reliability: image.reliability,
            priority: image.priority
          });
          migrationData[figure_name].gallery.push(image.url);
        }
      }
    }
    
    // Write the migration file
    fs.writeFileSync('mongodb_images_migration_simple.json', JSON.stringify(migrationData, null, 2));
    
    console.log('✅ Simple migration file created successfully!');
    console.log(`📊 Total figures: ${Object.keys(migrationData).length}`);
    
    // Count total images
    let totalImages = 0;
    for (const figure in migrationData) {
      totalImages += migrationData[figure].images.length;
    }
    console.log(`🖼️ Total images: ${totalImages}`);
    
  } catch (error) {
    console.error('❌ Error creating migration file:', error);
  }
}

createSimpleMigration(); 