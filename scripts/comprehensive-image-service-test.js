#!/usr/bin/env node

/**
 * Comprehensive Image Service Test
 * Tests image loading across all categories and verifies positive news service removal
 */

const BACKEND_URL = 'https://api.orbgame.us';

const categories = [
    'Technology', 'Science', 'Art', 'Nature', 
    'Sports', 'Music', 'Space', 'Innovation'
];

const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];

async function testImageService() {
    console.log('🔍 Comprehensive Image Service Test');
    console.log('=====================================\n');

    let totalTests = 0;
    let successfulTests = 0;
    let failedTests = 0;

    // Test 1: Verify positive news service is completely removed
    console.log('1️⃣ Testing Positive News Service Removal...');
    try {
        const response = await fetch(`${BACKEND_URL}/api/orb/positive-news/Technology?count=1&epoch=Modern&language=en&storyType=historical-figure`);
        if (response.status === 404) {
            console.log('✅ Positive news endpoint correctly returns 404');
            successfulTests++;
        } else {
            console.log(`❌ Positive news endpoint still active (status: ${response.status})`);
            failedTests++;
        }
        totalTests++;
    } catch (error) {
        console.log('✅ Positive news endpoint not accessible (expected)');
        successfulTests++;
        totalTests++;
    }

    // Test 2: Test image service across all categories
    console.log('\n2️⃣ Testing Image Service Across Categories...');
    for (const category of categories) {
        console.log(`\n📚 Testing ${category} category...`);
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/orb/stories-with-images?category=${category}&epoch=Modern&language=en&count=1`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.stories && data.stories.length > 0) {
                    const story = data.stories[0];
                    const imageStatus = story.imageStatus;
                    const figureName = story.figureName;
                    const hasImages = story.images && (story.images.portrait || story.images.gallery);
                    
                    console.log(`  ✅ ${category}: ${figureName} (${imageStatus})`);
                    
                    if (hasImages) {
                        console.log(`     📸 Images: ${story.images.portrait ? 'Portrait ✓' : 'Portrait ✗'} | ${story.images.gallery ? `Gallery (${story.images.gallery.length} images) ✓` : 'Gallery ✗'}`);
                        successfulTests++;
                    } else {
                        console.log(`     ❌ No images found`);
                        failedTests++;
                    }
                } else {
                    console.log(`  ❌ ${category}: No stories returned`);
                    failedTests++;
                }
            } else {
                console.log(`  ❌ ${category}: HTTP ${response.status}`);
                failedTests++;
            }
        } catch (error) {
            console.log(`  ❌ ${category}: ${error.message}`);
            failedTests++;
        }
        totalTests++;
    }

    // Test 3: Test image service across different epochs
    console.log('\n3️⃣ Testing Image Service Across Epochs...');
    for (const epoch of epochs) {
        console.log(`\n⏰ Testing ${epoch} epoch...`);
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/orb/stories-with-images?category=Technology&epoch=${epoch}&language=en&count=1`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.stories && data.stories.length > 0) {
                    const story = data.stories[0];
                    const imageStatus = story.imageStatus;
                    const figureName = story.figureName;
                    const hasImages = story.images && (story.images.portrait || story.images.gallery);
                    
                    console.log(`  ✅ ${epoch}: ${figureName} (${imageStatus})`);
                    
                    if (hasImages) {
                        console.log(`     📸 Images: ${story.images.portrait ? 'Portrait ✓' : 'Portrait ✗'} | ${story.images.gallery ? `Gallery (${story.images.gallery.length} images) ✓` : 'Gallery ✗'}`);
                        successfulTests++;
                    } else {
                        console.log(`     ❌ No images found`);
                        failedTests++;
                    }
                } else {
                    console.log(`  ❌ ${epoch}: No stories returned`);
                    failedTests++;
                }
            } else {
                console.log(`  ❌ ${epoch}: HTTP ${response.status}`);
                failedTests++;
            }
        } catch (error) {
            console.log(`  ❌ ${epoch}: ${error.message}`);
            failedTests++;
        }
        totalTests++;
    }

    // Test 4: Test image service with Spanish language
    console.log('\n4️⃣ Testing Image Service with Spanish Language...');
    try {
        const response = await fetch(`${BACKEND_URL}/api/orb/stories-with-images?category=Technology&epoch=Modern&language=es&count=1`);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.stories && data.stories.length > 0) {
                const story = data.stories[0];
                const imageStatus = story.imageStatus;
                const figureName = story.figureName;
                const hasImages = story.images && (story.images.portrait || story.images.gallery);
                
                console.log(`  ✅ Spanish: ${figureName} (${imageStatus})`);
                
                if (hasImages) {
                    console.log(`     📸 Images: ${story.images.portrait ? 'Portrait ✓' : 'Portrait ✗'} | ${story.images.gallery ? `Gallery (${story.images.gallery.length} images) ✓` : 'Gallery ✗'}`);
                    successfulTests++;
                } else {
                    console.log(`     ❌ No images found`);
                    failedTests++;
                }
            } else {
                console.log(`  ❌ Spanish: No stories returned`);
                failedTests++;
            }
        } else {
            console.log(`  ❌ Spanish: HTTP ${response.status}`);
            failedTests++;
        }
    } catch (error) {
        console.log(`  ❌ Spanish: ${error.message}`);
        failedTests++;
    }
    totalTests++;

    // Test 5: Test image stats endpoint
    console.log('\n5️⃣ Testing Image Stats Endpoint...');
    try {
        const response = await fetch(`${BACKEND_URL}/api/orb/images/stats`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`  ✅ Image stats: ${JSON.stringify(data, null, 2)}`);
            successfulTests++;
        } else {
            console.log(`  ❌ Image stats: HTTP ${response.status}`);
            failedTests++;
        }
    } catch (error) {
        console.log(`  ❌ Image stats: ${error.message}`);
        failedTests++;
    }
    totalTests++;

    // Summary
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests === 0) {
        console.log('\n🎉 All tests passed! Image service is working correctly.');
    } else {
        console.log(`\n⚠️  ${failedTests} tests failed. Please review the issues above.`);
    }
}

// Run the test
testImageService().catch(console.error); 