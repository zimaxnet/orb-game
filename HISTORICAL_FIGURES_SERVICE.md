# Historical Figures Service

## Overview

The Historical Figures Service is a new backend service that replaces the Positive News Service, focusing specifically on generating stories about historical figures from the `OrbGameInfluentialPeopleSeeds` data. This service provides a more focused and educational approach to content generation.

## Key Features

### 🎯 Focused Content
- **Historical Figures Only**: All stories focus on specific historical figures from the seed data
- **Educational Content**: Stories provide educational value about real historical figures
- **Structured Data**: Uses predefined historical figures organized by category and epoch

### 🌍 Multi-Language Support
- **English (en)**: Primary language support
- **Spanish (es)**: Secondary language support
- **TTS Integration**: Text-to-speech audio generation for both languages

### ⏰ Time Period Coverage
- **Ancient**: Stories from ancient civilizations
- **Medieval**: Stories from the medieval period
- **Industrial**: Stories from the industrial revolution
- **Modern**: Stories from modern times
- **Future**: Stories about contemporary and future-oriented figures

### 📚 Category Coverage
- **Technology**: Innovators and inventors
- **Science**: Scientists and researchers
- **Art**: Artists and creators
- **Nature**: Naturalists and environmentalists
- **Sports**: Athletes and sports figures
- **Music**: Musicians and composers
- **Space**: Astronauts and space scientists
- **Innovation**: General innovators and entrepreneurs

## Service Architecture

### Core Components

#### HistoricalFigureStory Class
```javascript
class HistoricalFigureStory {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.category = data.category || '';
    this.epoch = data.epoch || 'Modern';
    this.language = data.language || 'en';
    this.headline = data.headline || '';
    this.summary = data.summary || '';
    this.fullText = data.fullText || '';
    this.source = data.source || 'o4-mini';
    this.historicalFigure = data.historicalFigure || '';
    this.storyType = data.storyType || 'historical-figure';
    this.publishedAt = data.publishedAt || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastUsed = data.lastUsed || null;
    this.useCount = data.useCount || 0;
    this.ttsAudio = data.ttsAudio || null;
    this.ttsGeneratedAt = data.ttsGeneratedAt || null;
  }
}
```

#### HistoricalFiguresService Class
- **Database Integration**: MongoDB with `historical_figures_stories` collection
- **Seed Data Loading**: Loads historical figures from `OrbGameInfluentialPeopleSeeds`
- **Story Generation**: Uses Azure OpenAI o4-mini for story generation
- **TTS Integration**: Azure OpenAI TTS for audio generation
- **Caching**: Efficient database indexing and querying

## API Endpoints

### Primary Endpoints

#### Get Historical Figure Stories
```
GET /api/orb/historical-figures/:category
```
**Parameters:**
- `category`: Story category (Technology, Science, Art, etc.)
- `count`: Number of stories to return (default: 1)
- `epoch`: Time period (default: Modern)
- `language`: Language code (default: en)
- `includeTTS`: Include TTS audio (default: false)

**Response:**
```json
[
  {
    "id": "1234567890",
    "category": "Technology",
    "epoch": "Modern",
    "language": "en",
    "headline": "Tim Berners-Lee Revolutionizes the Web",
    "summary": "Tim Berners-Lee invented the World Wide Web...",
    "fullText": "Tim Berners-Lee, a British computer scientist...",
    "source": "o4-mini",
    "historicalFigure": "Tim Berners-Lee",
    "storyType": "historical-figure",
    "publishedAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "useCount": 5,
    "ttsAudio": "base64_encoded_audio_data",
    "ttsGeneratedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Generate Historical Figure Stories
```
POST /api/orb/generate-historical-figures/:category
```
**Body:**
```json
{
  "epoch": "Modern",
  "count": 1,
  "language": "en",
  "includeTTS": true
}
```

#### Get Service Statistics
```
GET /api/historical-figures/stats
```
**Response:**
```json
{
  "success": true,
  "stats": [
    {
      "_id": {
        "category": "Technology",
        "epoch": "Modern",
        "language": "en"
      },
      "count": 15,
      "figures": ["Tim Berners-Lee", "Steve Jobs", "Hedy Lamarr"]
    }
  ],
  "categories": ["Technology", "Science", "Art", ...],
  "epochs": ["Ancient", "Medieval", "Industrial", "Modern", "Future"],
  "languages": ["en", "es"],
  "totalStories": 240
}
```

#### Get Historical Figures List
```
GET /api/historical-figures/list/:category/:epoch
```
**Response:**
```json
{
  "success": true,
  "category": "Technology",
  "epoch": "Modern",
  "figures": [
    {
      "name": "Tim Berners-Lee",
      "context": "Invented the World Wide Web."
    },
    {
      "name": "Steve Jobs",
      "context": "Revolutionized personal computing and smartphones."
    }
  ],
  "count": 3
}
```

#### Get Random Historical Figure Story
```
GET /api/historical-figures/random/:category
```
**Parameters:**
- `epoch`: Time period (default: Modern)
- `language`: Language code (default: en)

#### Preload Historical Figure Stories
```
POST /api/historical-figures/preload/:epoch
```
**Body:**
```json
{
  "categories": ["Technology", "Science"],
  "languages": ["en", "es"]
}
```

### Backward Compatibility

#### Legacy Positive News Endpoint
```
GET /api/orb/positive-news/:category
```
This endpoint is maintained for backward compatibility and redirects to the historical figures service.

## Database Schema

### Collection: `historical_figures_stories`

**Indexes:**
- `{ category: 1, epoch: 1, language: 1 }`
- `{ historicalFigure: 1 }`
- `{ lastUsed: 1 }`
- `{ createdAt: 1 }`
- `{ storyType: 1 }`

**Document Structure:**
```javascript
{
  _id: ObjectId,
  id: String,
  category: String,
  epoch: String,
  language: String,
  headline: String,
  summary: String,
  fullText: String,
  source: String,
  historicalFigure: String,
  storyType: String,
  publishedAt: Date,
  createdAt: Date,
  lastUsed: Date,
  useCount: Number,
  ttsAudio: String, // base64 encoded
  ttsGeneratedAt: Date
}
```

## Story Generation Process

### 1. Seed Data Loading
- Loads historical figures from `OrbGameInfluentialPeopleSeeds`
- Organizes figures by category and epoch
- Provides context for each historical figure

### 2. Figure Selection
- Randomly selects a historical figure from the appropriate category and epoch
- Ensures diversity in story generation

### 3. Prompt Generation
- Creates specific prompts for each historical figure
- Includes context and achievements
- Focuses on educational content

### 4. AI Generation
- Uses Azure OpenAI o4-mini for story generation
- Ensures stories include the historical figure's name
- Generates engaging, educational content

### 5. TTS Generation
- Generates audio using Azure OpenAI TTS
- Uses 'alloy' voice for both English and Spanish
- Stores audio as base64 in database

## Testing

### Service Testing
```bash
cd backend
node test-historical-figures-service.js
```

### API Testing
```bash
cd scripts
node test-historical-figures-api.js
```

## Migration from Positive News Service

### Key Changes
1. **Service Replacement**: `PositiveNewsService` → `HistoricalFiguresService`
2. **Database Collection**: `positive_news_stories` → `historical_figures_stories`
3. **Content Focus**: Generic positive news → Historical figure stories
4. **API Endpoints**: Updated to reflect historical figures focus

### Backward Compatibility
- Legacy `/api/orb/positive-news/:category` endpoint maintained
- Same response format for compatibility
- Automatic redirection to historical figures service

## Benefits

### 🎯 Educational Value
- **Real Historical Figures**: All stories focus on real people
- **Educational Content**: Provides learning opportunities
- **Structured Information**: Organized by category and time period

### 🔧 Technical Improvements
- **Focused Service**: Single purpose, easier to maintain
- **Better Performance**: Optimized for historical figure content
- **Improved Caching**: Efficient database indexing
- **Enhanced TTS**: Better audio generation

### 🌍 User Experience
- **Consistent Content**: All stories follow the same format
- **Educational Value**: Users learn about real historical figures
- **Engaging Stories**: Focused on achievements and contributions
- **Multi-language Support**: Available in English and Spanish

## Future Enhancements

### Planned Features
- **More Historical Figures**: Expand seed data with more figures
- **Additional Languages**: Support for more languages
- **Interactive Features**: Quizzes and trivia about historical figures
- **Visual Content**: Images and illustrations of historical figures
- **Timeline Features**: Chronological organization of stories

### Potential Integrations
- **Wikipedia API**: Real-time historical figure data
- **Image APIs**: Historical figure portraits
- **Educational APIs**: Additional educational content
- **Social Features**: User interactions and sharing

## Configuration

### Environment Variables
```bash
MONGO_URI=your-mongodb-connection-string
AZURE_OPENAI_ENDPOINT=your-azure-openai-endpoint
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT=o4-mini
AZURE_OPENAI_TTS_DEPLOYMENT=gpt-4o-mini-tts
```

### Database Setup
```javascript
// Create indexes for optimal performance
await stories.createIndex({ category: 1, epoch: 1, language: 1 });
await stories.createIndex({ historicalFigure: 1 });
await stories.createIndex({ lastUsed: 1 });
await stories.createIndex({ createdAt: 1 });
await stories.createIndex({ storyType: 1 });
```

This new Historical Figures Service provides a more focused, educational, and maintainable approach to content generation, replacing the generic positive news service with stories about real historical figures that users can learn from and be inspired by. 