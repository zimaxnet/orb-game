#!/usr/bin/env node

import BlobStorageImageService from '../backend/historical-figures-image-service-blob-real.js';

async function testImageService() {
    console.log('🧪 Testing Image Service...');
    
    try {
        // Initialize the image service
        const imageService = new BlobStorageImageService();
        console.log('✅ Image service created');
        
        // Test with a known figure
        const testStory = {
            headline: "Charles Darwin: The Father of Evolution",
            summary: "Charles Darwin's groundbreaking work on natural selection revolutionized biology.",
            fullText: "Charles Darwin, a Cambridge graduate, studied Galápagos finches aboard the Beagle and birthed natural selection in 1859's Origin of Species, forever reshaping biology."
        };
        
        console.log('🔍 Testing getImagesForStory with Charles Darwin...');
        const images = await imageService.getImagesForStory(testStory, 'Science', 'Industrial');
        
        if (images) {
            console.log('✅ Images found:', images.length);
            images.forEach((img, index) => {
                console.log(`  ${index + 1}. ${img.type}: ${img.url}`);
            });
        } else {
            console.log('❌ No images found');
        }
        
        // Test with another figure
        const testStory2 = {
            headline: "Dmitri Mendeleev: The Architect of the Periodic Table",
            summary: "Dmitri Mendeleev organized the elements into a predictive periodic table.",
            fullText: "Dmitri Mendeleev overcame early financial hardship and loss of eyesight to publish the first modern periodic table in 1869."
        };
        
        console.log('🔍 Testing getImagesForStory with Dmitri Mendeleev...');
        const images2 = await imageService.getImagesForStory(testStory2, 'Science', 'Industrial');
        
        if (images2) {
            console.log('✅ Images found:', images2.length);
            images2.forEach((img, index) => {
                console.log(`  ${index + 1}. ${img.type}: ${img.url}`);
            });
        } else {
            console.log('❌ No images found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testImageService().catch(console.error); 