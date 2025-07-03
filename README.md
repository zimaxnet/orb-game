# Zimax AI - AI Multimodal Customer System

A modern, beautiful chat interface for AI-powered customer service with text, voice, and web search capabilities.

## ⚠️ CRITICAL: File Structure & Server Files

**IMPORTANT: This repository contains BOTH frontend and backend code. Pay attention to which server file you're using!**

### Server Files Location & Purpose

| File | Location | Purpose | Start Command |
|------|----------|---------|---------------|
| **Frontend Server** | `server.js` (root) | Development server for React frontend | `npm run dev` |
| **Backend Server** | `backend-server.js` (root) | Production API server for Azure Container Apps | `node backend-server.js` |

### Common Mistakes to Avoid

❌ **DON'T**: Use `src/server.js` - this file doesn't exist  
❌ **DON'T**: Use `package.json` for backend - use `backend-package.json`  
❌ **DON'T**: Build backend with frontend files - use `.dockerignore`  
✅ **DO**: Use `backend-server.js` for backend deployments  
✅ **DO**: Use `backend-package.json` for backend dependencies  
✅ **DO**: Use `backend-Dockerfile` for backend container builds  

### Quick Reference

**For Frontend Development:**
```bash
npm install          # Uses package.json
npm run dev         # Starts Vite dev server (server.js)
```

**For Backend Development:**
```bash
# Use backend-specific files
cp backend-package.json package.json
npm install
node backend-server.js
```

**For Backend Deployment:**
```bash
docker buildx build --platform linux/amd64 -f backend-Dockerfile -t aimcs-backend:latest . --push
```

## 🌐 Live Demo

- **Frontend**: https://aimcs.net
- **Backend API**: https://api.aimcs.net (Azure Container App)

## 🚀 Quick Start

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Docker (for backend deployment)
- Azure CLI (for cloud deployment)

### Frontend Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aimcs-deploy
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Backend Installation

1. Navigate to the backend directory:
```bash
cd aimcs-deploy
```

2. Install backend dependencies:
```bash
cp backend-package.json package.json
npm install
```

3. Set up environment variables (see Configuration section)

4. Start the development server:
```bash
node backend-server.js
```

### Building for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
docker buildx build --platform linux/amd64 -t aimcsregistry.azurecr.io/aimcs-backend:latest -f backend-Dockerfile . --push
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Custom CSS with modern features (CSS Grid, Flexbox, CSS Variables)
- **Fonts**: Inter (Google Fonts)
- **Icons**: SVG icons and emojis
- **Audio**: Web Audio API for voice playback

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **AI Services**: Azure OpenAI (o4-mini, gpt-4o-mini-tts)
- **Web Search**: Perplexity API (sonar model)
- **Container**: Docker with multi-platform support
- **Deployment**: Azure Container Apps

## 📱 Features in Detail

### Chat Interface
- Real-time message exchange with AI
- Message timestamps
- Typing indicators
- Auto-scroll to latest messages
- Message status indicators

### Voice Features
- Text-to-speech integration via Azure OpenAI
- Audio playback controls
- Base64 audio data handling
- Automatic audio cleanup

### AI Capabilities
- **Primary Model**: Azure OpenAI o4-mini for text generation
- **TTS Model**: Azure OpenAI gpt-4o-mini-tts for speech synthesis
- **Web Search**: Automatic web search integration via Perplexity API (sonar model)
- **Smart Context**: Automatic detection of topics requiring current information

### Web Search Features
- **Real-time web search** via Perplexity API
- **Source citations** in responses
- **Automatic search detection** for current events and news
- **Manual search control** via `useWebSearch` parameter

### UI/UX Features
- Glassmorphism design elements
- Smooth hover animations
- Loading spinners
- Responsive breakpoints
- Dark theme with gradient backgrounds
- Custom scrollbars

### Accessibility
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast elements
- Semantic HTML structure

## 🎨 Design System

### Colors
- Primary: `#667eea` to `#764ba2` (gradient)
- Background: Glassmorphism with blur effects
- Text: White with various opacity levels
- Accents: Blue, green, red for different message types

### Typography
- Font Family: Inter (Google Fonts)
- Weights: 300, 400, 500, 600, 700
- Responsive font sizes

### Spacing
- Consistent 8px grid system
- Responsive padding and margins
- Flexible layouts with CSS Grid and Flexbox

## 🔧 Configuration

### Frontend Environment Variables
The application connects to the backend API at `https://api.aimcs.net`. You can modify the `BACKEND_URL` in `src/components/ChatInterface.jsx` if needed.

### Backend Environment Variables
Required environment variables for the backend:

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://aimcs-foundry.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT=o4-mini
AZURE_OPENAI_TTS_DEPLOYMENT=gpt-4o-mini-tts

# Perplexity API for Web Search
PERPLEXITY_API_KEY=your-perplexity-api-key
```

### Azure OpenAI Deployments
- **Chat Model**: `o4-mini` (gpt-4o-mini)
- **TTS Model**: `gpt-4o-mini-tts`
- **Endpoint**: `https://aimcs-foundry.cognitiveservices.azure.com/`

### Customization
- Colors: Modify CSS custom properties in `src/App.css`
- Animations: Adjust timing in CSS keyframes
- Layout: Update breakpoints in component CSS files

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

## 🚀 Deployment

### Frontend Deployment

#### Vercel
1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

#### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy

#### Azure Static Web Apps
1. Connect your repository to Azure Static Web Apps
2. Set build command: `npm run build`
3. Set output location: `dist`
4. Deploy

### Backend Deployment

#### Azure Container Apps
1. Build and push Docker image:
```bash
docker buildx build --platform linux/amd64 -t aimcsregistry.azurecr.io/aimcs-backend:latest -f backend-Dockerfile . --push
```

2. Deploy to Azure Container Apps:
```bash
az containerapp update \
  --name aimcs-backend-eastus2 \
  --resource-group aimcs-rg-eastus2 \
  --image aimcsregistry.azurecr.io/aimcs-backend:latest
```

3. Configure environment variables:
```bash
az containerapp update \
  --name aimcs-backend-eastus2 \
  --resource-group aimcs-rg-eastus2 \
  --set-env-vars \
    AZURE_OPENAI_ENDPOINT=https://aimcs-foundry.cognitiveservices.azure.com/ \
    AZURE_OPENAI_API_KEY=your-key \
    AZURE_OPENAI_DEPLOYMENT=o4-mini \
    AZURE_OPENAI_TTS_DEPLOYMENT=gpt-4o-mini-tts \
    PERPLEXITY_API_KEY=your-perplexity-key
```

## 🔗 API Endpoints

| Endpoint        | Method | Description                                                                 |
|-----------------|--------|-----------------------------------------------------------------------------|
| `/api/chat`     | POST   | Main chat endpoint with AI responses, text-to-speech, and web search       |
| `/api/web-search` | POST | Direct web search endpoint via Perplexity API                              |
| `/api/chat`     | OPTIONS| CORS preflight request                                                      |

### Request Format
```json
{
  "message": "Your message here",
  "useWebSearch": "auto" // "auto", "web", or "none"
}
```

### Response Format
```json
{
  "id": "message-id",
  "sender": "Zimax AI",
  "message": "AI response text",
  "timestamp": "2025-07-03T20:42:38.636Z",
  "aiUsed": true,
  "searchUsed": true,
  "originalMessage": "Original user message",
  "audioData": "base64-encoded-audio-data",
  "audioFormat": "audio/mp3"
}
```

### Web Search Response Format
```json
{
  "searchUsed": true,
  "message": "Web search response with citations",
  "sources": ["source1", "source2"]
}
```

## 🏗️ Architecture

### Frontend
- Single-page React application
- Real-time communication with backend API
- Audio playback and management
- Responsive design with modern CSS

### Backend
- Express.js REST API
- Azure OpenAI integration for AI responses
- Perplexity API integration for web search
- Docker containerization
- Azure Container Apps deployment

### Data Flow
1. User sends message via frontend
2. Backend processes message with Azure OpenAI
3. Optional web search via Perplexity API (sonar model)
4. Text-to-speech generation via Azure OpenAI TTS
5. Response returned with text and audio data
6. Frontend displays text and plays audio

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [x] Web search integration via Perplexity API
- [x] Real-time source citations
- [ ] Voice input (speech-to-text)
- [ ] File upload capabilities
- [ ] Rich message formatting
- [ ] User authentication
- [ ] Conversation history
- [ ] Custom themes
- [ ] More language support
- [ ] Advanced audio controls
- [ ] Offline support
- [ ] Progressive Web App features
- [ ] Multi-modal input (images, documents)
- [ ] Conversation export
- [ ] API rate limiting and monitoring

---

**Powered by Zimax AI Labs**

### 🔧 Technical Stack
- **Frontend**: React 18 + Vite + Custom CSS
- **Backend**: Node.js + Express
- **Hosting**: Azure Static Web Apps (Frontend) + Azure Container Apps (Backend)
- **AI Services**: Azure OpenAI (o4-mini, gpt-4o-mini-tts) + Perplexity API (sonar)
- **Domains**: Custom domains with SSL certificates

## 🎯 Features

### Text Chat
- Real-time AI conversations using o4-mini model
- Context-aware responses
- Automatic text-to-speech for AI responses (via gpt-4o-mini-tts)

### Web Search
- Real-time web search via Perplexity API (sonar model)
- Source citations in responses
- Automatic detection of topics requiring current information
- Manual search control options

### User Experience
- Dark theme interface
- Responsive design
- Real-time status indicators
- Audio playback for AI responses

## 🔗 API Endpoints

| Endpoint        | Method | Description                                                                 |
|-----------------|--------|-----------------------------------------------------------------------------|
| `/api/chat`     | POST   | Text chat with AI and optional web search                                   |
| `/api/web-search` | POST | Direct web search via Perplexity API                                       |

## 🌍 Deployment URLs

| Service  | URL                   | Status   |
|----------|-----------------------|----------|
| Frontend | https://aimcs.net     | ✅ Live   |
| Backend  | https://api.aimcs.net | ✅ Live   |

## 🔧 API Configuration

- **o4-mini**: Uses `max_completion_tokens: 1000`, API version `2025-01-01-preview`
- **gpt-4o-mini-tts**: Uses `voice: "alloy"`, `response_format: "mp3"`, API version `2025-03-01-preview`
- **Perplexity sonar**: Uses `max_tokens: 1000` for web search responses

## 🏢 Enterprise Development Roadmap

**Phase 1: Foundation (Week 1)**

- [ ] Multi-tenant database design (Cosmos DB)
- [ ] Azure AD B2C authentication planning
- [ ] Staging/production environment separation
- [ ] API expansion plan for enterprise features
- [ ] Security/RBAC/audit logging assessment
- [ ] Azure resource planning (Cosmos DB, AD B2C, etc.)
- [ ] Technical specification documentation
- [ ] `enterprise-foundation` development branch

**Principle:** Build on the current MVP foundation. All new enterprise features are additive and backward compatible.
