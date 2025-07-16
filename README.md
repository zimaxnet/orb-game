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
- `MONGO_URI`: Your MongoDB Atlas connection string
- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key
- `AZURE_OPENAI_DEPLOYMENT`: Your Azure OpenAI deployment name
- `AZURE_OPENAI_TTS_DEPLOYMENT`: Your Azure OpenAI TTS deployment name
- `PERPLEXITY_API_KEY`: Your Perplexity API key

---

## 🆕 Changelog

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
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🏗️ Architecture

### Frontend (React + Vite)
- **ChatInterface**: Main chat interface with memory integration
- **ControlPanel**: Analytics dashboard and system controls
- **MemoryPanel**: Memory browsing and conversation management
- **Responsive Design**: Modern UI with smooth animations

### Backend (Node.js + Express)
- **Azure OpenAI Integration**: GPT-4o-mini for chat, TTS for audio
- **Memory Service**: MongoDB Atlas for persistent conversation storage
- **Analytics Caching**: Preloaded memory data for instant analytics
- **Web Search**: Perplexity API for real-time information
- **Container Deployment**: Azure Container Apps with auto-scaling

### Data Storage
- **MongoDB Atlas**: Cloud database for memories and user profiles
- **Memory Analytics**: Aggregated conversation data and trending topics
- **Real-time Caching**: In-memory analytics cache for instant responses

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
- **Container Apps**: `aimcs-backend-eastus2`
- **DNS Zone**: `aimcs.net` (custom domain)
- **SSL Certificates**: `aimcs.net-aimcs`

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

## 📝 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by Zimax AI Labs**
# Deployment fix applied
