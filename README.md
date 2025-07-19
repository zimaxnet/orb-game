# Orb Game - AI Multimodal Gaming System

---

## 🚨 **IMPORTANT: Developer Setup Notes**

### **Required Name Changes for New Developers**

When setting up this project for the first time, you **MUST** update the following names to match your own Azure resources:

#### **1. Azure Resource Names (Critical)**
- **Resource Group**: Change `orb-game-rg-eastus2` to your resource group name
- **Container App**: Change `orb-game-backend-eastus2` to your container app name
- **Web App**: Change `orb-game` to your web app name
- **Container Registry**: Change `orbgameregistry` to your registry name

#### **2. Backend URL Configuration**
Update these files to use your Azure Container App URL:
- `components/ChatInterface.jsx` - Line 19
- `components/MemoryPanel.jsx` - Line 27
- `components/MemoryTrivia.jsx` - Line 11
- `components/OrbGame.jsx` - Line 172

**Current URL**: `https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io`
**Replace with**: Your Azure Container App URL

#### **3. Custom Domain (Optional)**
- **Domain**: `api.orbgame.us` - Change to your custom domain
- **Certificate**: Must be configured in Azure Container App
- **DNS**: Point your domain to the Azure Container App

#### **4. GitHub Secrets**
Ensure these secrets are set in your GitHub repository:
- `AZURE_CREDENTIALS`
- `AZURE_WEBAPP_PUBLISH_PROFILE`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_TTS_DEPLOYMENT`
- `PERPLEXITY_API_KEY`
- `MONGO_URI`

#### **5. Environment Variables**
Update Azure Container App environment variables:

**Option A: Manual Setup (Azure Portal)**
- `MONGO_URI`: Your Azure Cosmos DB for MongoDB connection string
- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key
- `AZURE_OPENAI_DEPLOYMENT`: Your Azure OpenAI deployment name
- `AZURE_OPENAI_TTS_DEPLOYMENT`: Your Azure OpenAI TTS deployment name
- `PERPLEXITY_API_KEY`: Your Perplexity API key

**Option B: Automated Setup (Scripts)**
```bash
# Interactive setup with prompts
./scripts/setup-azure-build-env.sh

# Automated setup (requires environment variables)
export PERPLEXITY_API_KEY="your-perplexity-key"
export MONGO_URI="your-mongodb-uri"
./scripts/set-azure-build-env.sh
```

---

## 🆕 Changelog

### 2025-07-19 (Latest)
- **🤖 MULTI-AI INTEGRATION**: Successfully integrated 4 AI models - Grok 4, Perplexity Sonar, Gemini 1.5 Flash, and O4-Mini
- **🔑 SECURE API MANAGEMENT**: All API keys now stored securely in Azure Key Vault
- **📈 PERFORMANCE OPTIMIZATION**: Auto-scaling Azure Cosmos DB (1000-4000 RU/s) with 15-40% cost savings
- **🎮 FRONTEND ENHANCEMENT**: Added Gemini 1.5 Flash to model selection with 4 AI models available
- **✅ 100% SUCCESS RATE**: All AI models tested and working with response times from 0.1s to 3.8s
- **🚀 PRODUCTION READY**: Complete multi-model AI gaming platform with secure key management

### 2025-01-19
- **🤖 AI MODEL SELECTION**: Users can now choose between Grok 4, Perplexity Sonar, and O4-Mini for story generation
- **🔄 FRESH STORY GENERATION**: Always generates fresh stories from AI models instead of using cached content
- **📚 STORY CATALOGUE**: Builds a catalogue of 5 stories per session for users to cycle through
- **🎯 EPOCH-SPECIFIC PROMPTS**: Custom prompts for each time period (Ancient, Medieval, Industrial, Modern, Future)
- **⚡ PROGRESS INDICATORS**: Animated progress bars and dynamic loading messages during story generation
- **🔄 FALLBACK SYSTEM**: If no stories exist, automatically generates new content from the selected AI model
- **🎵 AUDIO AUTOPLAY**: Stories automatically play audio when loaded
- **🎮 MANUAL CONTROLS**: "Go" button for manual story retrieval from selected model
- **🎨 UI IMPROVEMENTS**: Darker model selector text, better placement, and enhanced visual feedback
- **🧹 DEPLOYMENT CLEANUP**: Removed unnecessary files to streamline build and deployment

### 2024-12-19
- **NEW FEATURE**: Replaced scoring panel with rotating epoch roller - users can now select time periods to get era-specific positive news stories
- **TIME-TRAVEL GAMEPLAY**: Added epochs like Ancient, Medieval, Modern, Future - modifies news content to fit the selected time period
- **BACKEND SUPPORT**: API now accepts ?epoch param to generate time-themed stories using rotated sources (Sonar, Grok, Azure)
- **REMOVED**: Scoring and streak system to focus on exploration and time-based discovery
- **UI ENHANCEMENTS**: Animated rotating selector with hover-pause for fun interaction
- **DRAG MECHANICS**: Users now drag orbs to the center to hear stories, with smooth animations and visual feedback
- **ORB LABELING**: All orbs now display their category labels permanently for easy identification
- **CENTER INTERACTION**: Orbs animate to center when clicked, show "Click ✕ to release" instruction
- **RELEASE MECHANISM**: Users can release orbs back to orbit using the ✕ button in the news panel

### 2024-12-19
- **NEW FEATURE**: Added stunning Milky Way background with 5,000 animated stars, nebula clouds, and dynamic space environment
- **NEW FEATURE**: Implemented orb movement stopping - orbs now stop moving when clicked, providing better user experience and visual feedback
- **NEW FEATURE**: Added scrollable text in news panels - users can now read full news content with smooth scrolling
- **ENHANCED UX**: Updated background gradient to darker space theme for better contrast with the Milky Way
- **VISUAL IMPROVEMENTS**: Clicked orbs now have subtle glow effects to indicate they've been explored
- **PERFORMANCE**: Optimized star rendering with efficient Three.js BufferGeometry for smooth 60fps performance

### 2024-12-19
- **NEW FEATURE**: Added prominent "How to Play" overlay with swipe-to-dismiss functionality - users now see comprehensive game instructions when they first load the Orb Game
- **ENHANCED UX**: The overlay includes step-by-step instructions with icons, animations, and responsive design for both mobile and desktop
- **INTERACTIVE DISMISSAL**: Users can swipe in any direction or click to dismiss the overlay and start playing immediately
- **NEW FEATURE**: Added close button (✕) to news panel in Orb Game - users can now easily exit news view and return to orb exploration
- **FALLBACK SYSTEM**: Enhanced positive news system with o4-mini fallback - all topics now have content even when Perplexity API is unavailable
- **RELIABILITY IMPROVEMENT**: Added automatic content generation for empty categories and direct fallback when services are unavailable
- **PERPLEXITY API FIX**: Updated backend to use correct `sonar` model name instead of outdated model names
- **BACKEND DEPLOYMENT**: Successfully rebuilt and deployed backend with working Perplexity API integration

### 2024-07-17
- **MAJOR UPDATE**: Positive News system now fetches, stores, and serves fresh, positive news stories by category from Perplexity Sonar, with TTS audio, using MongoDB for caching and fast response. See new API endpoint `/api/orb/positive-news/:category`.

### 2024-07-16
- Added a new **Memory Trivia** mini-game accessible from the Control Panel. Compete with yourself by guessing answers from your past conversations!

### 2024-07-16
- **MAJOR UPDATE**: Converted from AIMCS to Orb Game branding throughout the application
- Updated all frontend components to use Azure Container App backend URL
- Fixed deployment verification to look for "Orb Game" instead of "AIMCS"
- Added comprehensive developer setup notes for new developers

### 2024-07-15
- Fixed a bug where the memory export endpoint (`/api/memory/export`) returned an empty array despite existing memories. The backend now correctly retrieves and exports all stored memories.
- If the Memory Panel does not show memories, verify the backend is running the latest code and that the `/api/memory/export` endpoint returns data. Use `curl https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io/api/memory/export` to check.

---

## 🚀 Current Status (2025-07-19)

### ✅ **Backend Status**
- **Container Revision**: `orb-game-backend-eastus2--0000085` (Latest)
- **Multi-AI Models**: ✅ All 4 AI models working (Grok 4, Perplexity Sonar, Gemini 1.5 Flash, O4-Mini)
- **Azure Cosmos DB**: ✅ Auto-scaling (1000-4000 RU/s) with cost optimization
- **Key Vault Integration**: ✅ All API keys securely managed
- **Deployment**: ✅ Healthy and operational
- **Traffic**: 100% directed to latest revision

### ✅ **Frontend Status**
- **AI Model Selection**: ✅ 4 AI models available for users
- **Model Integration**: ✅ Gemini 1.5 Flash added to selection
- **Backend URL**: Correctly pointing to `https://api.orbgame.us`

### 🎯 **AI Models Performance**
- **Grok 4**: 3.8s response time - Advanced reasoning and creative stories
- **Perplexity Sonar**: 0.1s response time - Real-time web search and synthesis
- **Gemini 1.5 Flash**: 0.2s response time - Fast and creative content generation
- **O4-Mini**: 0.1s response time - Fast and efficient processing

### 📋 **Production Ready**
- ✅ All AI models tested and working
- ✅ Secure API key management in Azure Key Vault
- ✅ Auto-scaling database with cost optimization
- ✅ Complete frontend integration with model selection

---

Orb Game is an advanced AI-powered gaming system with memory, analytics, and multimodal capabilities, deployed on Azure with a React frontend and Node.js backend.

## 🚀 Features

### Core AI Capabilities
- **Intelligent Chat**: Powered by Azure OpenAI with context-aware responses
- **Memory System**: Remembers conversations and user preferences using Azure Cosmos DB for MongoDB
- **Web Search**: Real-time information retrieval via Perplexity API
- **Text-to-Speech**: Audio responses for enhanced accessibility
- **Multi-language Support**: English and Spanish with easy language switching
- **🤖 Multi-Model AI System**: Choose between Grok 4, Perplexity Sonar, Gemini 1.5 Flash, and O4-Mini for story generation
- **🔄 Fresh Story Generation**: Always generates fresh, engaging content from selected AI models
- **📚 Story Catalogue**: Builds a catalogue of 5 stories per session for rich content exploration
- **🎯 Epoch-Specific Content**: Custom prompts for Ancient, Medieval, Industrial, Modern, and Future epochs
- **⚡ Progress Indicators**: Real-time progress bars and dynamic loading messages
- **🔄 Intelligent Fallback**: Automatically generates new content when no stories exist
- **🎵 Audio Integration**: Automatic audio playback with TTS for immersive experience

### Advanced Memory & Analytics
- **Smart Memory Retrieval**: Automatically finds relevant past conversations
- **Memory Context Injection**: Enhances AI responses with historical context
- **Real-time Analytics**: Instant analytics dashboard with cached memory data
- **Trending Topics**: Identifies popular conversation themes
- **Performance Metrics**: Response times, memory hit rates, usage patterns

### Enhanced User Experience
- **Instant Analytics**: Preloaded memory data - no more spinning loaders!
- **Navigation Improvements**: Easy navigation between chat, controls, and analytics
- **Memory Panel**: Browse, search, and continue conversations
- **Control Panel**: Real-time system status and quick actions
- **Memory Trivia Game**: Fun quiz that tests knowledge of stored memories 🎮
- **Orb Game**: Interactive 3D orb exploration with positive news stories and easy close functionality
- **How to Play Overlay**: Prominent, swipeable instructions that guide new users through the game mechanics
- **Responsive Design**: Works seamlessly on desktop and mobile

### Orb Game Features
- **🤖 AI Model Selection**: Choose between Grok 4, Perplexity Sonar, Gemini 1.5 Flash, and O4-Mini for story generation
- **🔄 Fresh Content Generation**: Always generates fresh stories from selected AI models
- **📚 Story Catalogue System**: Builds a catalogue of 5 stories per session for rich exploration
- **🎯 Epoch-Specific Prompts**: Custom prompts for Ancient, Medieval, Industrial, Modern, and Future epochs
- **⚡ Progress Indicators**: Animated progress bars and dynamic loading messages during generation
- **🎮 Manual Controls**: "Go" button for manual story retrieval from selected model
- **🎵 Audio Autoplay**: Stories automatically play audio when loaded
- **🔄 Intelligent Fallback**: Generates new content when no stories exist in database
- **Interactive 3D Environment**: Beautiful 3D orb with orbiting satellites representing different news categories
- **Milky Way Background**: Stunning space environment with 5,000 animated stars, nebula clouds, and dynamic movement
- **Epoch Roller**: Rotating time selector to choose eras (Ancient to Future) for era-specific positive news
- **Drag-to-Center Mechanics**: Click orbs to drag them to the center for story interaction
- **Permanent Orb Labels**: All orbs display their category names (Technology, Science, Art, etc.) for easy identification
- **Center Interaction**: Orbs animate smoothly to center when clicked, with visual feedback and instructions
- **Release Mechanism**: Click ✕ to release orbs back into orbit after hearing stories
- **Positive News Stories**: Hear positive news from Technology, Science, Art, Nature, Sports, Music, Space, and Innovation
- **Scrollable News Content**: Full news stories with smooth scrolling for complete reading experience
- **Audio Experience**: Text-to-speech narration of news stories for immersive gameplay
- **Story Cycling**: Previous/Next buttons to browse multiple stories per topic with enhanced navigation
- **AI Source Rotation**: Stories gathered from Grok, Perplexity Sonar, and Azure AI with loading indicators

## 🏗️ Architecture

### Frontend (React + Vite)
- **ChatInterface**: Main chat interface with memory integration
- **ControlPanel**: Analytics dashboard and system controls
- **MemoryPanel**: Memory browsing and conversation management
- **OrbGame**: Interactive 3D gaming experience with positive news integration
- **Responsive Design**: Modern UI with smooth animations and touch interactions

### Backend (Node.js + Express)
- **Azure OpenAI Integration**: GPT-4o-mini for chat, TTS for audio with updated API parameters
- **Memory Service**: Azure Cosmos DB for persistent conversation storage
- **Positive News Service**: Fetches and stores positive news by category from Perplexity Sonar, caches in Cosmos DB, and pre-generates TTS audio for instant response
- **Analytics Caching**: Preloaded memory data for instant analytics
- **Web Search**: Perplexity API for real-time information
- **Container Deployment**: Azure Container Apps with auto-scaling (currently running revision 0000064)

### 🤖 Multi-Model AI Story Generation System (Backend)
- **🤖 AI Model Selection**: Users can choose between Grok 4, Perplexity Sonar, and O4-Mini
- **🔄 Fresh Story Generation**: Always generates fresh stories from selected AI models via POST requests
- **📚 Story Catalogue**: Builds a catalogue of 5 stories per session for rich content exploration
- **🎯 Epoch-Specific Prompts**: Custom prompts for Ancient, Medieval, Industrial, Modern, and Future epochs
- **⚡ Progress Indicators**: Real-time progress bars and dynamic loading messages
- **🔄 Intelligent Fallback**: Automatically generates new content when no stories exist
- **🎵 Audio Integration**: Automatic TTS generation and playback for immersive experience
- **API Endpoints**: 
  - `/api/orb/positive-news/:category` (GET) - Legacy cached stories
  - `/api/orb/generate-news/:category` (POST) - Fresh AI-generated stories
- **Categories**: Technology, Science, Art, Nature, Sports, Music, Space, Innovation, Health, Education
- **Reliability**: Ensures all categories always have content with intelligent fallback system

#### Example API Usage

**Legacy Cached Stories:**
```
GET https://api.orbgame.us/api/orb/positive-news/Technology
```

**Fresh AI-Generated Stories:**
```
POST https://api.orbgame.us/api/orb/generate-news/Technology
Content-Type: application/json

{
  "category": "Technology",
  "epoch": "Modern",
  "model": "grok-4",
  "count": 5,
  "prompt": "Generate 5 fascinating, positive Technology stories from modern times..."
}
```

**Response:**
```json
[
  {
    "headline": "AI Helps Doctors Diagnose Faster",
    "summary": "A new AI system is helping doctors diagnose diseases more quickly and accurately.",
    "fullText": "Researchers have developed an AI tool that assists doctors in diagnosing complex diseases, reducing errors and improving patient outcomes.",
    "source": "Grok 4",
    "publishedAt": "2025-01-19T12:00:00Z",
    "ttsAudio": "<base64 mp3>"
  }
]
```

#### Required Environment Variables (Backend)
- `MONGO_URI`: Azure Cosmos DB for MongoDB connection string
- `PERPLEXITY_API_KEY`: Perplexity Sonar API key (for perplexity-sonar model)
- `GROK_API_KEY`: xAI Grok API key (for grok-4 model)
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY`: Azure OpenAI API key
- `AZURE_OPENAI_DEPLOYMENT`: Azure OpenAI deployment name (for o4-mini model)
- `AZURE_OPENAI_TTS_DEPLOYMENT`: Azure OpenAI TTS deployment name

#### Testing the AI Model Generation System
```bash
# Test all AI models and categories
node scripts/test-ai-models.js

# Test all categories to ensure they have content
node scripts/test-positive-news-fallback.js

# Backfill all topics with o4-mini content
node scripts/backfill-topics.js

# Test individual category (legacy)
curl https://your-backend-url/api/orb/positive-news/Technology

# Test fresh AI generation
curl -X POST https://your-backend-url/api/orb/generate-news/Technology \
  -H "Content-Type: application/json" \
  -d '{"category":"Technology","epoch":"Modern","model":"grok-4","count":3}'
```

#### How It Works
- **🤖 Multi-Model Selection**: Users can choose between Grok 4, Perplexity Sonar, and O4-Mini for story generation
- **🔄 Fresh Generation**: Always generates fresh stories from selected AI models via POST requests to `/api/orb/generate-news/:category`
- **📚 Story Catalogue**: Builds a catalogue of 5 stories per session for rich content exploration
- **🎯 Epoch-Specific Prompts**: Custom prompts for Ancient, Medieval, Industrial, Modern, and Future epochs
- **⚡ Progress Indicators**: Real-time progress bars and dynamic loading messages during generation
- **🔄 Intelligent Fallback**: If no stories exist, automatically generates new content from the selected AI model
- **🎵 Audio Integration**: Automatic TTS generation and playback for immersive experience
- **Service Resilience**: If any AI model is unavailable, falls back to alternative models or generates content directly
- **Guaranteed Content**: All categories always have content, ensuring a smooth user experience
- **Legacy Support**: Still supports cached stories via `/api/orb/positive-news/:category` for backward compatibility

### Data Storage
- **MongoDB Atlas**: Cloud database for memories and user profiles
- **Memory Analytics**: Aggregated conversation data and trending topics
- **Real-time Caching**: In-memory analytics cache for instant responses

## 🎮 How to Play Orb Game

### Getting Started
1. **First Time Users**: When you load the Orb Game, you'll see a prominent "How to Play" overlay
2. **Swipe to Dismiss**: Swipe in any direction (up, down, left, right) to dismiss the instructions
3. **Click to Dismiss**: Alternatively, click anywhere on the overlay or the ✕ button
4. **Start Playing**: Once dismissed, you're ready to explore the 3D orb environment

### Game Mechanics
1. **Select Epoch**: Use the rotating roller (top-right) to choose a time period - it spins for fun, hover to select!
2. **Explore the Orb**: You'll see a central orb with colorful labeled satellites orbiting around it in a stunning Milky Way background
3. **Read Orb Labels**: Each orb displays its category name (Technology, Science, Art, etc.) for easy identification
4. **Drag to Center**: Click any orb to drag it to the center - watch the smooth animation as it moves!
5. **Hear Stories**: Once in the center, the orb will gather and play positive news stories from that category
6. **Cycle Stories**: Use Previous/Next buttons to browse different stories for the topic
7. **Read Full Stories**: Scroll through complete news content in the news panel
8. **Release Back to Orbit**: Click the ✕ button to release the orb back into orbit
9. **Audio Controls**: Use the play/pause and mute buttons to control story narration
10. **Try Different Epochs**: Change the time period to hear era-specific stories!

### Categories Available
- **Technology**: Latest tech innovations and breakthroughs
- **Science**: Scientific discoveries and research advances
- **Art**: Creative achievements and cultural highlights
- **Nature**: Environmental wins and conservation success
- **Sports**: Athletic achievements and inspiring moments
- **Music**: Musical innovations and cultural milestones
- **Space**: Space exploration and astronomical discoveries
- **Innovation**: General innovation and human progress

## ☁️ Azure Infrastructure

### Primary Resource Group: `orb-game-rg-eastus2`
**Location**: East US 2 (Virginia)

### Frontend Deployment
- **Service**: Azure Web App
- **Name**: `orb-game`
- **Plan**: `orb-game-plan` (B1 Linux)
- **Runtime**: Node.js 20 LTS
- **URL**: https://orb-game.azurewebsites.net
- **Deployment**: GitHub Actions with Azure service principal

### Backend Deployment
- **Service**: Azure Container Apps
- **Name**: `orb-game-backend-eastus2`
- **Environment**: `orb-game-env`
- **Registry**: `orbgameregistry` (Azure Container Registry)
- **Image**: `orbgameregistry.azurecr.io/orb-game-backend:latest`
- **Scaling**: Auto-scaling with min replicas
- **URL**: https://orb-game-backend-eastus2.greenwave-bb2ac4ae.eastus2.azurecontainerapps.io

### Container Registry
- **Name**: `orbgameregistry`
- **Type**: Azure Container Registry
- **Location**: East US 2
- **Authentication**: Service principal with push/pull permissions

### Monitoring & Logging
- **Workspace**: `workspace-orbgamergeastus2sCvX`
- **Service**: Azure Monitor (Operational Insights)
- **Log Analytics**: Centralized logging for both frontend and backend

### Security & Access
- **Service Principal**: `orb-game-sp` with Contributor role on resource group
- **GitHub Secrets**: All credentials stored securely in GitHub Actions
- **Environment Variables**: Configured via Azure Web App settings and Container Apps

### Network Configuration
- **Frontend**: Public web app with custom domain support
- **Backend**: Container app with ingress enabled
- **CORS**: Configured for cross-origin requests between frontend and backend
- **SSL**: Automatic HTTPS with Azure-managed certificates

### Deployment Pipeline
- **CI/CD**: GitHub Actions with Azure service principal
- **Build**: Vite build for frontend, Docker build for backend
- **Deploy**: Automated deployment on push to main branch
- **Secrets**: All Azure credentials managed via GitHub Secrets

---

### Legacy Infrastructure: `aimcs-rg-eastus2`
**Location**: East US 2 (Virginia)

### CDN & Global Distribution
- **Service**: Azure Front Door (CDN)
- **Profile**: `zimax-fd`
- **SKU**: Standard_AzureFrontDoor
- **Location**: Global
- **Endpoints**: 
  - `orb-game-endpoint` (for Orb Game)
  - `aimcs-endpoint` (for AIMCS)
  - `zimax` (custom endpoint)
- **Purpose**: Global content delivery, SSL termination, custom domains

### Additional Services
- **Container Registry**: `aimcsregistry`
- **Cognitive Services**: 
  - `aimcs-openai` (Azure OpenAI)
  - `aimcs-speech-eastus2` (Speech Services)
- **Web Apps**: `aimcs` (Static Web App)

## ⚙️ Deployment Configuration

Before deploying the backend, you must set the `MONGO_URI` environment variable in your terminal. This is required for the backend to connect to your Azure Cosmos DB for MongoDB database.

**PowerShell:**
```powershell
$env:MONGO_URI="<YOUR_AZURE_COSMOS_DB_CONNECTION_STRING>"
```

**Bash/Zsh:**
```bash
export MONGO_URI="<YOUR_AZURE_COSMOS_DB_CONNECTION_STRING>"
```

Replace `<YOUR_MONGODB_ATLAS_CONNECTION_STRING>` with your actual connection string from the Atlas portal. The deployment scripts use this variable to configure the Azure Container App. If this variable is not set, the backend will fail to connect to the database.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker
- Azure CLI
- Azure Cosmos DB for MongoDB account
- **React 19.x and ReactDOM 19.x are now required. All dependencies are compatible with React 19.**

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Deployment
```bash
# Deploy to Azure
./scripts/deploy-full.sh

# Or deploy components separately
./scripts/deploy-azure.sh  # Frontend
./scripts/setup-backend.sh # Backend
```

## 📊 Analytics Features

### Instant Analytics Dashboard
- **Preloaded Data**: Memory analytics cached on startup for instant loading
- **Real-time Updates**: Cache refreshes every 60 seconds
- **Trending Topics**: Most accessed memories and popular conversation themes
- **Performance Metrics**: Response times, memory hit rates, search usage
- **System Health**: Backend service status and uptime monitoring

### Memory Analytics
- **Conversation Tracking**: Total chats, web searches, memory retrievals
- **Word Frequency Analysis**: Trending topics and popular keywords
- **User Engagement**: Interaction patterns and conversation styles
- **Memory Hit Rates**: Success rate of memory retrieval and context injection

## 🧠 Memory System

### Smart Memory Features
- **Automatic Retrieval**: Finds relevant memories based on conversation context
- **Memory Injection**: Enhances AI responses with historical conversation data
- **Conversation Continuity**: Seamlessly continues previous discussions
- **Memory Search**: Browse and search through conversation history
- **Memory Export**: Export conversation data for backup or analysis

### Memory Panel Features
- **Browse Conversations**: Scroll through conversation history
- **Smart Search**: Find specific conversations or topics
- **Continue Conversations**: Resume previous discussions with context
- **Memory Export**: Download conversation data
- **Memory Sharing**: Share interesting conversations

## 🎮 Control Panel

### Enhanced Navigation
- **Dual Navigation**: "Back to Controls" and "Return to Chat" buttons
- **Modal Actions**: Consistent navigation across all panels
- **Quick Access**: Easy switching between chat and analytics
- **Responsive Design**: Works on all screen sizes

### Quick Games
- **Memory Trivia**: Guess the correct answer to random memory questions and build your high score!

## 🌟 Orb Game

### Interactive 3D Experience
- **3D Orb Exploration**: Click on orbiting satellites to discover positive news
- **Milky Way Environment**: Immersive space background with 5,000 animated stars and nebula clouds
- **Epoch Time Travel**: Rotating roller to select historical/futuristic eras for themed stories
- **Orb Movement Control**: Satellites stop moving when clicked, providing clear exploration feedback
- **Category-based News**: Technology, Science, Art, Nature, Sports, Music, Space, Innovation
- **Audio Integration**: Text-to-speech for news stories with play/pause controls
- **Scrollable Content**: Full news stories with smooth scrolling for complete reading
- **Story Cycling**: Browse multiple stories per topic with navigation buttons
- **Easy Navigation**: Close button (✕) to exit news and return to orb view
- **Visual Feedback**: Hover effects, animations, and glow effects for enhanced user experience

### News Panel Features
- **Close Button**: Red ✕ button in top-right corner for easy exit
- **Audio Controls**: Play/pause and mute buttons for news audio
- **Scrollable Content**: Smooth scrolling for reading full news stories
- **Category Stories**: Fresh positive news from Perplexity Sonar API
- **Responsive Design**: Works on desktop and mobile devices
- **Visual Indicators**: Scrollbar styling for better user experience

### Analytics Dashboard
- **Overview Stats**: Total conversations, web searches, memory usage
- **Trending Topics**: Most popular conversation themes
- **Fun Insights**: Interesting facts and usage patterns
- **System Health**: Real-time service status monitoring

## 🔧 API Endpoints

### Core Endpoints
- `POST /api/chat` - Main chat endpoint with memory integration
- `GET /api/analytics/summary` - Instant analytics with cached data
- `GET /api/memory/profile` - User memory profile
- `POST /api/memory/search` - Search through memories
- `GET /api/memory/export` - Export conversation data
- `GET /api/orb/positive-news/:category?count=3&epoch=Ancient` - Legacy cached stories for cycling
- `POST /api/orb/generate-news/:category` - Fresh AI-generated stories from selected model

### Health & Status
- `GET /health` - System health check
- `GET /api/memory/stats` - Memory system statistics

## 🛠️ Development

### Backend Development
```bash
cd backend
npm install
npm start
```

### Frontend Development
```bash
npm install
npm run dev
```

### Adding New AI Models
See [ADD_NEW_AI_MODEL_PROCEDURE.md](ADD_NEW_AI_MODEL_PROCEDURE.md) for a detailed guide on adding new AI models, including updating the selection list, prepopulating stories, and Key Vault integration.

### Azure Key Vault Configuration (RBAC)
The backend uses Azure Key Vault with **Role-Based Access Control (RBAC)** for secure secret management:

1. **Key Vault Setup**: The Key Vault `orb-game-kv-eastus2` uses RBAC instead of access policies
2. **Container App Permissions**: The container app's managed identity has "Key Vault Secrets User" role
3. **Secret Management**: API keys are stored as secrets and fetched at runtime
4. **RBAC Assignment**: The container app's managed identity is granted access via:
   ```bash
   az role assignment create \
     --assignee <container-app-managed-identity-id> \
     --role "Key Vault Secrets User" \
     --scope "/subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.KeyVault/vaults/<key-vault-name>"
   ```

**Note**: If you encounter Key Vault access issues, verify the RBAC role assignment is correct and the container app's managed identity has the necessary permissions.

### Testing
```bash
# Test AI model generation
node scripts/test-ai-models.js

# Test memory functions
bash scripts/test-memory.sh

# Test deployment
./scripts/deploy-full.sh
```

## 📈 Performance

### Analytics Caching
- **Instant Loading**: Preloaded memory data eliminates loading spinners
- **Background Refresh**: Cache updates every 60 seconds
- **Real-time Metrics**: Live performance and usage statistics
- **Memory Optimization**: Efficient data aggregation and storage

### System Performance
- **Response Time**: Average 2.3s response time
- **Memory Hit Rate**: 85% successful memory retrieval
- **Search Usage**: 25% of conversations use web search
- **Uptime**: High availability with Azure Container Apps

## 🔗 Links

- **Frontend**: https://orbgame.us
- **Backend API**: https://api.orbgame.us
- **Azure Portal**: https://portal.azure.com
- **Documentation**: See individual component READMEs

## 🌟 Live Features

- **🤖 AI Model Selection**: Choose between Grok 4, Perplexity Sonar, and O4-Mini
- **🔄 Fresh Story Generation**: Always generates fresh content from selected AI models
- **📚 Story Catalogue**: Rich catalogue of 5 stories per session for exploration
- **🎯 Epoch-Specific Content**: Custom prompts for Ancient, Medieval, Industrial, Modern, and Future epochs
- **⚡ Progress Indicators**: Real-time progress bars and dynamic loading messages
- **🎵 Audio Autoplay**: Automatic audio playback for immersive experience
- **🎮 Manual Controls**: "Go" button for manual story retrieval
- **Milky Way Background**: Stunning space environment with animated stars
- **Orb Movement Control**: Orbs stop when clicked for better UX
- **Scrollable News**: Complete news content with smooth scrolling
- **Visual Feedback**: Glow effects on explored orbs
- **Space Theme**: Dark gradient background for immersive experience

## 📝 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by Zimax AI Labs**
# Deployment fix applied

## MongoDB Connection & Environment Helpers

The project now includes scripts to verify your Atlas connection locally and propagate the same connection string to CI/CD and Azure:

1. **Configure `.env`**
   
   Put your connection string in the root `.env` file:
   
   ```bash
   MONGO_URI=mongodb://<account-name>:<primary-key>@<account-name>.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@<account-name>@
   ```

2. **Local connectivity test**
   
   ```bash
   cd scripts
   ./test-mongodb.sh   # runs scripts/test-mongodb.mjs
   ```
   You should see green *Ping successful* messages. If authentication fails, fix the user/password in Atlas or whitelist your IP.

3. **Propagate to GitHub Secrets & Azure**
   
   After the URI works locally, push it to both GitHub Actions and the Azure Container App with one command:
   
   ```bash
   scripts/update-mongo-env.sh
   ```
   Requirements:
   * `gh` CLI logged-in (`gh auth login`)
   * `az` CLI logged-in (`az login`)

   The default resource-group and container-app names are set at the top of the script; adjust if your Azure names differ.

These helpers ensure the same `MONGO_URI` is used locally, in CI pipelines, and at runtime in Azure.  
Happy hacking!
