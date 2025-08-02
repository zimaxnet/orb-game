# 🎮 Orb Game Documentation

Welcome to the official documentation for **Orb Game** - an advanced AI-powered interactive gaming platform that focuses exclusively on discovering the most influential historical figures across different categories and epochs.

## 📚 Documentation Structure

### 🎯 [Getting Started](./getting-started/)
- [Introduction to Orb Game](./getting-started/introduction.md)
- [Quick Start Guide](./getting-started/quick-start.md)
- [Installation & Setup](./getting-started/installation.md)

### 🎮 [Gameplay Guide](./gameplay/)
- [How to Play](./gameplay/how-to-play.md)
- [Categories & Epochs](./gameplay/categories-epochs.md)
- [Historical Figures](./gameplay/historical-figures.md)
- [Audio & Accessibility](./gameplay/audio-accessibility.md)
- [🖼️ Image Display System](./gameplay/image-display-system.md)

### 🏗️ [Developer Documentation](./developer/)
- [Architecture Overview](./developer/architecture.md)
- [API Reference](./developer/api-reference.md)
- [Deployment Guide](./developer/deployment.md)
- [Contributing Guidelines](./developer/contributing.md)

### 🤖 [AI Integration](./ai-integration/)
- [AI Models Overview](./ai-integration/models.md)
- [Prompt Management](./ai-integration/prompts.md)
- [Story Generation](./ai-integration/story-generation.md)
- [TTS Integration](./ai-integration/tts.md)

### 🗄️ [Database & Caching](./database/)
- [MongoDB Integration](./database/mongodb.md)
- [Cache System](./database/cache-system.md)
- [Story Prepopulation](./database/story-prepopulation.md)

### 🚀 [Deployment & DevOps](./deployment/)
- [Azure Resources](./deployment/azure-resources.md)
- [GitHub Actions](./deployment/github-actions.md)
- [Monitoring & Logs](./deployment/monitoring.md)

### 📊 [Performance & Optimization](./performance/)
- [Performance Metrics](./performance/metrics.md)
- [Caching Strategy](./performance/caching.md)
- [Cost Optimization](./performance/cost-optimization.md)

## 🚀 Quick Links

- **Live Game**: [https://orbgame.us](https://orbgame.us)
- **API Endpoint**: [https://api.orbgame.us](https://api.orbgame.us)
- **GitHub Repository**: [https://github.com/zimaxnet/orb-game](https://github.com/zimaxnet/orb-game)
- **Azure Portal**: [https://portal.azure.com](https://portal.azure.com)

## 🔧 Technology Stack

### Frontend
- **React 19.x** with Vite build system
- **Three.js** for 3D graphics and animations
- **@react-three/fiber** and **@react-three/drei** for React 3D integration
- **CSS Modules** for component-specific styling

### Backend
- **Node.js** with Express server
- **Azure OpenAI** integration (o4-mini model)
- **Azure Cosmos DB** for MongoDB
- **Azure Key Vault** for secure credential management

### Deployment
- **Azure Web App** for frontend hosting
- **Azure Container Apps** for backend services
- **Azure Container Registry** for Docker images
- **GitHub Actions** for CI/CD automation

## 📈 Current Status

- ✅ **Frontend**: Live at https://orbgame.us
- ✅ **Backend**: Live at https://api.orbgame.us
- ✅ **Database**: 240+ historical figure stories pre-populated
- ✅ **AI Integration**: o4-mini model with TTS support
- ✅ **Deployment**: Automated CI/CD pipeline
- ✅ **Image System**: 120 figures with 1,083 high-quality images (100% success rate)
- ✅ **Image Display**: Clean image display when available, clean text when no images

## 🖼️ Latest Features (January 2025)

### **Image Display System**
- **Clean Image Display**: Images are displayed when available, clean text when no images
- **No Placeholder Elements**: When no images are available, shows story text directly without clutter
- **Proper Fallback Logic**: Handles both array format (new) and object format (old) image structures
- **Error Handling**: Graceful fallback to text display if images fail to load
- **Responsive Design**: Images scale properly on all device sizes
- **Loading States**: Clear indicators for image loading and error states
- **Source Attribution**: Display of image sources, licensing, and permalinks
- **Gallery Navigation**: Smooth transitions between multiple images per historical figure
- **Asynchronous Loading**: Images populate in background while stories load instantly

### **Enhanced Story Panel**
- **Clear Content Hierarchy**: Historical figure name → Key achievements → Images → Full story
- **🏆 Key Achievements Section**: Prominent display with blue gradient background and trophy icon
- **🖼️ Enhanced Image Integration**: Images displayed between achievements and story with proper navigation
- **📖 Full Story Section**: Expandable detailed narrative with "Read Full Story" button
- **Visual Design**: Professional appearance with color-coded sections and icons
- **Typography Hierarchy**: Clear size and weight differences for better readability
- **Responsive Layout**: Optimized for mobile and desktop with proper spacing
- **Educational Flow**: Logical learning progression from recognition to deep understanding

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./developer/contributing.md) for details on how to:

- Report bugs and issues
- Submit feature requests
- Contribute code improvements
- Update documentation

## 📞 Support

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/zimaxnet/orb-game/issues)
- **Documentation Issues**: [Report documentation problems](https://github.com/zimaxnet/orb-game/issues)
- **Email**: [contact@zimax.net](mailto:contact@zimax.net)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintained by**: Zimax AI Labs 