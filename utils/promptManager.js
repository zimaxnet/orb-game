/**
 * Centralized Prompt Management System
 * 
 * This system uses the PROMPTS_REFERENCE.md as the single source of truth
 * for all prompts in the Orb Game. All prompt generation goes through this manager.
 */

// Import the prompt reference data
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
    console.log('🎯 Initializing Prompt Manager with reference data...');
    
    // Cache all frontend prompts for quick access
    Object.keys(PROMPT_REFERENCE_DATA.frontendPrompts).forEach(category => {
      Object.keys(PROMPT_REFERENCE_DATA.frontendPrompts[category]).forEach(epoch => {
        Object.keys(PROMPT_REFERENCE_DATA.frontendPrompts[category][epoch]).forEach(language => {
          const key = `${category}-${epoch}-${language}`;
          this.cache.set(key, PROMPT_REFERENCE_DATA.frontendPrompts[category][epoch][language]);
        });
      });
    });

    console.log(`✅ Cached ${this.cache.size} prompts`);
  }

  /**
   * Get a frontend prompt for a specific category, epoch, and language
   */
  getFrontendPrompt(category, epoch, language = 'en') {
    const key = `${category}-${epoch}-${language}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Fallback to dynamic generation if not in cache
    return this.generateDynamicPrompt(category, epoch, language);
  }

  /**
   * Get a backend prompt template for a specific AI model
   */
  getBackendPromptTemplate(model, language = 'en') {
    const templates = PROMPT_REFERENCE_DATA.backendPrompts[model] || {};
    return templates[language] || templates['en'] || PROMPT_REFERENCE_DATA.backendPrompts.default;
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
   * Generate a dynamic prompt if not found in cache
   */
  generateDynamicPrompt(category, epoch, language = 'en') {
    const languageInstruction = language === 'es' ? ' Generate all content in Spanish.' : '';
    const categoryLower = category.toLowerCase();
    const epochLower = epoch.toLowerCase();
    
    return `Generate an exciting positive news story about ${epochLower} ${categoryLower} innovations, discoveries, or achievements. Make it engaging and inspiring.${languageInstruction}`;
  }

  /**
   * Get all prompts for a specific category
   */
  getCategoryPrompts(category, language = 'en') {
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future', 'Enlightenment Era', 'Digital Era'];
    const prompts = {};
    
    epochs.forEach(epoch => {
      prompts[epoch] = this.getFrontendPrompt(category, epoch, language);
    });
    
    return prompts;
  }

  /**
   * Get all prompts for a specific epoch
   */
  getEpochPrompts(epoch, language = 'en') {
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation', 'Spirituality', 'Positive Comments'];
    const prompts = {};
    
    categories.forEach(category => {
      prompts[category] = this.getFrontendPrompt(category, epoch, language);
    });
    
    return prompts;
  }

  /**
   * Get all prompts for a specific language
   */
  getLanguagePrompts(language = 'en') {
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation', 'Spirituality', 'Positive Comments'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future', 'Enlightenment Era', 'Digital Era'];
    const prompts = {};
    
    categories.forEach(category => {
      prompts[category] = {};
      epochs.forEach(epoch => {
        prompts[category][epoch] = this.getFrontendPrompt(category, epoch, language);
      });
    });
    
    return prompts;
  }

  /**
   * Get prompt statistics
   */
  getPromptStats() {
    return {
      totalCached: this.cache.size,
      categories: 10,
      epochs: 7,
      languages: 2,
      models: 4,
      totalCombinations: 10 * 7 * 2 * 4
    };
  }

  /**
   * Validate that all prompts exist
   */
  validatePrompts() {
    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation', 'Spirituality', 'Positive Comments'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future', 'Enlightenment Era', 'Digital Era'];
    const languages = ['en', 'es'];
    const missing = [];

    categories.forEach(category => {
      epochs.forEach(epoch => {
        languages.forEach(language => {
          const prompt = this.getFrontendPrompt(category, epoch, language);
          if (!prompt || prompt.includes('undefined')) {
            missing.push(`${category}-${epoch}-${language}`);
          }
        });
      });
    });

    return {
      valid: missing.length === 0,
      missing: missing,
      total: categories.length * epochs.length * languages.length
    };
  }

  /**
   * Update a prompt in the cache
   */
  updatePrompt(category, epoch, language, newPrompt) {
    const key = `${category}-${epoch}-${language}`;
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
      prompts: {}
    };

    const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
    const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
    const languages = ['en', 'es'];

    categories.forEach(category => {
      exportData.prompts[category] = {};
      epochs.forEach(epoch => {
        exportData.prompts[category][epoch] = {};
        languages.forEach(language => {
          exportData.prompts[category][epoch][language] = this.getFrontendPrompt(category, epoch, language);
        });
      });
    });

    return exportData;
  }
}

// Create singleton instance
const promptManager = new PromptManager();

export default promptManager; 