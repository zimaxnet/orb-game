import fs from 'fs';

async function inventoryAllImages() {
  console.log('🔍 Inventorying all available image data...\n');
  
  try {
    // Read the grouped images data
    const groupedData = JSON.parse(fs.readFileSync('grouped_images_for_mongodb.json', 'utf8'));
    
    console.log('📊 IMAGE INVENTORY SUMMARY');
    console.log('==========================');
    
    // Basic statistics
    const totalFigures = groupedData.length;
    const figuresWithImages = groupedData.filter(figure => figure.total_images > 0).length;
    const figuresWithoutImages = totalFigures - figuresWithImages;
    const totalImages = groupedData.reduce((sum, figure) => sum + figure.total_images, 0);
    
    console.log(`📈 Total Figures: ${totalFigures}`);
    console.log(`✅ Figures with Images: ${figuresWithImages}`);
    console.log(`❌ Figures without Images: ${figuresWithoutImages}`);
    console.log(`🖼️  Total Images: ${totalImages}`);
    console.log(`📊 Average Images per Figure: ${(totalImages / totalFigures).toFixed(2)}`);
    
    // Category breakdown
    const categoryStats = {};
    groupedData.forEach(figure => {
      const category = figure.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, images: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].images += figure.total_images;
    });
    
    console.log('\n📂 IMAGES BY CATEGORY');
    console.log('=====================');
    Object.entries(categoryStats).forEach(([category, stats]) => {
      console.log(`${category.padEnd(12)}: ${stats.count} figures, ${stats.images} images`);
    });
    
    // Epoch breakdown
    const epochStats = {};
    groupedData.forEach(figure => {
      const epoch = figure.epoch;
      if (!epochStats[epoch]) {
        epochStats[epoch] = { count: 0, images: 0 };
      }
      epochStats[epoch].count++;
      epochStats[epoch].images += figure.total_images;
    });
    
    console.log('\n⏰ IMAGES BY EPOCH');
    console.log('==================');
    Object.entries(epochStats).forEach(([epoch, stats]) => {
      console.log(`${epoch.padEnd(12)}: ${stats.count} figures, ${stats.images} images`);
    });
    
    // Image source breakdown
    const sourceStats = {};
    groupedData.forEach(figure => {
      figure.images.forEach(image => {
        const source = image.source || 'Unknown';
        sourceStats[source] = (sourceStats[source] || 0) + 1;
      });
    });
    
    console.log('\n🌐 IMAGES BY SOURCE');
    console.log('===================');
    Object.entries(sourceStats).forEach(([source, count]) => {
      console.log(`${source.padEnd(12)}: ${count} images`);
    });
    
    // Image type breakdown
    const typeStats = {};
    groupedData.forEach(figure => {
      figure.images.forEach(image => {
        const type = image.type || 'Unknown';
        typeStats[type] = (typeStats[type] || 0) + 1;
      });
    });
    
    console.log('\n🎨 IMAGES BY TYPE');
    console.log('=================');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`${type.padEnd(12)}: ${count} images`);
    });
    
    // Figures with multiple images
    const multiImageFigures = groupedData.filter(figure => figure.total_images > 1);
    if (multiImageFigures.length > 0) {
      console.log('\n🖼️  FIGURES WITH MULTIPLE IMAGES');
      console.log('================================');
      multiImageFigures.forEach(figure => {
        console.log(`${figure.figure_name.padEnd(20)}: ${figure.total_images} images`);
      });
    }
    
    // Sample of image URLs
    console.log('\n🔗 SAMPLE IMAGE URLS');
    console.log('===================');
    const sampleImages = groupedData.slice(0, 5).map(figure => ({
      name: figure.figure_name,
      url: figure.images[0]?.url || 'No URL'
    }));
    
    sampleImages.forEach(image => {
      console.log(`${image.name.padEnd(20)}: ${image.url}`);
    });
    
    // Check for missing images
    const figuresWithoutImagesList = groupedData.filter(figure => figure.total_images === 0);
    if (figuresWithoutImagesList.length > 0) {
      console.log('\n❌ FIGURES WITHOUT IMAGES');
      console.log('=========================');
      figuresWithoutImagesList.forEach(figure => {
        console.log(`${figure.figure_name} (${figure.category}, ${figure.epoch})`);
      });
    }
    
    console.log('\n✅ Inventory complete!');
    
  } catch (error) {
    console.error('❌ Error reading image data:', error.message);
  }
}

inventoryAllImages(); 