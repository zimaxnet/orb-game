# AIMCS - AI Multimodal Customer System

A modern AI-powered chat interface with web search capabilities, built with React/Vite frontend and Node.js backend, deployed on Azure.

## 🚀 Features

- **AI Chat Interface**: Powered by Azure OpenAI GPT-4o-mini
- **Dual Response Mode**: Text responses with optional audio playback
- **Web Search Integration**: Automatic web search for current information
- **Text-to-Speech**: Audio responses using Azure OpenAI TTS
- **Multilingual Support**: English and Spanish interface
- **Real-time Updates**: Live chat with streaming responses
- **Modern UI**: Responsive design with beautiful gradients
- **Azure Deployment**: Frontend on Static Web Apps, Backend on Container Apps

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

## 🔧 Configuration

### Frontend Configuration

- **Backend URL**: Configured in `components/ChatInterface.jsx`
- **Custom Domain**: `aimcs.net` (configured in Azure)
- **API Endpoint**: `api.aimcs.net`

### Backend Configuration

- **Port**: 3000 (configurable via PORT env var)
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: Built-in request limiting
- **Health Check**: Available at `/health`

## 📱 Features

### Chat Interface
- Real-time messaging with AI
- **Text and Audio Responses**: Users can read text and optionally play audio
- Message history persistence
- Auto-scroll to latest messages
- Loading states and error handling
- Audio playback state management

### Web Search
- Automatic detection of search needs
- Integration with Perplexity API
- Source attribution
- Search mode toggle (Auto/Web/Local)

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

## 🔒 Security

- Environment variable protection
- CORS configuration
- Input validation
- Rate limiting
- Secure API key handling

## 📊 Monitoring

- Health check endpoints
- Request logging
- Error tracking
- Performance monitoring

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
- **Enhanced Audio/Text Response**: Users can now see text responses with optional audio playback
- **Improved Audio Controls**: Better visual design and user experience for audio controls
- **Audio Availability Indicators**: Clear visual indicators when audio is available
- **Fixed Response Mapping**: Corrected backend response data mapping for better reliability

### Deployment Updates
- **Frontend**: Automatically deployed on push to `main`
- **Backend**: Manual deployment via Azure Container Apps
- **Dependencies**: Regular security updates via npm audit

---

**Live Demo**: [https://aimcs.net](https://aimcs.net)  
**API Documentation**: [https://api.aimcs.net](https://api.aimcs.net)
# Deployment trigger - Sat Jul  5 08:35:37 MST 2025
