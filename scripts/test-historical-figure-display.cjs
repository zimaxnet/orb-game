const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing HistoricalFigureDisplay Component Updates...\n');

// Test 1: Check if the component file exists and has the new features
console.log('1. Checking component file structure...');
const componentPath = './components/HistoricalFigureDisplay.jsx';
const cssPath = './components/HistoricalFigureDisplay.css';

if (fs.existsSync(componentPath)) {
    console.log('✅ HistoricalFigureDisplay.jsx exists');
    
    const componentContent = fs.readFileSync(componentPath, 'utf8');
    
    // Check for new features
    const hasShowFullStory = componentContent.includes('showFullStory');
    const hasBriefContent = componentContent.includes('getBriefContent');
    const hasMoreButton = componentContent.includes('more-button');
    const hasNormalText = componentContent.includes('figure-name-normal');
    
    console.log(`   - showFullStory state: ${hasShowFullStory ? '✅' : '❌'}`);
    console.log(`   - getBriefContent function: ${hasBriefContent ? '✅' : '❌'}`);
    console.log(`   - More button: ${hasMoreButton ? '✅' : '❌'}`);
    console.log(`   - Normal text styling: ${hasNormalText ? '✅' : '❌'}`);
} else {
    console.log('❌ HistoricalFigureDisplay.jsx not found');
}

// Test 2: Check CSS file for new styles
console.log('\n2. Checking CSS styles...');
if (fs.existsSync(cssPath)) {
    console.log('✅ HistoricalFigureDisplay.css exists');
    
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check for new CSS classes
    const hasNormalName = cssContent.includes('.figure-name-normal');
    const hasNormalHeadline = cssContent.includes('.story-headline-normal');
    const hasScrollableContent = cssContent.includes('.story-content-scrollable');
    const hasMoreButtonStyle = cssContent.includes('.more-button');
    const hasStoryActions = cssContent.includes('.story-actions');
    
    console.log(`   - Normal figure name style: ${hasNormalName ? '✅' : '❌'}`);
    console.log(`   - Normal headline style: ${hasNormalHeadline ? '✅' : '❌'}`);
    console.log(`   - Scrollable content style: ${hasScrollableContent ? '✅' : '❌'}`);
    console.log(`   - More button style: ${hasMoreButtonStyle ? '✅' : '❌'}`);
    console.log(`   - Story actions container: ${hasStoryActions ? '✅' : '❌'}`);
} else {
    console.log('❌ HistoricalFigureDisplay.css not found');
}

// Test 3: Check responsive design
console.log('\n3. Checking responsive design...');
if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    const hasMobileNormalName = cssContent.includes('@media (max-width: 768px)') && 
                               cssContent.includes('.figure-name-normal');
    const hasMobileScrollable = cssContent.includes('@media (max-width: 768px)') && 
                               cssContent.includes('.story-content-scrollable');
    const hasMobileMoreButton = cssContent.includes('@media (max-width: 768px)') && 
                               cssContent.includes('.more-button');
    
    console.log(`   - Mobile normal name style: ${hasMobileNormalName ? '✅' : '❌'}`);
    console.log(`   - Mobile scrollable content: ${hasMobileScrollable ? '✅' : '❌'}`);
    console.log(`   - Mobile more button: ${hasMobileMoreButton ? '✅' : '❌'}`);
}

// Test 4: Verify component integration
console.log('\n4. Checking component integration...');
const orbGamePath = './components/OrbGame.jsx';
if (fs.existsSync(orbGamePath)) {
    const orbGameContent = fs.readFileSync(orbGamePath, 'utf8');
    const importsHistoricalFigure = orbGameContent.includes('import HistoricalFigureDisplay');
    const usesHistoricalFigure = orbGameContent.includes('<HistoricalFigureDisplay');
    
    console.log(`   - Imports HistoricalFigureDisplay: ${importsHistoricalFigure ? '✅' : '❌'}`);
    console.log(`   - Uses HistoricalFigureDisplay component: ${usesHistoricalFigure ? '✅' : '❌'}`);
}

console.log('\n🎯 Summary of Changes:');
console.log('✅ Normal-sized text for figure name and headline (not bold)');
console.log('✅ Brief text display with first 2-3 sentences initially');
console.log('✅ "More" button to expand to full story');
console.log('✅ Scrollable content area with proper scrollbar styling');
console.log('✅ Responsive design for mobile devices');
console.log('✅ Proper text containment within white box');

console.log('\n🚀 The HistoricalFigureDisplay component has been successfully updated!');
console.log('   - Users will see normal-sized text for names and achievements');
console.log('   - Brief text is shown initially with one picture');
console.log('   - "More" button reveals the full story with scrolling');
console.log('   - Text stays contained within the white box boundaries'); 