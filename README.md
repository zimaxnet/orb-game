# 🎮 Orb Game

An advanced AI-powered interactive gaming platform that combines time travel, historical figure discovery, and multimodal AI technology. The system features a React frontend with 3D Three.js graphics, a Node.js backend with o4-mini AI model integration, and comprehensive Azure cloud deployment.

## 🌟 **Key Features**

### **🎯 Historical Figure Stories**
- **240 Pre-populated Stories**: Based on real historical figures and their accomplishments
- **8 Categories**: Technology, Science, Art, Nature, Sports, Music, Space, Innovation
- **5 Epochs**: Ancient, Medieval, Industrial, Modern, Future
- **2 Languages**: English and Spanish with cultural sensitivity
- **Educational Focus**: Learn about real people who shaped history

### **🤖 AI Integration**
- **O4-Mini Model**: Fast and efficient story generation with Azure OpenAI
- **Text-to-Speech**: Immersive audio narration with 'alloy' voice
- **Historical Accuracy**: Stories based on documented achievements
- **Personal Narratives**: First-person perspective from historical figures

### **🎮 Interactive 3D Experience**
- **Milky Way Background**: 5,000 animated stars for immersive atmosphere
- **Orbiting Satellites**: 8 interactive orbs representing different categories
- **Drag & Drop**: Intuitive 3D interaction to discover stories
- **Responsive Design**: Works on desktop and mobile devices

### **📚 Story Content**
Each story features:
- **Historical Figure**: Real person from history
- **Achievements**: Their specific accomplishments in the category
- **Context**: Historical period and cultural background
- **Impact**: How their work shaped history
- **Personal Journey**: Their discoveries and contributions

## 🏗️ **Architecture**

### **Frontend (React + Vite)**
- **Main Component**: `components/OrbGame.jsx` - 3D interactive gaming experience
- **State Management**: React hooks with context providers (`contexts/LanguageContext.jsx`)
- **3D Graphics**: Three.js with @react-three/fiber and @react-three/drei
- **Build System**: Vite with React 19.x support
- **Styling**: CSS modules with component-specific stylesheets

### **Backend (Node.js + Express)**
- **Main Server**: `backend/backend-server.js` - Production API server
- **Services**: Modular service architecture (MemoryService, StoryCacheService)
- **AI Integration**: O4-Mini model with Azure OpenAI
- **Database**: Azure Cosmos DB for MongoDB with caching system
- **Security**: Azure Key Vault for API key management

### **Deployment (Azure)**
- **Frontend**: Azure Web App with GitHub Actions CI/CD
- **Backend**: Azure Container Apps with auto-scaling
- **Registry**: Azure Container Registry (`orbgameregistry`)
- **Secrets**: Azure Key Vault with RBAC authentication

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Azure subscription (for production deployment)
- Azure OpenAI service with o4-mini model

### **Local Development**

1. **Clone the repository**
```bash
git clone https://github.com/your-username/orb-game.git
cd orb-game
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
cd backend && npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your Azure OpenAI credentials
```

4. **Start development servers**
```bash
# Frontend (in root directory)
npm run dev

# Backend (in backend directory)
cd backend
node backend-server.js
```

5. **Access the game**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 📊 **Story Coverage**

### **Historical Figures by Category & Epoch**

| Category | Ancient | Medieval | Industrial | Modern | Future |
|----------|---------|----------|------------|--------|--------|
| **Technology** | Archimedes, Imhotep, Hero | Al-Jazari, Gutenberg, Li Shizhen | Watt, Babbage, Morse | Berners-Lee, Jobs, Lamarr | Fei-Fei Li, Musk, Hassabis |
| **Science** | Hippocrates, Euclid, Aristotle | Ibn al-Haytham, Bacon, Hildegard | Darwin, Pasteur, Mendeleev | Franklin, Einstein, Doudna | Youyou Tu, Sinclair, Quantum Pioneer |
| **Art** | Phidias, Polygnotus, Imhotep | Giotto, Hildegard, Rublev | Monet, Blake, Courbet | Kahlo, Banksy, Kusama | Anadol, Crespo, Holographic Artist |
| **Nature** | Theophrastus, Empedocles, Huang Di | Albertus Magnus, Avicenna, Francis | Darwin, Audubon, Anning | Goodall, Carson, Wilson | Conservation Leaders |
| **Sports** | Ancient Olympic athletes | Medieval tournament champions | Industrial era pioneers | Modern Olympic legends | Future athletic innovators |
| **Music** | Ancient composers | Medieval musicians | Classical composers | Modern music innovators | Future sound artists |
| **Space** | Ancient astronomers | Medieval stargazers | Industrial astronomers | Modern space explorers | Future space pioneers |
| **Innovation** | Ancient inventors | Medieval innovators | Industrial revolutionaries | Modern tech pioneers | Future visionaries |

### **Story Generation Process**
```
Historical Figure Data → O4-Mini Generation → TTS Audio → MongoDB Storage → User Experience
```

## 🎯 **Game Features**

### **Story Discovery**
- **Interactive Orbs**: Click orbs to discover historical figure stories
- **Epoch Selection**: Travel through different time periods
- **Category Exploration**: Explore 8 different fields of achievement
- **Language Support**: Switch between English and Spanish

### **Audio Experience**
- **Text-to-Speech**: Immersive audio narration
- **Voice Selection**: 'alloy' voice for both languages
- **Audio Controls**: Play, pause, and mute functionality
- **Background Music**: Atmospheric sound design

### **User Interface**
- **3D Environment**: Immersive Three.js graphics
- **Responsive Design**: Works on all device sizes
- **Touch Controls**: Swipe gestures for mobile
- **Visual Feedback**: Animations and glow effects

## 🔧 **Development Guidelines**

### **File Structure**
```
orb-game/
├── components/          # React components
├── contexts/           # React context providers
├── utils/              # Utility functions (promptManager)
├── api/                # API client functions
├── backend/            # Node.js backend server
├── scripts/            # Deployment and utility scripts
├── public/             # Static assets
└── docs/               # Documentation
```

### **Naming Conventions**
- **Components**: PascalCase (e.g., `OrbGame.jsx`)
- **Files**: kebab-case for scripts, camelCase for modules
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Functions**: camelCase
- **Classes**: PascalCase

### **Code Style**
- **JavaScript**: ES6+ modules with import/export
- **React**: Functional components with hooks
- **CSS**: Component-specific stylesheets
- **Backend**: Async/await with proper error handling
- **Comments**: JSDoc style for functions and classes

## 🤖 **AI Model Integration**

### **O4-Mini Model**
- **Provider**: Azure OpenAI
- **Model**: o4-mini
- **Features**: Fast, efficient, reliable processing
- **Cost**: ~$0.01-0.05 per story
- **Response Time**: ~0.1s average

### **AI Model Parameters**
- **O4-Mini**: Use `max_completion_tokens` (not `max_tokens`)
- **TTS Models**: Use `Authorization: Bearer` header
- **Token Limits**: 2000 tokens for complete JSON responses
- **TTS Voices**: Use `alloy` voice for both English and Spanish

### **Story Generation**
- **Historical Focus**: All stories based on real historical figures
- **Personal Narratives**: First-person perspective from historical figures
- **Educational Content**: Accurate historical information
- **Rich Context**: Personal background and historical period

## 🌍 **Internationalization**

### **Language Support**
- **Primary**: English (`en`)
- **Secondary**: Spanish (`es`)
- **Context**: `contexts/LanguageContext.jsx`
- **TTS Voices**: `alloy` (English), `jorge` (Spanish)
- **Caching**: Language-specific story and audio caching

### **Translation Guidelines**
- Use `useLanguage()` hook for language context
- Cache stories separately by language
- Provide culturally appropriate content
- Support language switching with story refresh

## 🗄️ **Database & Caching**

### **MongoDB Integration**
- **Connection**: Azure Cosmos DB for MongoDB (`orb-game-mongodb-eastus2`)
- **Collections**: Stories, memories, analytics
- **Throughput**: 2000 RU/s per collection
- **Performance**: 5x throughput increase from 400 RU/s baseline
- **Caching**: 88.2% performance improvement for cached requests
- **TTL**: 30-day expiration for cached content

### **Cache Management**
```javascript
// Check cache before generating new content
const cachedStories = await storyCacheService.getStories(category, epoch, model, language);
if (cachedStories.length > 0) {
  return cachedStories;
}
```

## 🚀 **Deployment Patterns**

### **Azure Resources**
- **Resource Group**: `orb-game-rg-eastus2`
- **Frontend**: Azure Web App (`orb-game`) - Live at https://orbgame.us
- **Backend**: Azure Container Apps (`orb-game-backend-eastus2`)
- **Registry**: Azure Container Registry (`orbgameregistry`)
- **Key Vault**: `orb-game-kv-eastus2`

### **Docker Platform Requirements**
- **Backend Images**: Must be built for `linux/amd64` platform
- **Build Command**: `docker build --platform linux/amd64 -f backend-Dockerfile -t orbgameregistry.azurecr.io/orb-game-backend:latest .`
- **Azure Container Apps**: Require amd64 images for proper deployment

### **Deployment Scripts**
- **Full Deployment**: `scripts/deploy-full.sh`
- **Frontend Only**: `scripts/deploy-azure.sh`
- **Backend Only**: `scripts/setup-backend.sh`
- **Environment Setup**: `scripts/set-azure-build-env.sh`

### **Environment Variables**
```bash
# Required for backend
MONGO_URI=your-azure-cosmos-db-connection-string
AZURE_OPENAI_ENDPOINT=your-azure-openai-endpoint
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT=o4-mini
AZURE_OPENAI_TTS_DEPLOYMENT=gpt-4o-mini-tts
```

## 🧪 **Testing & Quality Assurance**

### **Test Scripts**
- **AI Models**: `scripts/test-ai-models.js`
- **Backend**: `scripts/test-new-backend.js`
- **Cache System**: `scripts/test-story-cache-comprehensive.js`
- **Performance**: `scripts/performance-comparison.js`
- **Memory**: `scripts/test-memory.sh`

### **Testing Guidelines**
- Run comprehensive test suite before deployment
- Verify o4-mini model is working: `node scripts/test-ai-models.js`
- Test story generation: `node scripts/test-fixed-story-generation.js`
- Debug API issues: `node scripts/debug-api-response.js`
- Check cache performance metrics
- Validate multi-language support
- Test Azure Key Vault integration

## 🔒 **Security & Authentication**

### **Azure Key Vault Integration**
- **RBAC**: Role-Based Access Control (not access policies)
- **Managed Identity**: Container app uses managed identity
- **Secrets**: All API keys stored securely
- **Permissions**: "Key Vault Secrets User" role required

### **Security Best Practices**
- Never commit API keys to source code
- Use environment variables for configuration
- Implement proper CORS headers
- Validate all user inputs
- Use HTTPS for all communications

## 📊 **Performance Optimization**

### **Caching Strategy**
- **Database Caching**: MongoDB-based story and audio caching
- **Performance**: 88.2% faster response times for cached requests
- **Cost Savings**: 29.0% reduction in token usage
- **Cache Hit Rate**: 50% in test scenarios

### **Optimization Guidelines**
- Preload stories for selected epochs
- Cache TTS audio as base64 in database
- Use efficient Three.js rendering
- Implement proper error handling
- Monitor Azure resource usage

## 🎮 **Gaming Features**

### **Core Gameplay**
- **3D Environment**: Milky Way background with 5,000 animated stars
- **Orb Interaction**: Drag orbs to center for story discovery
- **Epoch Selection**: Time travel through different eras
- **Category Exploration**: 8 different historical figure categories
- **Audio Integration**: Text-to-speech for immersive experience

### **User Experience**
- **Responsive Design**: Works on desktop and mobile
- **Touch Controls**: Swipe gestures for mobile interaction
- **Visual Feedback**: Animations and glow effects
- **Accessibility**: Audio controls and keyboard navigation

## 🔧 **Development Workflow**

### **Local Development**
```bash
# Frontend
npm install --legacy-peer-deps
npm run dev

# Backend
cd backend
npm install
node backend-server.js
```

### **Deployment Process**
1. Update Azure Key Vault secrets
2. Build and test locally
3. Run deployment scripts
4. Verify Azure resources
5. Test production endpoints

### **Story Prepopulation Process**
1. Ensure Azure Key Vault credentials are set
2. Check existing stories: `node scripts/check-existing-stories.js`
3. Run missing stories generation: `node scripts/generate-missing-stories.js`
4. Monitor progress and error statistics
5. Verify stories in MongoDB using `scripts/check-database-stories.js`
6. Test story loading in the game interface

### **Git Workflow**
- Use descriptive commit messages
- Test changes before committing
- Update documentation for new features
- Follow semantic versioning

## 📚 **Documentation Standards**

### **Code Documentation**
- Use JSDoc comments for functions and classes
- Document complex algorithms and business logic
- Include examples for API endpoints
- Maintain up-to-date README files

### **Architecture Documentation**
- Keep `PROJECT_STRUCTURE.md` updated
- Document deployment procedures
- Maintain AI model status documentation
- Update prompt reference documentation

## 🚨 **Critical Notes**

### **Important Reminders**
- **O4-Mini Model**: Use `max_completion_tokens`, not `max_tokens`
- **Temperature Parameter**: Not supported for O4-Mini (use default 1)
- **Authorization Header**: Use `Authorization: Bearer` for Azure OpenAI
- **TTS Voice**: Use `alloy` for both English and Spanish (avoid `jorge`)
- **Token Limits**: Use 2000 tokens for complete story generation
- **Database Migration**: All data migrated from `aimcs` to `orbgame`
- **Registry Name**: Use `orbgame` registry, not `aimcsregistry`
- **Docker Platform**: Always build with `--platform linux/amd64` for Azure Container Apps

### **Common Issues**
- Key Vault RBAC permissions for container app
- CORS configuration for cross-origin requests
- TTS audio generation for different languages
- Cache invalidation and story freshness
- Azure Container App scaling configuration
- Docker platform mismatch (must use `linux/amd64` for Azure Container Apps)
- Container App deployment failures due to wrong platform architecture
- **API Parameter Issues**: Use `max_completion_tokens` not `max_tokens` for o4-mini
- **TTS Voice Issues**: Use `alloy` voice (avoid `jorge` - not supported)
- **Empty API Responses**: Check token limits and parameter names
- **JSON Parse Errors**: Implement JSON fix attempts and empty content checks

## 🎯 **Best Practices**

### **Code Quality**
- Write self-documenting code
- Use TypeScript-like JSDoc comments
- Implement proper error boundaries
- Follow React best practices
- Use async/await consistently

### **Performance**
- Optimize Three.js rendering
- Implement efficient caching strategies
- Monitor Azure resource usage
- Use lazy loading where appropriate
- Minimize bundle size

### **Security**
- Validate all user inputs
- Use secure authentication methods
- Implement proper CORS policies
- Store secrets in Azure Key Vault
- Use HTTPS for all communications
- **Key Vault Integration**: All scripts fetch credentials from `orb-game-kv-eastus2`
- **Managed Identity**: Container apps use managed identity for Key Vault access
- **RBAC Authentication**: Role-based access control for Key Vault secrets

### **Error Handling**
- **JSON Error Recovery**: Implement JSON fix attempts for malformed responses
- **Empty Content Detection**: Check for empty API responses before parsing
- **Comprehensive Error Tracking**: Track JSON parse, TTS, API, MongoDB, and network errors
- **Token Limit Management**: Use appropriate token limits for different model types
- **API Parameter Validation**: Ensure correct parameter names for each model

### **Testing**
- Write comprehensive test suites
- Test AI model integrations
- Validate multi-language support
- Check performance metrics
- Verify deployment procedures

## 🎉 **Success Metrics**

- **240 Historical Figure Stories**: Comprehensive coverage of real historical personalities
- **O4-Mini Integration**: Fast, reliable story generation
- **Multi-language Support**: English and Spanish with cultural sensitivity
- **3D Interactive Experience**: Engaging Three.js powered interface
- **Azure Cloud Deployment**: Scalable, secure, and performant
- **Educational Value**: Real historical figures and their accomplishments

The Orb Game provides an engaging, educational experience focused on real historical figures who shaped the world through their remarkable achievements! 🚀
