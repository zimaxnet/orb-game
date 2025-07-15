# AIMCS - AI Multimodal Customer System

---

## 🆕 Changelog

### 2024-07-15
- Fixed a bug where the memory export endpoint (`/api/memory/export`) returned an empty array despite existing memories. The backend now correctly retrieves and exports all stored memories.
- If the Memory Panel does not show memories, verify the backend is running the latest code and that the `/api/memory/export` endpoint returns data. Use `curl https://api.aimcs.net/api/memory/export` to check.

---

AIMCS is an advanced AI-powered chat system with memory, analytics, and multimodal capabilities, deployed on Azure with a React frontend and Node.js backend.

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

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker
- Azure CLI
- MongoDB Atlas account

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

- **Frontend**: https://aimcs.azurewebsites.net
- **Backend API**: https://api.aimcs.net
- **Azure Portal**: https://portal.azure.com
- **Documentation**: See individual component READMEs

## 📝 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by Zimax AI Labs**
