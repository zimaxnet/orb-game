/**
 * Advanced Model-Specific Prompt Management System
 * 
 * This system leverages each AI model's unique strengths to create
 * engaging, category-specific content that makes the Orb Game compelling.
 * Each prompt is precisely tailored for maximum engagement and fun.
 */

// Import the advanced prompt reference data
import { PROMPT_REFERENCE_DATA } from './promptReferenceData.js';

class PromptManager {
  constructor() {
    this.cache = new Map();
    this.initializePrompts();
  }

  /**
   * Initialize all prompts from the reference data
   */
  initializePrompts() {
    console.log('🎯 Initializing Advanced Model-Specific Prompt Manager...');
    
    // Cache all model-specific prompts for quick access
    Object.keys(PROMPT_REFERENCE_DATA.frontendPrompts).forEach(category => {
      Object.keys(PROMPT_REFERENCE_DATA.frontendPrompts[category]).forEach(epoch => {
        Object.keys(PROMPT_REFERENCE_DATA.frontendPrompts[category][epoch]).forEach(model => {
          Object.keys(PROMPT_REFERENCE_DATA.frontendPrompts[category][epoch][model]).forEach(language => {
            const key = `${category}-${epoch}-${model}-${language}`;
            this.cache.set(key, PROMPT_REFERENCE_DATA.frontendPrompts[category][epoch][model][language]);
          });
        });
      });
    });

    console.log(`✅ Cached ${this.cache.size} model-specific prompts`);
  }

  /**
   * Get a model-specific prompt for a category, epoch, model, and language
   */
  getFrontendPrompt(category, epoch, language = 'en', model = 'o4-mini') {
    const key = `${category}-${epoch}-${model}-${language}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Fallback to dynamic generation if not in cache
    return this.generateDynamicPrompt(category, epoch, language, model);
  }

  /**
   * Get a backend prompt template for a specific AI model
   */
  getBackendPromptTemplate(model, language = 'en') {
    const templates = PROMPT_REFERENCE_DATA.backendPrompts[model] || {};
    return templates[language] || templates['en'] || PROMPT_REFERENCE_DATA.backendPrompts['o4-mini'][language];
  }

  /**
   * Get system prompt for chat endpoint
   */
  getSystemPrompt(language = 'en') {
    return PROMPT_REFERENCE_DATA.systemPrompts[language] || PROMPT_REFERENCE_DATA.systemPrompts.en;
  }

  /**
   * Get web search prompt
   */
  getWebSearchPrompt(message, language = 'en') {
    const basePrompt = PROMPT_REFERENCE_DATA.webSearchPrompts[language] || PROMPT_REFERENCE_DATA.webSearchPrompts.en;
    return basePrompt.replace('{message}', message);
  }

  /**
   * Get fallback story content
   */
  getFallbackStory(category, language = 'en') {
    const fallbacks = PROMPT_REFERENCE_DATA.fallbackStories[language] || PROMPT_REFERENCE_DATA.fallbackStories.en;
    return {
      headline: fallbacks.headline.replace('{category}', category),
      summary: fallbacks.summary.replace('{category}', category.toLowerCase()),
      fullText: fallbacks.fullText.replace('{category}', category.toLowerCase()),
      source: fallbacks.source
    };
  }

  /**
   * Get TTS voice configuration
   */
  getTTSVoice(language = 'en') {
    return PROMPT_REFERENCE_DATA.ttsVoices[language] || PROMPT_REFERENCE_DATA.ttsVoices.en;
  }

  /**
   * Get JSON response format for specific model
   */
  getJSONResponseFormat(model) {
    return PROMPT_REFERENCE_DATA.jsonResponseFormat[model] || PROMPT_REFERENCE_DATA.jsonResponseFormat['o4-mini'];
  }

  /**
   * Generate a dynamic prompt if not found in cache
   */
  generateDynamicPrompt(category, epoch, language = 'en', model = 'o4-mini') {
    const languageInstruction = language === 'es' ? ' Generate all content in Spanish.' : '';
    const categoryLower = category.toLowerCase();
    const epochLower = epoch.toLowerCase();
    
    // Model-specific fallback approaches
    const modelApproaches = {
      'o4-mini': `Systematically analyze ${epochLower} ${categoryLower} innovations using logical reasoning. Present structured conclusions.`,
      'grok-4': `Create witty, engaging content about ${epochLower} ${categoryLower} with characteristic humor and fresh perspective.`,
      'perplexity-sonar': `Research and synthesize real data about ${epochLower} ${categoryLower}. Present authoritative information.`,
      'gemini-1.5-flash': `Weave rich, multi-perspective narrative about ${epochLower} ${categoryLower}. Blend multiple viewpoints.`
    };
    
    const approach = modelApproaches[model] || modelApproaches['o4-mini'];
    return `${approach} End statements definitively without questions.${languageInstruction}`;
  }

  /**
   * Get all prompts for a specific category and model
   */
  getCategoryPrompts(category, language = 'en', model = 'o4-mini') {
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future', 'Enlightenment', 'Digital'];
    const prompts = {};
    
    epochs.forEach(epoch => {
      prompts[epoch] = this.getFrontendPrompt(category, epoch, language, model);
    });
    
    return prompts;
  }

  /**
   * Get all prompts for a specific epoch and model
   */
  getEpochPrompts(epoch, language = 'en', model = 'o4-mini') {
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation', 'Spirituality'];
    const prompts = {};
    
    categories.forEach(category => {
      prompts[category] = this.getFrontendPrompt(category, epoch, language, model);
    });
    
    return prompts;
  }

  /**
   * Get all prompts for a specific language and model
   */
  getLanguagePrompts(language = 'en', model = 'o4-mini') {
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation', 'Spirituality'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future', 'Enlightenment', 'Digital'];
    const prompts = {};
    
    categories.forEach(category => {
      prompts[category] = {};
      epochs.forEach(epoch => {
        prompts[category][epoch] = this.getFrontendPrompt(category, epoch, language, model);
      });
    });
    
    return prompts;
  }

  /**
   * Get all available models
   */
  getAvailableModels() {
    return ['o4-mini', 'grok-4', 'perplexity-sonar', 'gemini-1.5-flash'];
  }

  /**
   * Get model-specific characteristics for UI display
   */
  getModelCharacteristics() {
    return {
      'o4-mini': {
        name: 'o4-mini Analysis',
        description: 'Systematic, logical, structured analysis',
        style: 'Analytical and methodical',
        icon: '🔬'
      },
      'grok-4': {
        name: 'Grok Perspective',
        description: 'Witty, creative, unconventional insights',
        style: 'Humorous and engaging',
        icon: '🎭'
      },
      'perplexity-sonar': {
        name: 'Perplexity Research',
        description: 'Data-driven, authoritative, research-based',
        style: 'Comprehensive and factual',
        icon: '📊'
      },
      'gemini-1.5-flash': {
        name: 'Gemini Synthesis',
        description: 'Multi-perspective, immersive narratives',
        style: 'Rich and multi-layered',
        icon: '🌟'
      }
    };
  }

  /**
   * Get prompt statistics
   */
  getPromptStats() {
    return {
      totalCached: this.cache.size,
      categories: 9,
      epochs: 7,
      languages: 2,
      models: 4,
      totalCombinations: 9 * 7 * 2 * 4
    };
  }

  /**
   * Validate that all prompts exist for all models
   */
  validatePrompts() {
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation', 'Spirituality'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future', 'Enlightenment', 'Digital'];
    const languages = ['en', 'es'];
    const models = ['o4-mini', 'grok-4', 'perplexity-sonar', 'gemini-1.5-flash'];
    const missing = [];

    categories.forEach(category => {
      epochs.forEach(epoch => {
        languages.forEach(language => {
          models.forEach(model => {
            const prompt = this.getFrontendPrompt(category, epoch, language, model);
            if (!prompt || prompt.includes('undefined')) {
              missing.push(`${category}-${epoch}-${language}-${model}`);
            }
          });
        });
      });
    });

    return {
      valid: missing.length === 0,
      missing: missing,
      total: categories.length * epochs.length * languages.length * models.length
    };
  }

  /**
   * Update a prompt in the cache
   */
  updatePrompt(category, epoch, language, model, newPrompt) {
    const key = `${category}-${epoch}-${model}-${language}`;
    this.cache.set(key, newPrompt);
    console.log(`🔄 Updated prompt: ${key}`);
  }

  /**
   * Export all prompts for backup
   */
  exportPrompts() {
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: this.getPromptStats(),
      modelCharacteristics: this.getModelCharacteristics(),
      prompts: {}
    };

    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation', 'Spirituality'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future', 'Enlightenment', 'Digital'];
    const languages = ['en', 'es'];
    const models = ['o4-mini', 'grok-4', 'perplexity-sonar', 'gemini-1.5-flash'];

    categories.forEach(category => {
      exportData.prompts[category] = {};
      epochs.forEach(epoch => {
        exportData.prompts[category][epoch] = {};
        languages.forEach(language => {
          exportData.prompts[category][epoch][language] = {};
          models.forEach(model => {
            exportData.prompts[category][epoch][language][model] = this.getFrontendPrompt(category, epoch, language, model);
          });
        });
      });
    });

    return exportData;
  }

  /**
   * Get random prompt for testing/demo purposes
   */
  getRandomPrompt() {
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation', 'Spirituality'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future', 'Enlightenment', 'Digital'];
    const languages = ['en', 'es'];
    const models = ['o4-mini', 'grok-4', 'perplexity-sonar', 'gemini-1.5-flash'];

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomEpoch = epochs[Math.floor(Math.random() * epochs.length)];
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
    const randomModel = models[Math.floor(Math.random() * models.length)];

    return {
      category: randomCategory,
      epoch: randomEpoch,
      language: randomLanguage,
      model: randomModel,
      prompt: this.getFrontendPrompt(randomCategory, randomEpoch, randomLanguage, randomModel),
      characteristics: this.getModelCharacteristics()[randomModel]
    };
  }
}

// Create singleton instance
const promptManager = new PromptManager();

export default promptManager; 