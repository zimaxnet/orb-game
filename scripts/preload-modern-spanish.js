import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io';

// Configuration for Spanish Modern epoch preloading
const EPOCH = 'Modern';
const LANGUAGE = 'es'; // Spanish
const CATEGORIES = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
const MODELS = [
  { id: 'grok-4', name: 'Grok 4' },
  { id: 'perplexity-sonar', name: 'Perplexity Sonar' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'o4-mini', name: 'O4-Mini' }
];

// Preloaded stories storage
const preloadedStories = {};

// Progress tracking
let totalRequests = 0;
let completedRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;

console.log('🇪🇸 Iniciando precarga de historias en español para la época Moderna');
console.log('=' .repeat(70));
console.log(`📅 Época: ${EPOCH}`);
console.log(`🌐 Idioma: Español (${LANGUAGE})`);
console.log(`📚 Categorías: ${CATEGORIES.length}`);
console.log(`🤖 Modelos: ${MODELS.length}`);
console.log(`📊 Total de solicitudes: ${CATEGORIES.length * MODELS.length}`);
console.log('=' .repeat(70));

// Helper function to preload a single category-model combination
async function preloadCategoryModel(category, model) {
  const startTime = Date.now();
  
  console.log(`🔄 Precargando ${category} con ${model.name}...`);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/${category}?epoch=${EPOCH}&model=${model.id}&count=3&language=${LANGUAGE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: category,
        epoch: EPOCH,
        model: model.id,
        count: 3,
        language: LANGUAGE,
        prompt: `Genera 3 historias fascinantes y positivas sobre ${category} de los tiempos ${EPOCH.toLowerCase()}. Cada historia debe ser atractiva, informativa y destacar logros o descubrimientos notables.`
      })
    });

    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const stories = await response.json();
    
    // Validate response
    if (!Array.isArray(stories) || stories.length === 0) {
      throw new Error('No se generaron historias');
    }
    
    // Store preloaded stories
    if (!preloadedStories[category]) {
      preloadedStories[category] = {};
    }
    preloadedStories[category][model.id] = stories;
    
    // Update progress
    completedRequests++;
    successfulRequests++;
    
    console.log(`✅ ${category} con ${model.name}: ${stories.length} historias, ${responseTime}ms`);
    
    // Log first story headline for verification
    if (stories[0] && stories[0].headline) {
      console.log(`   📰 Título: "${stories[0].headline}"`);
    }
    
    return {
      success: true,
      stories: stories.length,
      responseTime,
      hasTTS: stories.every(s => s.ttsAudio)
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    completedRequests++;
    failedRequests++;
    
    console.log(`❌ ${category} con ${model.name}: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      responseTime
    };
  }
}

// Main preloading function
async function preloadModernSpanish() {
  const startTime = Date.now();
  
  console.log('🚀 Iniciando precarga de todas las categorías en español...\n');
  
  // Preload all combinations
  for (const category of CATEGORIES) {
    console.log(`📚 Procesando categoría: ${category}`);
    
    for (const model of MODELS) {
      totalRequests++;
      await preloadCategoryModel(category, model);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`✅ Categoría ${category} completada\n`);
  }
  
  const totalTime = Date.now() - startTime;
  
  // Print results
  console.log('=' .repeat(70));
  console.log('📊 RESUMEN DE PRECARGA EN ESPAÑOL');
  console.log('=' .repeat(70));
  console.log(`⏱️  Tiempo total: ${totalTime}ms`);
  console.log(`✅ Exitosas: ${successfulRequests}`);
  console.log(`❌ Fallidas: ${failedRequests}`);
  console.log(`📈 Tasa de éxito: ${Math.round((successfulRequests / totalRequests) * 100)}%`);
  
  console.log('\n🤖 RENDIMIENTO POR MODELO:');
  MODELS.forEach(model => {
    const modelStories = Object.values(preloadedStories).filter(cat => cat[model.id]);
    const successCount = modelStories.length;
    const successRate = Math.round((successCount / CATEGORIES.length) * 100);
    
    console.log(`\n${model.name}:`);
    console.log(`  ✅ Tasa de éxito: ${successRate}%`);
    console.log(`  📊 Categorías: ${successCount}/${CATEGORIES.length}`);
    
    if (successCount > 0) {
      const avgResponseTime = Math.round(
        modelStories.reduce((sum, stories) => sum + (stories.length * 100), 0) / successCount
      );
      console.log(`  ⏱️  Tiempo promedio: ~${avgResponseTime}ms`);
    }
  });
  
  console.log('\n📚 HISTORIAS PRECARGADAS POR CATEGORÍA:');
  CATEGORIES.forEach(category => {
    const categoryStories = preloadedStories[category];
    if (categoryStories) {
      const modelCount = Object.keys(categoryStories).length;
      console.log(`\n${category}:`);
      console.log(`  📊 Modelos disponibles: ${modelCount}/${MODELS.length}`);
      
      MODELS.forEach(model => {
        if (categoryStories[model.id]) {
          const stories = categoryStories[model.id];
          console.log(`    ✅ ${model.name}: ${stories.length} historias`);
          
          // Show first story headline
          if (stories[0] && stories[0].headline) {
            console.log(`       📰 "${stories[0].headline}"`);
          }
        } else {
          console.log(`    ❌ ${model.name}: No disponible`);
        }
      });
    } else {
      console.log(`\n${category}: ❌ No hay historias precargadas`);
    }
  });
  
  console.log('\n' + '=' .repeat(70));
  
  // Return preloaded stories
  return {
    success: failedRequests === 0,
    preloadedStories,
    summary: {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: Math.round((successfulRequests / totalRequests) * 100),
      totalTime
    }
  };
}

// Run the preloading
if (import.meta.url === `file://${process.argv[1]}`) {
  preloadModernSpanish()
    .then(results => {
      console.log(`\n🎯 Precarga ${results.success ? 'COMPLETADA' : 'FALLIDA'}`);
      
      if (results.success) {
        console.log('✅ Todas las categorías precargadas exitosamente en español');
        console.log('🚀 El sistema está listo para usar las historias precargadas');
      } else {
        console.log('❌ Algunas categorías fallaron al precargar');
      }
      
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Error durante la precarga:', error);
      process.exit(1);
    });
}

export { preloadModernSpanish }; 