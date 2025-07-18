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
- `MONGO_URI`: Your MongoDB Atlas connection string
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

Orb Game is an advanced AI-powered gaming system with memory, analytics, and multimodal capabilities, deployed on Azure with a React frontend and Node.js backend.

## 🚀 Features

### Core AI Capabilities
- **Intelligent Chat**: Powered by Azure OpenAI with context-aware responses
- **Memory System**: Remembers conversations and user preferences using MongoDB Atlas
- **Web Search**: Real-time information retrieval via Perplexity API
- **Text-to-Speech**: Audio responses for enhanced accessibility
- **Multi-language Support**: English and Spanish with easy language switching
- **Positive News System**: Fresh, positive news stories by category, updated every 15 minutes from Perplexity Sonar, served instantly from MongoDB with pre-generated TTS audio.

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
- **Interactive 3D Environment**: Beautiful 3D orb with orbiting satellites representing different news categories
- **Milky Way Background**: Stunning space environment with 5,000 animated stars, nebula clouds, and dynamic movement
- **Orb Movement Control**: Orbs stop moving when clicked, providing clear visual feedback of explored categories
- **Positive News Stories**: Click satellites to hear positive news from Technology, Science, Art, Nature, Sports, Music, Space, and Innovation
- **Scrollable News Content**: Full news stories with smooth scrolling for complete reading experience
- **Audio Experience**: Text-to-speech narration of news stories for immersive gameplay
- **Score System**: Earn points and build streaks by discovering new stories
- **Swipe-to-Dismiss Instructions**: Intuitive "How to Play" overlay that users can swipe away once they're ready
- **Mobile Optimized**: Touch-friendly controls and responsive design for all devices
- **Visual Feedback**: Clicked orbs have subtle glow effects to indicate exploration progress

## 🏗️ Architecture

### Frontend (React + Vite)
- **ChatInterface**: Main chat interface with memory integration
- **ControlPanel**: Analytics dashboard and system controls
- **MemoryPanel**: Memory browsing and conversation management
- **OrbGame**: Interactive 3D gaming experience with positive news integration
- **Responsive Design**: Modern UI with smooth animations and touch interactions

### Backend (Node.js + Express)
- **Azure OpenAI Integration**: GPT-4o-mini for chat, TTS for audio
- **Memory Service**: MongoDB Atlas for persistent conversation storage
- **Positive News Service**: Fetches and stores positive news by category from Perplexity Sonar, caches in MongoDB, and pre-generates TTS audio for instant response
- **Analytics Caching**: Preloaded memory data for instant analytics
- **Web Search**: Perplexity API for real-time information
- **Container Deployment**: Azure Container Apps with auto-scaling

### Positive News System (Backend)
- **Source**: Perplexity Sonar API (every 15 minutes, per category)
- **Fallback**: o4-mini generates content when Perplexity API is unavailable or no stories exist
- **Storage**: MongoDB collection `positive_news_stories`
- **Serving**: Fast, cached, random story per category (cycles through if no new news)
- **TTS**: Pre-generated using Azure OpenAI TTS, returned as base64 mp3
- **API Endpoint**: `/api/orb/positive-news/:category` (GET)
- **Categories**: Technology, Science, Art, Nature, Sports, Music, Space, Innovation, Health, Education
- **Reliability**: Ensures all categories always have content, even when external APIs fail

#### Example API Usage

```
GET https://api.orbgame.us/api/orb/positive-news/Technology
```

**Response:**
```json
{
  "headline": "AI Helps Doctors Diagnose Faster",
  "summary": "A new AI system is helping doctors diagnose diseases more quickly and accurately.",
  "fullText": "Researchers have developed an AI tool that assists doctors in diagnosing complex diseases, reducing errors and improving patient outcomes.",
  "source": "Perplexity Sonar",
  "publishedAt": "2024-07-17T12:00:00Z",
  "ttsAudio": "<base64 mp3>"
}
```

#### Required Environment Variables (Backend)
- `MONGO_URI`: MongoDB Atlas connection string
- `PERPLEXITY_API_KEY`: Perplexity Sonar API key
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY`: Azure OpenAI API key
- `AZURE_OPENAI_DEPLOYMENT`: Azure OpenAI deployment name (for fallback content generation)
- `AZURE_OPENAI_TTS_DEPLOYMENT`: Azure OpenAI TTS deployment name

#### Testing the Fallback System
```bash
# Test all categories to ensure they have content
node scripts/test-positive-news-fallback.js

# Backfill all topics with o4-mini content
node scripts/backfill-topics.js

# Test individual category
curl https://your-backend-url/api/orb/positive-news/Technology
```

#### How It Works
- Every 15 minutes, the backend fetches the latest positive news for each category from Perplexity Sonar
- New stories are added to MongoDB; if no new stories, cycles through existing ones
- **Fallback System**: If no stories exist for a category, o4-mini generates positive content automatically
- **Service Resilience**: If Perplexity API is unavailable, the system generates content directly using Azure OpenAI
- TTS audio is pre-generated and stored with each story (including fallback content)
- When a user requests a story, a random (fresh) story is served instantly with text and audio
- **Guaranteed Content**: All categories always have content, ensuring a smooth user experience

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
1. **Explore the Orb**: You'll see a central orb with colorful satellites orbiting around it in a stunning Milky Way background
2. **Hover for Info**: Hover over satellites to see their category names (Technology, Science, Art, etc.)
3. **Click to Listen**: Click any satellite to hear a positive news story from that category
4. **Watch Orbs Stop**: Clicked orbs will stop moving and glow slightly to show you've explored them
5. **Read Full Stories**: Scroll through complete news content in the news panel
6. **Build Your Score**: Each story you discover earns you points and builds your streak
7. **Close Stories**: Use the ✕ button in the news panel to return to orb exploration
8. **Audio Controls**: Use the play/pause and mute buttons to control audio playback

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

Before deploying the backend, you must set the `MONGO_URI` environment variable in your terminal. This is required for the backend to connect to your MongoDB Atlas database.

**PowerShell:**
```powershell
$env:MONGO_URI="<YOUR_MONGODB_ATLAS_CONNECTION_STRING>"
```

**Bash/Zsh:**
```bash
export MONGO_URI="<YOUR_MONGODB_ATLAS_CONNECTION_STRING>"
```

Replace `<YOUR_MONGODB_ATLAS_CONNECTION_STRING>` with your actual connection string from the Atlas portal. The deployment scripts use this variable to configure the Azure Container App. If this variable is not set, the backend will fail to connect to the database.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker
- Azure CLI
- MongoDB Atlas account
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
- **Orb Movement Control**: Satellites stop moving when clicked, providing clear exploration feedback
- **Category-based News**: Technology, Science, Art, Nature, Sports, Music, Space, Innovation
- **Audio Integration**: Text-to-speech for news stories with play/pause controls
- **Scrollable Content**: Full news stories with smooth scrolling for complete reading
- **Easy Navigation**: Close button (✕) to exit news and return to orb view
- **Visual Feedback**: Hover effects, animations, and glow effects for enhanced user experience
- **Score System**: Earn points and build streaks by exploring different categories

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

### Testing
```bash
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
   MONGO_URI=mongodb+srv://<user>:<password>@aimcs-cluster.rpcaamg.mongodb.net/?retryWrites=true&w=majority
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
