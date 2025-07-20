import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { StoryCacheService } from './story-cache-service.js';

export class ModelReliabilityChecker {
  constructor(secrets) {
    this.secrets = secrets;
    this.storyCacheService = new StoryCacheService();
    this.reliableModels = [];
    this.cachedModernStory = null;
  }

  /**
   * Check reliability of all available models
   */
  async checkModelReliability() {
    console.log('🔍 Checking model reliability...');
    
    const models = [
      { id: 'azure-openai', name: 'Azure OpenAI (o4-mini)', testFunction: this.testAzureOpenAI.bind(this) },
      { id: 'grok-4', name: 'Grok 4', testFunction: this.testGrok4.bind(this) },
      { id: 'perplexity-sonar', name: 'Perplexity Sonar', testFunction: this.testPerplexitySonar.bind(this) },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', testFunction: this.testGeminiFlash.bind(this) }
    ];

    const reliabilityResults = [];

    for (const model of models) {
      try {
        console.log(`🧪 Testing ${model.name}...`);
        const isReliable = await model.testFunction();
        
        if (isReliable) {
          this.reliableModels.push(model.id);
          console.log(`✅ ${model.name} is reliable`);
        } else {
          console.log(`❌ ${model.name} is not reliable`);
        }
        
        reliabilityResults.push({
          model: model.id,
          name: model.name,
          reliable: isReliable
        });
      } catch (error) {
        console.error(`❌ Error testing ${model.name}:`, error.message);
        reliabilityResults.push({
          model: model.id,
          name: model.name,
          reliable: false,
          error: error.message
        });
      }
    }

    console.log(`📊 Model reliability results:`, reliabilityResults);
    console.log(`✅ Reliable models:`, this.reliableModels);

    return {
      reliableModels: this.reliableModels,
      results: reliabilityResults
    };
  }

  /**
   * Test Azure OpenAI model
   */
  async testAzureOpenAI() {
    try {
      if (!this.secrets.AZURE_OPENAI_API_KEY) {
        console.warn('⚠️ Azure OpenAI API key not available');
        return false;
      }

      const client = new OpenAIClient(
        'https://aimcs-foundry.cognitiveservices.azure.com/',
        new AzureKeyCredential(this.secrets.AZURE_OPENAI_API_KEY)
      );

      const testPrompt = 'Generate a brief positive news story about modern technology innovation. Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "O4-Mini" }]';

      const response = await client.getChatCompletions('o4-mini', [
        { role: 'user', content: testPrompt }
      ], {
        maxTokens: 200,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return false;

      // Try to parse JSON response
      try {
        const stories = JSON.parse(content);
        return Array.isArray(stories) && stories.length > 0;
      } catch {
        return false;
      }
    } catch (error) {
      console.error('❌ Azure OpenAI test failed:', error.message);
      return false;
    }
  }

  /**
   * Test Grok 4 model
   */
  async testGrok4() {
    try {
      if (!this.secrets.GROK_API_KEY) {
        console.warn('⚠️ Grok API key not available');
        return false;
      }

      const testPrompt = 'Generate a brief positive news story about modern technology innovation. Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Grok 4" }]';

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secrets.GROK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3-70b-8192',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) return false;

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) return false;

      // Try to parse JSON response
      try {
        const stories = JSON.parse(content);
        return Array.isArray(stories) && stories.length > 0;
      } catch {
        return false;
      }
    } catch (error) {
      console.error('❌ Grok 4 test failed:', error.message);
      return false;
    }
  }

  /**
   * Test Perplexity Sonar model
   */
  async testPerplexitySonar() {
    try {
      if (!this.secrets.PERPLEXITY_API_KEY) {
        console.warn('⚠️ Perplexity API key not available');
        return false;
      }

      const testPrompt = 'Generate a brief positive news story about modern technology innovation. Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Perplexity Sonar" }]';

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secrets.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-medium-online',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) return false;

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) return false;

      // Try to parse JSON response
      try {
        const stories = JSON.parse(content);
        return Array.isArray(stories) && stories.length > 0;
      } catch {
        return false;
      }
    } catch (error) {
      console.error('❌ Perplexity Sonar test failed:', error.message);
      return false;
    }
  }

  /**
   * Test Gemini 1.5 Flash model
   */
  async testGeminiFlash() {
    try {
      if (!this.secrets.GEMINI_API_KEY) {
        console.warn('⚠️ Gemini API key not available');
        return false;
      }

      const testPrompt = 'Generate a brief positive news story about modern technology innovation. Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Gemini 1.5 Flash" }]';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.secrets.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: testPrompt }]
          }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) return false;

      const data = await response.json();
      const content = data.candidates[0]?.content?.parts[0]?.text;
      if (!content) return false;

      // Try to parse JSON response
      try {
        const stories = JSON.parse(content);
        return Array.isArray(stories) && stories.length > 0;
      } catch {
        return false;
      }
    } catch (error) {
      console.error('❌ Gemini 1.5 Flash test failed:', error.message);
      return false;
    }
  }

  /**
   * Cache a story for the modern epoch using the most reliable model
   */
  async cacheModernEpochStory() {
    if (this.reliableModels.length === 0) {
      console.warn('⚠️ No reliable models available for caching');
      return null;
    }

    // Use the first reliable model
    const selectedModel = this.reliableModels[0];
    console.log(`📝 Caching modern epoch story using ${selectedModel}...`);

    try {
      let story;
      
      switch (selectedModel) {
        case 'azure-openai':
          story = await this.generateAzureOpenAIStory('Technology', 'Modern', 1);
          break;
        case 'grok-4':
          story = await this.generateGrok4Story('Technology', 'Modern', 1);
          break;
        case 'perplexity-sonar':
          story = await this.generatePerplexityStory('Technology', 'Modern', 1);
          break;
        case 'gemini-1.5-flash':
          story = await this.generateGeminiStory('Technology', 'Modern', 1);
          break;
        default:
          console.warn(`⚠️ Unknown model: ${selectedModel}`);
          return null;
      }

      if (story && story.length > 0) {
        this.cachedModernStory = story[0];
        
        // Cache the story in the database
        await this.storyCacheService.cacheStory({
          category: 'Technology',
          epoch: 'Modern',
          story: this.cachedModernStory,
          source: selectedModel,
          language: 'en'
        });

        console.log(`✅ Cached modern epoch story:`, this.cachedModernStory.headline);
        return this.cachedModernStory;
      }
    } catch (error) {
      console.error('❌ Failed to cache modern epoch story:', error.message);
    }

    return null;
  }

  /**
   * Generate story using Azure OpenAI
   */
  async generateAzureOpenAIStory(category, epoch, count) {
    const client = new OpenAIClient(
      'https://aimcs-foundry.cognitiveservices.azure.com/',
      new AzureKeyCredential(this.secrets.AZURE_OPENAI_API_KEY)
    );

    const prompt = `Generate ${count} fascinating, positive ${category} stories from ${epoch.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries. Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "O4-Mini" }]`;

    const response = await client.getChatCompletions('o4-mini', [
      { role: 'user', content: prompt }
    ], {
      maxTokens: 500,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    try {
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  /**
   * Generate story using Grok 4
   */
  async generateGrok4Story(category, epoch, count) {
    const prompt = `Generate ${count} fascinating, positive ${category} stories from ${epoch.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries. Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Grok 4" }]`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secrets.GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) return [];

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) return [];

    try {
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  /**
   * Generate story using Perplexity Sonar
   */
  async generatePerplexityStory(category, epoch, count) {
    const prompt = `Generate ${count} fascinating, positive ${category} stories from ${epoch.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries. Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Perplexity Sonar" }]`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secrets.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-medium-online',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) return [];

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) return [];

    try {
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  /**
   * Generate story using Gemini 1.5 Flash
   */
  async generateGeminiStory(category, epoch, count) {
    const prompt = `Generate ${count} fascinating, positive ${category} stories from ${epoch.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries. Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "Gemini 1.5 Flash" }]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.secrets.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) return [];

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text;
    if (!content) return [];

    try {
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  /**
   * Get cached modern story
   */
  getCachedModernStory() {
    return this.cachedModernStory;
  }

  /**
   * Get reliable models
   */
  getReliableModels() {
    return this.reliableModels;
  }
} 