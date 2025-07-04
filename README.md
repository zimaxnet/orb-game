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

## 🚀 Reliable Deployment Solutions

To ensure your code always gets deployed successfully without deleting and recreating resources, we've implemented multiple deployment strategies:

### **🔄 Automated CI/CD Pipelines**

#### **1. Full System Deployment** (Recommended)
```bash
# Triggers on push to main branch
# Deploys both frontend and backend with full testing
```
- **File**: `.github/workflows/deploy-full.yml`
- **Triggers**: Push to `main` branch
- **Features**: 
  - Orchestrated deployment (backend first, then frontend)
  - Health checks and verification
  - System integration testing
  - Automatic rollback on failure
  - Performance testing

#### **2. Individual Service Deployment**
- **Frontend**: `.github/workflows/deploy-frontend.yml`
- **Backend**: `.github/workflows/deploy-backend.yml`
- **Triggers**: Changes to specific paths only

### **🛠️ Manual Deployment Script**

For local deployments and troubleshooting:

```bash
# Deploy everything
./scripts/deploy-manual.sh

# Deploy only backend
./scripts/deploy-manual.sh --backend-only

# Deploy only frontend  
./scripts/deploy-manual.sh --frontend-only

# Verify current deployment
./scripts/deploy-manual.sh --verify-only
```

### **📋 Required GitHub Secrets**

Set these in your GitHub repository settings:

| Secret | Description | Required |
|--------|-------------|----------|
| `AZURE_CREDENTIALS` | Azure service principal credentials | ✅ |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Static Web Apps deployment token | ✅ |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | ✅ |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | ✅ |
| `AZURE_OPENAI_DEPLOYMENT` | Azure OpenAI deployment name | ✅ |
| `AZURE_OPENAI_TTS_DEPLOYMENT` | Azure OpenAI TTS deployment | ✅ |
| `PERPLEXITY_API_KEY` | Perplexity API key | ✅ |

### **🔧 Deployment Best Practices**

#### **For Backend (Container Apps)**
1. **Always use AMD64 platform**: `--platform linux/amd64`
2. **Tag with commit SHA**: Ensures version tracking
3. **Health checks**: Wait for `/health` endpoint
4. **Rollback capability**: Keep previous revision active
5. **Environment variables**: Always set all required vars

#### **For Frontend (Static Web Apps)**
1. **Build verification**: Check `src/dist/index.html` exists
2. **Skip build in deployment**: Use pre-built files
3. **Cache dependencies**: Use npm cache for faster builds
4. **Path-based triggers**: Only deploy when frontend files change

### **🚨 Troubleshooting Deployment Issues**

### **⚠️ CRITICAL: Azure App Service Deployment Challenges**

**IMPORTANT**: Azure App Service has a known issue where deployments appear successful but the site continues to serve the default "Welcome" page instead of your content. This is a common problem that requires manual intervention.

#### **Symptoms of Azure App Service Cache Issues**
- ✅ Deployment shows "successful" with no errors
- ✅ Files are uploaded correctly (verified in Kudu)
- ❌ Site still shows Azure default "Welcome" page
- ❌ New content doesn't appear even after multiple deployments

#### **Solutions for Azure App Service Cache Issues**

**Solution 1: Manual Kudu Console Cleanup (Recommended)**
```bash
# 1. Open Kudu Console
# Go to: https://aimcs.scm.azurewebsites.net/DebugConsole

# 2. Navigate to site/wwwroot
# 3. Delete ALL files (including Azure default files)
# 4. Upload your files manually or redeploy
```

**Solution 2: Force Restart with Cache Clear**
```bash
# Stop the app completely
az webapp stop --name aimcs --resource-group aimcs-rg

# Wait 30 seconds
sleep 30

# Start the app fresh
az webapp start --name aimcs --resource-group aimcs-rg

# Wait for startup and test
sleep 60
curl https://aimcs.net
```

**Solution 3: Delete and Recreate Web App (Nuclear Option)**
```bash
# Delete the Web App completely
az webapp delete --name aimcs --resource-group aimcs-rg --yes

# Recreate with same configuration
az webapp create --resource-group aimcs-rg --plan aimcs-plan --name aimcs --runtime "NODE|20-lts"

# Reconfigure custom domain
az webapp config hostname add --webapp-name aimcs --resource-group aimcs-rg --hostname aimcs.net

# Redeploy your content
az webapp deploy --resource-group aimcs-rg --name aimcs --src-path dist.zip --type zip
```

**Solution 4: Use Different Deployment Method**
```bash
# Try the deprecated but sometimes more reliable method
az webapp deployment source config-zip --resource-group aimcs-rg --name aimcs --src dist.zip

# Or use async deployment
az webapp deploy --resource-group aimcs-rg --name aimcs --src-path dist.zip --type zip --async
```

#### **Prevention Strategies**

**1. Always Verify Deployment**
```bash
# Check what's actually being served
curl -s https://aimcs.net | head -10

# Look for your content, not Azure default page
# Should show: <title>AIMCS</title> not <title>Microsoft Azure App Service - Welcome</title>
```

**2. Use Deployment Verification**
```bash
# Add to your deployment scripts
curl -s https://aimcs.net | grep -q "AIMCS" && echo "✅ Deployment successful" || echo "❌ Still showing Azure default page"
```

**3. Consider Alternative Hosting**
- **Azure Static Web Apps**: More reliable for frontend deployments
- **Azure Container Apps**: Better for backend deployments
- **Azure CDN**: Can help with caching issues

#### **Common Problems & Solutions**

**Problem**: New code not appearing after deployment
```bash
# Solution 1: Force container app restart
az containerapp restart --name aimcs-backend-eastus2 --resource-group aimcs-rg-eastus2

# Solution 2: Check container app logs
az containerapp logs show --name aimcs-backend-eastus2 --resource-group aimcs-rg-eastus2

# Solution 3: Verify image was pushed
az acr repository show-tags --name aimcsregistry --repository aimcs-backend
```

**Problem**: Frontend not updating (Azure App Service)
```bash
# Solution 1: Manual Kudu cleanup (see above)
# Solution 2: Force restart with cache clear
az webapp stop --name aimcs --resource-group aimcs-rg && sleep 30 && az webapp start --name aimcs --resource-group aimcs-rg

# Solution 3: Check deployment status
az webapp deployment list --name aimcs --resource-group aimcs-rg

# Solution 4: Delete and recreate (last resort)
az webapp delete --name aimcs --resource-group aimcs-rg --yes
# Then recreate and redeploy
```

**Problem**: Environment variables not updated
```bash
# Solution: Update container app environment
az containerapp update \
  --name aimcs-backend-eastus2 \
  --resource-group aimcs-rg-eastus2 \
  --set-env-vars \
    AZURE_OPENAI_ENDPOINT="your-endpoint" \
    AZURE_OPENAI_API_KEY="your-key"
```

#### **Verification Commands**

```bash
# Check backend health
curl https://api.aimcs.net/health

# Test API functionality
curl -X POST https://api.aimcs.net/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Check frontend
curl https://aimcs.net

# Check container app status
az containerapp show --name aimcs-backend-eastus2 --resource-group aimcs-rg-eastus2

# Check Static Web App status
az staticwebapp show --name aimcs-frontend --resource-group aimcs-rg
```

### **📊 Deployment Monitoring**

#### **Azure Monitor Integration**
- Set up alerts for container app health
- Monitor response times and error rates
- Track deployment success/failure rates

#### **GitHub Actions Monitoring**
- Check workflow run history
- Monitor deployment times
- Set up notifications for failures

### **🔄 Rollback Strategy**

#### **Automatic Rollback**
- CI/CD pipelines include automatic rollback on failure
- Previous container app revision remains active
- Health checks prevent bad deployments

#### **Manual Rollback**
```bash
# List container app revisions
az containerapp revision list --name aimcs-backend-eastus2 --resource-group aimcs-rg-eastus2

# Activate previous revision
az containerapp revision activate --name <revision-name> --app aimcs-backend-eastus2 --resource-group aimcs-rg-eastus2
```

### **⚡ Performance Optimization**

#### **Build Optimization**
- Use Docker layer caching
- Cache npm dependencies
- Parallel build steps where possible

#### **Deployment Optimization**
- Use path-based triggers to avoid unnecessary deployments
- Implement blue-green deployment for zero downtime
- Use staging environments for testing

---

## 🗂️ Monorepo Structure

This repository contains both frontend (React/Vite) and backend (Node/Express) code. The new structure uses workspaces for unified dependency management and build scripts.

```
/aimcs-deploy
  |-- backend-server.js         # Backend API server
  |-- backend-Dockerfile        # Dockerfile for backend
  |-- backend-package.json      # Backend dependencies (legacy)
  |-- src/                     # Frontend source (React/Vite)
      |-- package.json          # Frontend dependencies
      |-- index.html            # Vite entry point
      |-- App.jsx, ...          # React components
  |-- package.json             # Monorepo root, scripts for both apps
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v20 or higher)
- npm
- Docker (for backend deployment)
- Azure CLI (for cloud deployment)

## 🖥️ Local Development

### 1. Install All Dependencies
```bash
npm install
cd src && npm install
```

### 2. Start the Frontend (React/Vite)
```bash
cd src
npm run dev
# Open http://localhost:5173
```

### 3. Start the Backend (Express API)
```bash
npm run dev:backend
# or
node backend-server.js
```

## 🏗️ Building for Production

### Frontend
```bash
cd src
npm run build
# Output in src/dist/
```

### Backend (Docker, for Azure Container Apps)
```bash
docker buildx build --platform linux/amd64 -t aimcs-backend:latest -f backend-Dockerfile .
# To push to Azure Container Registry:
docker tag aimcs-backend:latest <youracr>.azurecr.io/aimcs-backend:latest
docker push <youracr>.azurecr.io/aimcs-backend:latest
```

## 🌐 Deployment

### Frontend
- Deploy the contents of `src/dist/` to your static web host (Azure Static Web Apps, Vercel, Netlify, etc).
- Ensure the backend API URL in `src/components/ChatInterface.jsx` points to your deployed backend.

### Backend
- Deploy the built Docker image to Azure Container Apps or Azure Web App for Containers.
- Set the following environment variables in your Azure deployment:
  - `AZURE_OPENAI_ENDPOINT`
  - `AZURE_OPENAI_API_KEY`
  - `AZURE_OPENAI_DEPLOYMENT`
  - `AZURE_OPENAI_TTS_DEPLOYMENT`
  - `PERPLEXITY_API_KEY`

## ⚙️ Environment Variables

See `env.example` for all required variables. Set these in your Azure portal or CI/CD pipeline secrets.

## 🛠️ Deployment Scripts

### Build and Deploy Frontend
```bash
cd src
npm run build
# Deploy src/dist/ to your static host
```

### Build and Deploy Backend
```bash
docker buildx build --platform linux/amd64 -t aimcs-backend:latest -f backend-Dockerfile .
docker tag aimcs-backend:latest <youracr>.azurecr.io/aimcs-backend:latest
docker push <youracr>.azurecr.io/aimcs-backend:latest
# Deploy to Azure Container Apps or Web App for Containers
```

## 🔍 Azure Resource Group Infrastructure Review

To check what is already deployed in your Azure resource groups (`aimcs-rg` and `aimcs-rg-eastus2`):

```bash
# List all resources in both resource groups
az resource list --resource-group aimcs-rg
az resource list --resource-group aimcs-rg-eastus2

# List container apps (backend)
az containerapp list --resource-group aimcs-rg-eastus2

# List static web apps (frontend)
az staticwebapp list --resource-group aimcs-rg

# List DNS zones (aimcs.net)
az network dns zone list --resource-group aimcs-rg

# List DNS records for aimcs.net
az network dns record-set list --resource-group aimcs-rg --zone-name aimcs.net

# List OpenAI resources
az cognitiveservices account list --resource-group aimcs-rg

# List all App Service resources
az webapp list --resource-group aimcs-rg

# List Container Registry (if used)
az acr list --resource-group aimcs-rg
az acr list --resource-group aimcs-rg-eastus2
```

You can also use the Azure Portal for a graphical overview.

## 🧑‍💻 Example: End-to-End Deployment

1. **Backend Deployment** (to `aimcs-rg-eastus2`):
   - Build and push backend Docker image to Azure Container Registry
   - Deploy to Azure Container Apps in `aimcs-rg-eastus2`
   - Configure environment variables for Azure OpenAI and Perplexity APIs

2. **Frontend Deployment** (to `aimcs-rg`):
   - Build frontend: `cd src && npm run build`
   - Deploy `src/dist/` to Azure Static Web Apps in `aimcs-rg`

3. **DNS Configuration** (in `aimcs-rg`):
   - Ensure `aimcs.net` points to the Static Web App
   - Ensure `api.aimcs.net` points to the Container App

4. **Testing**:
   - Test frontend at `https://aimcs.net`
   - Test backend API at `https://api.aimcs.net/health`
   - Verify full flow: chat, web search, TTS, analytics endpoints

## 📋 Troubleshooting
- If the frontend build fails, ensure `src/index.html` exists and references `main.jsx`.
- If the backend returns HTML instead of JSON, check that the correct API endpoints are implemented and the container is healthy.
- For CORS issues, ensure the backend allows requests from your frontend domain.
- For Azure OpenAI or Perplexity errors, verify all API keys and deployment names.

## 📦 Scripts Reference

- `npm run dev:frontend` — Start Vite dev server
- `npm run build:frontend` — Build frontend for production
- `npm run dev:backend` — Start backend with nodemon
- `npm run start:backend` — Start backend in production

## 🏢 Azure Resource Group Best Practices
- Group resources by application or environment
- Use tags for cost tracking and management
- Regularly review and clean up unused resources
- Use RBAC for access control

## 🌐 DNS Configuration (aimcs.net)

The `aimcs-rg` resource group contains the DNS zone for `aimcs.net` with the following configuration:

- **Frontend**: `aimcs.net` → Azure Static Web App
- **Backend API**: `api.aimcs.net` → Azure Container App
- **DNS Zone**: Managed in `aimcs-rg` resource group

To check DNS configuration:
```bash
# List DNS zone
az network dns zone show --resource-group aimcs-rg --name aimcs.net

# List all DNS records
az network dns record-set list --resource-group aimcs-rg --zone-name aimcs.net

# Check specific record types
az network dns record-set a list --resource-group aimcs-rg --zone-name aimcs.net
az network dns record-set cname list --resource-group aimcs-rg --zone-name aimcs.net
```

## 📞 Support
For help, open an issue or contact the AIMCS team.

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
- **AI-Powered Semantic Analysis** - Understands query meaning, not just keywords
- **Real-time web search** via Perplexity API (sonar model)
- **Source citations** in responses with clickable links
- **Intelligent search detection** using 8 categories of information needs
- **Confidence scoring** (0.0-1.0) for search decisions
- **Dynamic keyword learning** with trending topics
- **User feedback learning** to improve future decisions
- **Manual search control** via `useWebSearch` parameter
- **Performance analytics** and insights

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

## 🎯 Features

### Text Chat
- Real-time AI conversations using o4-mini model
- Context-aware responses with enhanced context from web search
- Automatic text-to-speech for AI responses (via gpt-4o-mini-tts)

### Intelligent Web Search
- **AI-Powered Analysis**: Semantic understanding of query meaning and context
- Real-time web search via Perplexity API (sonar model)
- Source citations in responses with clickable links
- **8-Category Detection**: Time-sensitive, dynamic data, breaking news, current trends, location-specific, recent changes, ongoing situations, fresh data
- **Confidence Scoring**: Nuanced decision-making with 0.0-1.0 confidence levels
- **Dynamic Learning**: Automatically learns trending topics and updates keywords
- **User Feedback**: Collects and learns from user satisfaction ratings
- **Performance Analytics**: Tracks search decision accuracy and user satisfaction
- Manual search control options (auto/always/never)

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

### ✅ **Completed**
- [x] Web search integration via Perplexity API
- [x] Real-time source citations
- [x] AI-powered semantic analysis for search decisions
- [x] Dynamic keyword learning with trending topics
- [x] User feedback collection and learning
- [x] Performance analytics and insights
- [x] Confidence scoring for search decisions

### 🚧 **In Progress**
- [ ] External API integrations (Twitter, Google Trends, News API)
- [ ] Context-aware learning (location, time, user preferences)
- [ ] Seasonal/event-based keyword generation

### 📋 **Planned**
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
- [ ] Machine learning model training on user feedback
- [ ] Personalized search decision logic
- [ ] Predictive analytics for search needs

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
- Context-aware responses with enhanced context from web search
- Automatic text-to-speech for AI responses (via gpt-4o-mini-tts)

### Intelligent Web Search
- **AI-Powered Analysis**: Semantic understanding of query meaning and context
- Real-time web search via Perplexity API (sonar model)
- Source citations in responses with clickable links
- **8-Category Detection**: Time-sensitive, dynamic data, breaking news, current trends, location-specific, recent changes, ongoing situations, fresh data
- **Confidence Scoring**: Nuanced decision-making with 0.0-1.0 confidence levels
- **Dynamic Learning**: Automatically learns trending topics and updates keywords
- **User Feedback**: Collects and learns from user satisfaction ratings
- **Performance Analytics**: Tracks search decision accuracy and user satisfaction
- Manual search control options (auto/always/never)

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
