# AIMCS - AI Multimodal Customer System

A modern AI-powered chat interface with web search capabilities, built with React/Vite frontend and Node.js backend, deployed on Azure with global CDN via Azure Front Door.

## 🚀 Features

- **AI Chat Interface**: Powered by Azure OpenAI GPT-4o-mini
- **🧠 Memory System**: Intelligent caching and retrieval of chat completions
- **Dual Response Mode**: Text responses with optional audio playback
- **Web Search Integration**: Automatic web search for current information
- **Text-to-Speech**: Audio responses using Azure OpenAI TTS
- **Multilingual Support**: English and Spanish interface
- **Real-time Updates**: Live chat with streaming responses
- **Modern UI**: Responsive design with beautiful gradients
- **Azure Deployment**: Frontend on Static Web Apps, Backend on Container Apps
- **Global CDN**: Azure Front Door Standard with 118+ edge locations worldwide

## 📁 Project Structure

```
aimcs-deploy/
├── frontend/                    # React/Vite frontend
│   ├── components/             # React components
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # App entry point
│   ├── index.html              # HTML template
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
├── backend/                    # Node.js backend
│   ├── backend-server.js       # Express server
│   ├── package.json            # Backend dependencies
│   ├── backend-Dockerfile      # Docker configuration
│   └── setup-backend.sh        # Backend setup script
├── scripts/                    # Deployment and setup scripts
├── .github/workflows/          # GitHub Actions workflows
└── docs/                       # Documentation
```

## 🛠️ Local Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Azure OpenAI API access

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp ../env.example .env
   # Edit .env with your Azure OpenAI credentials
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 🌐 Environment Variables

### Backend (.env)

```env
AZURE_OPENAI_ENDPOINT=https://aimcs-foundry.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=o4-mini
AZURE_OPENAI_TTS_DEPLOYMENT=gpt-4o-mini-tts
AZURE_OPENAI_API_VERSION=2025-01-01-preview
PERPLEXITY_API_KEY=your-perplexity-key
PORT=3000
```

## 🚀 Deployment

### Frontend (Azure Static Web Apps)

The frontend is automatically deployed via GitHub Actions when you push to the `main` branch.

**Manual deployment:**
```bash
npm run build
# Deploy dist/ folder to Azure Static Web Apps
```

### Backend (Azure Container Apps)

1. **Build and push Docker image:**
   ```bash
   cd backend
       docker build -t aimcs-backend .
    docker tag aimcs-backend aimcsregistry.azurecr.io/aimcs-backend
    docker push aimcsregistry.azurecr.io/aimcs-backend
   ```

2. **Deploy to Azure Container Apps:**
   ```bash
       az containerapp update \
      --name aimcs-backend-eastus2 \
      --resource-group aimcs-rg-eastus2 \
      --image aimcsregistry.azurecr.io/aimcs-backend
   ```

### Memory Integration Deployment

For the complete memory system deployment:

```bash
# Deploy memory integration with testing
./scripts/deploy-memory.sh
```

This script will:
- Build and deploy the backend with memory service
- Deploy the frontend with memory panel
- Test all memory endpoints
- Verify functionality

## 🔧 Configuration

### Frontend Configuration

- **Backend URL**: Configured in `components/ChatInterface.jsx`
- **Custom Domain**: `aimcs.net` (configured in Azure Front Door)
- **API Endpoint**: `api.aimcs.net`

### Backend Configuration

- **Port**: 3000 (configurable via PORT env var)
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: Built-in request limiting
- **Health Check**: Available at `/health`
- **Memory API**: Available at `/api/memory/*`
  - `GET /api/memory/stats` - Memory statistics
  - `POST /api/memory/search` - Search memories
  - `GET /api/memory/export` - Export all memories

### Azure Front Door Configuration

- **Profile**: `zimax-fd` (Standard_AzureFrontDoor)
- **Endpoint**: `aimcs-endpoint-f0ghgcatf4fufndr.z02.azurefd.net`
- **Origin**: Azure Static Web App (`proud-hill-01b4b180f.1.azurestaticapps.net`)
- **Custom Domain**: `aimcs.net` (✅ Validated and Approved)
- **SSL**: Automatic certificate provisioning
- **Global CDN**: 118+ edge locations worldwide

#### Domain Configuration
- **Primary Domain**: `aimcs.net` → Azure Front Door (✅ HTTPS Working)
- **WWW Subdomain**: `www.aimcs.net` → Azure Front Door (⚠️ HTTP only)
- **API Domain**: `api.aimcs.net` → Azure Container App (✅ Direct connection)

## 📱 Features

### Chat Interface
- Real-time messaging with AI
- **🧠 Memory Integration**: Intelligent caching and retrieval of responses
- **Text and Audio Responses**: Users can read text and optionally play audio
- Message history persistence
- Auto-scroll to latest messages
- Loading states and error handling
- Audio playback state management
- **Memory Indicators**: Visual indicators when responses come from memory

### Web Search
- Automatic detection of search needs
- Integration with Perplexity API
- Source attribution
- Search mode toggle (Auto/Web/Local)

### 🧠 Memory System
- **Automatic Caching**: Every chat response is stored in memory
- **Instant Retrieval**: Identical queries return cached responses instantly
- **Smart Matching**: Fuzzy matching finds similar previous conversations
- **Memory Panel**: Search and browse conversation history
- **Usage Analytics**: Track memory usage patterns and statistics
- **Memory Management**: Automatic cleanup of old, unused memories
- **User Isolation**: Separate memory stores per user

### Audio Features
- **Dual Response Mode**: Users can see text responses AND play audio
- Text-to-speech responses using Azure OpenAI TTS
- Audio playback controls (Play/Pause/Stop)
- Visual audio availability indicators
- MP3 format support with automatic cleanup
- Audio state management across multiple messages

### UI/UX
- Responsive design
- Dark theme with gradients
- Multilingual support (EN/ES)
- Accessibility features
- Mobile-friendly interface
- **Memory Panel**: Search and browse conversation history
- **Memory Statistics**: Real-time usage analytics and insights

## 🔒 Security

- Environment variable protection
- CORS configuration
- Input validation
- Rate limiting
- Secure API key handling
- Azure Front Door DDoS protection
- Automatic SSL certificate management

## 📊 Monitoring

- Health check endpoints
- Request logging
- Error tracking
- Performance monitoring
- Azure Front Door analytics and metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
1. Check the documentation in `/docs`
2. Review existing issues
3. Create a new issue with detailed information

## 🔄 Updates

### Latest Updates (Latest)
- **🐛 Bug Fix**: Fixed JavaScript error causing page to disappear after submitting queries
- **🧠 Memory System Integration**: Intelligent caching and retrieval of chat completions
- **Memory Panel**: Search and browse conversation history with statistics
- **Memory Indicators**: Visual indicators when responses come from memory
- **Azure Front Door Integration**: Global CDN with 118+ edge locations
- **Custom Domain Validation**: `aimcs.net` fully operational with HTTPS
- **Enhanced Audio/Text Response**: Users can now see text responses with optional audio playback
- **Improved Audio Controls**: Better visual design and user experience for audio controls
- **Audio Availability Indicators**: Clear visual indicators when audio is available
- **Fixed Response Mapping**: Corrected backend response data mapping for better reliability

### Deployment Updates
- **Frontend**: Automatically deployed on push to `main`
- **Backend**: Manual deployment via Azure Container Apps
- **CDN**: Azure Front Door Standard with global edge caching
- **Dependencies**: Regular security updates via npm audit

---

**Live Demo**: [https://aimcs.net](https://aimcs.net)  
**API Documentation**: [https://api.aimcs.net](https://api.aimcs.net)
# Deployment trigger - Sun Jul  6 20:24:00 MST 2025
