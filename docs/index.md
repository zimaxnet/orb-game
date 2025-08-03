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
- [🔍 Learn More Functionality](./gameplay/learn-more-functionality.md)
- [Audio & Accessibility](./gameplay/audio-accessibility.md)
- [🖼️ Image Display System](./gameplay/image-display-system.md)

### 🏗️ [Developer Documentation](./developer/)
- [Architecture Overview](./developer/architecture.md)
- [API Reference](./developer/api-reference.md)
- [🔧 API Endpoint Cleanup](./developer/api-cleanup.md)
- [Deployment Guide](./developer/deployment.md)
- [Contributing Guidelines](./developer/contributing.md)

### 🤖 [AI Integration](./ai-integration/)
- [AI Models Overview](./ai-integration/models.md)
- [Prompt Management](./ai-integration/prompts.md)
- [Story Generation](./ai-integration/story-generation.md)
- [TTS Integration](./ai-integration/tts.md)
- [🔍 Image Search System](./ai-integration/image-search.md)

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
- ✅ **API Endpoints**: 20 optimized endpoints (23% reduction from 26)
- ✅ **Learn More Functionality**: 93.3% success rate with comprehensive testing
- ✅ **Full Width Story Area**: Enhanced UX with better content display
- ✅ **Image System**: 201 images covering historical figures (Google Custom Search API)
- ✅ **Image Display**: Clean image display when available, clean text when no images
- ✅ **Google CSE Migration**: Complete migration from deprecated Bing Image Search

## 🖼️ Latest Features (December 2024)

### **🔧 API Endpoint Cleanup & Optimization**
- **23% Reduction**: Removed 6 redundant/unused endpoints for cleaner API structure
- **Consolidated Endpoints**: Merged `/api` into root endpoint with comprehensive endpoint list
- **Improved Maintainability**: Cleaner codebase with single source of truth for each function
- **Enhanced Testing**: Updated test scripts to reflect optimized endpoint structure
- **Frontend Compatibility**: Fixed all frontend endpoint usage for 100% compatibility
- **Performance Benefits**: Faster startup, reduced maintenance overhead, clearer API structure

### **🔍 Learn More Button Verification**
- **93.3% Success Rate**: 14/15 tests passed with full functionality verification
- **API Integration**: Confirmed `/api/chat` endpoint working correctly for detailed content generation
- **User Experience**: Smooth loading states, proper error handling, and responsive design
- **Bilingual Support**: Full English and Spanish support with proper content localization
- **Content Quality**: 500-600 word detailed historical figure biographies with web search integration
- **Story Replacement**: Seamless replacement of current stories with enhanced content

### **📱 Full Width Story Area**
- **Full Width Utilization**: Story panel now uses 90% of viewport width (up to 1200px)
- **Improved Layout**: Better spacing, typography, and content organization
- **Enhanced Images**: Larger image display (250px height) with better gallery layout
- **Mobile Optimization**: Responsive design with 95vw width on mobile devices
- **Better Readability**: Increased padding and improved text layout for better reading experience

## 🖼️ Previous Features (January 2025)

### **🔍 Google Custom Search API Migration**
- **Complete Migration**: Successfully migrated from Bing Image Search (deprecated August 2025) to Google Custom Search API
- **Comprehensive Setup**: Configured Google CSE with 409 curated sites for optimal historical figure image search
- **API Integration**: Working Google Custom Search API with proper authentication and rate limiting
- **Image Inventory**: 201 total images covering historical figures across all categories and epochs
- **Download System**: Automated image download system with proper User-Agent headers for Wikimedia compliance
- **Fallback System**: Guaranteed image coverage with placeholder images when API limits are reached
- **Rate Limit Management**: 100 free queries/day with intelligent fallback when limits are hit
- **Multiple Image Types**: Portraits, achievements, inventions, and artifacts for each historical figure
- **Quality Control**: Licensing compliance, historical accuracy, and visual quality verification
- **Success Metrics**: 26.5% download success rate with 127 new images added to collection

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