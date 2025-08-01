#!/usr/bin/env node

/**
 * Check Which Figures Have Real Images
 * Tests different categories and figures to see which have real images
 */

const BACKEND_URL = 'https://api.orbgame.us';

const testCases = [
    { category: 'Space', epoch: 'Modern', description: 'Space - Modern' },
    { category: 'Science', epoch: 'Modern', description: 'Science - Modern' },
    { category: 'Technology', epoch: 'Modern', description: 'Technology - Modern' },
    { category: 'Art', epoch: 'Modern', description: 'Art - Modern' },
    { category: 'Innovation', epoch: 'Modern', description: 'Innovation - Modern' },
    { category: 'Sports', epoch: 'Modern', description: 'Sports - Modern' },
    { category: 'Music', epoch: 'Modern', description: 'Music - Modern' },
    { category: 'Nature', epoch: 'Modern', description: 'Nature - Modern' },
    { category: 'Space', epoch: 'Ancient', description: 'Space - Ancient' },
    { category: 'Science', epoch: 'Ancient', description: 'Science - Ancient' },
    { category: 'Technology', epoch: 'Ancient', description: 'Technology - Ancient' },
    { category: 'Art', epoch: 'Ancient', description: 'Art - Ancient' }
];

async function checkFigureImages() {
    console.log('🔍 Checking Which Figures Have Real Images');
    console.log('==========================================\n');

    const results = {
        realImages: [],
        svgPlaceholders: [],
        errors: []
    };

    for (const testCase of testCases) {
        try {
            const url = `${BACKEND_URL}/api/orb/stories-with-images?category=${testCase.category}&epoch=${testCase.epoch}&language=en&count=1`;
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.stories && data.stories.length > 0) {
                    const story = data.stories[0];
                    const imageUrl = story.images?.portrait?.url;
                    const figureName = story.figureName;
                    
                    if (imageUrl) {
                        if (imageUrl.startsWith('data:image/svg+xml')) {
                            results.svgPlaceholders.push({
                                figure: figureName,
                                category: testCase.category,
                                epoch: testCase.epoch,
                                description: testCase.description
                            });
                        } else if (imageUrl.startsWith('http')) {
                            results.realImages.push({
                                figure: figureName,
                                category: testCase.category,
                                epoch: testCase.epoch,
                                description: testCase.description,
                                url: imageUrl.substring(0, 50) + '...'
                            });
                        }
                    }
                }
            }
        } catch (error) {
            results.errors.push({
                category: testCase.category,
                epoch: testCase.epoch,
                error: error.message
            });
        }
    }

    // Display results
    console.log('✅ Figures with REAL Images:');
    console.log('============================');
    results.realImages.forEach(item => {
        console.log(`📸 ${item.figure} (${item.description})`);
        console.log(`   URL: ${item.url}`);
    });

    console.log('\n🔄 Figures with SVG Placeholders:');
    console.log('==================================');
    results.svgPlaceholders.forEach(item => {
        console.log(`🎨 ${item.figure} (${item.description})`);
    });

    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        console.log('==========');
        results.errors.forEach(item => {
            console.log(`❌ ${item.category}/${item.epoch}: ${item.error}`);
        });
    }

    console.log('\n📊 Summary:');
    console.log('===========');
    console.log(`Real Images: ${results.realImages.length}`);
    console.log(`SVG Placeholders: ${results.svgPlaceholders.length}`);
    console.log(`Errors: ${results.errors.length}`);
    console.log(`Total Tested: ${testCases.length}`);

    // Test specific known figures
    console.log('\n🔍 Testing Known Figures:');
    console.log('========================');
    
    const knownFigures = [
        'Archimedes', 'Albert Einstein', 'Leonardo da Vinci', 
        'Marie Curie', 'Isaac Newton', 'Nikola Tesla'
    ];

    for (const figure of knownFigures) {
        try {
            const response = await fetch(`${BACKEND_URL}/api/orb/images/best?figureName=${figure}&category=Technology&epoch=Ancient`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.image) {
                    const urlType = data.image.url.startsWith('data:') ? 'SVG Placeholder' : 'Real Image';
                    console.log(`✅ ${figure}: ${urlType}`);
                } else {
                    console.log(`❌ ${figure}: No image found`);
                }
            }
        } catch (error) {
            console.log(`❌ ${figure}: Error - ${error.message}`);
        }
    }
}

checkFigureImages().catch(console.error); 