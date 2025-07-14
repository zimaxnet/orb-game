# AIMCS - AI Multimodal Customer System

A modern AI-powered chat interface with engaging personality, proactive engagement, and advanced memory capabilities. Built with React/Vite frontend and Node.js backend, deployed on Azure with MongoDB Atlas for intelligent memory storage.

## 🚀 Features

- **🤖 Engaging AI Personality**: Friendly, proactive, and fun conversations with emojis and humor
- **🎯 Proactive Engagement**: AIMCS greets users immediately and asks engaging follow-up questions
- **💬 Short & Sweet Responses**: Quick, conversational exchanges under 30 words for better back-and-forth
- **🧠 Advanced Memory System**: MongoDB Atlas-powered memory with user profiles, interests, and conversation history
- **📊 Interactive Analytics**: Real-time stats, fun facts, and usage insights
- **⚙️ Smart Settings**: Language preferences and user customization
- **🌐 Web Search Integration**: Automatic current information with concise summaries
- **🎵 Audio Responses**: Text-to-speech using Azure OpenAI TTS
- **🌍 Multilingual Support**: English and Spanish interface
- **📱 Modern UI**: Responsive design with beautiful animations and gradients
- **🎮 Interactive Flyout Panel**: Real-time clock, rotating fun facts, system status, and enhanced modals
- **☁️ Azure Deployment**: Frontend on Static Web Apps, Backend on Container Apps
- **🌐 Global CDN**: Azure Front Door Standard with 118+ edge locations worldwide

## 🎮 Quick Actions

### 📊 Analytics
- **Real-time Stats**: Total chats, web searches, most popular questions
- **Fun Facts**: Random interesting tidbits about AI and technology
- **Usage Insights**: Track engagement and conversation patterns
- **Trending Topics**: See what topics are most popular
- **System Health**: Monitor all services in real-time
- **Interactive Dashboard**: Beautiful, responsive analytics interface

### ⚙️ Settings
- **Language Toggle**: Switch between English and Spanish
- **Audio Preferences**: Control text-to-speech settings
- **User Customization**: Personalize your AIMCS experience

### 🧠 Memory
- **User Profiles**: AIMCS remembers your interests and preferences
- **Conversation History**: Track recent topics and interactions
- **Fun Facts**: Personalized insights about your chat patterns
- **Conversation Continuation**: Continue any previous conversation
- **Smart Search**: Search through your conversation history
- **Memory Export**: Download and share conversations
- **Interactive Memory Panel**: Browse, search, and continue conversations

### 🎮 Interactive Flyout Panel
- **🕐 Real-time Clock**: Live time display that updates every second
- **💡 Rotating Fun Facts**: Interesting facts about AIMCS that rotate every 5 seconds
- **🔧 System Status**: Live indicators for Backend, Memory, and TTS status
- **📊 Enhanced Analytics**: Beautiful grid layout with detailed statistics
- **⚙️ Settings Dashboard**: Clean layout showing current configuration
- **🧠 Memory Profile**: Detailed cards showing what AIMCS remembers

## 🧠 Enhanced Memory Features

### Conversation Continuation
- **💬 Continue Any Conversation**: Click on any memory to continue the conversation
- **➕ Add Context**: Add additional context when continuing conversations
- **📱 Smart Interface**: Beautiful modal for continuing conversations
- **🎯 Seamless Flow**: Conversations flow naturally from memory to chat

### Memory Browsing
- **📅 Time-based Organization**: Memories grouped by Today, This Week, This Month, Older
- **🔍 Smart Search**: Search through conversation history with instant results
- **📊 Usage Analytics**: See which conversations are most popular
- **🎨 Visual Indicators**: Different icons for web search vs local AI responses

### Memory Actions
- **📤 Export Memories**: Download individual conversations as JSON
- **📋 Share Memories**: Share conversations via clipboard or native share
- **🔥 Popular Badges**: Visual indicators for frequently accessed memories
- **🎯 Type Filtering**: Filter by web search or local AI responses

## 📊 Enhanced Analytics Dashboard

### Overview Statistics
- **💬 Total Conversations**: Track your chat count
- **🌐 Web Searches**: Monitor search usage
- **🧠 Memory Hit Rate**: See memory system effectiveness
- **⚡ Response Time**: Monitor system performance

### Trending Topics
- **🔥 Popular Topics**: See what you talk about most
- **📈 Usage Counts**: Track topic popularity over time
- **🎯 Topic Ranking**: Ranked list of most discussed subjects

### Fun Insights
- **🎯 Most Popular Question**: Your most asked question
- **🔍 Search Usage**: Percentage of conversations using web search
- **🎵 Audio Generation**: TTS usage statistics
- **🧠 Memory Accuracy**: Memory system performance metrics

### System Health
- **🔧 Real-time Status**: Live monitoring of all services
- **✅ Service Indicators**: Visual status for each component
- **📊 Performance Metrics**: Response times and reliability stats

## 📁 Project Structure

```
aimcs-deploy/
├── components/                  # React components
│   ├── ChatInterface.jsx       # Main chat interface
│   ├── ControlPanel.jsx        # Quick actions panel
│   ├── MemoryPanel.jsx         # Enhanced memory display
│   └── *.css                   # Component styles
├── backend/                    # Node.js backend
│   ├── backend-server.js       # Express server with enhanced prompts
│   ├── advanced-memory-service.js # MongoDB Atlas memory system
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
- MongoDB Atlas cluster (for advanced memory features)

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
   # Edit .env with your Azure OpenAI and MongoDB Atlas credentials
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
AZURE_OPENAI_API_VERSION=2024-12-01-preview
PERPLEXITY_API_KEY=your-perplexity-key
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
PORT=3000
```

## 🧠 Advanced Memory System

### MongoDB Atlas Integration

AIMCS uses MongoDB Atlas for intelligent memory storage:

- **User Profiles**: Stores interests, preferences, and conversation patterns
- **Memory Extraction**: Azure OpenAI analyzes conversations to extract key insights
- **Persona Support**: Builds engaging user personas for more personalized interactions
- **Privacy Safe**: PII removal and data sanitization

### Memory Features

- **Profile Updates**: Automatically learns user preferences and interests
- **Conversation History**: Tracks recent topics and interaction patterns
- **Fun Facts**: Generates personalized insights about user behavior
- **Engagement Metrics**: Monitors what users find most interesting
- **Conversation Continuation**: Continue any previous conversation seamlessly
- **Smart Search**: Search through conversation history with instant results
- **Memory Export**: Download and share individual conversations

## 🎯 Enhanced AI Personality

### Proactive Engagement
- **Immediate Greeting**: AIMCS welcomes users as soon as they arrive
- **Follow-up Questions**: Always ends responses with engaging questions
- **Emoji Usage**: Natural emoji integration for warmth and personality
- **Humor**: Playful responses and dad jokes when appropriate

### Response Optimization
- **Short & Sweet**: Responses under 30 words for quick back-and-forth
- **Conversational**: Natural, friendly tone with personality
- **Context Aware**: Remembers previous conversations and builds on them
- **Web Search Smart**: Concise summaries even with extensive information

## 🔧 Azure OpenAI Configuration

### API Version Requirements

**Important**: Different Azure OpenAI models require specific API versions:

- **o4-mini (Chat Completions)**: Requires `2024-12-01-preview` or later
- **gpt-4o-mini-tts (Text-to-Speech)**: Requires `2025-03-01-preview` or later

### Enhanced System Prompts

AIMCS uses carefully crafted system prompts for engaging interactions:

```javascript
// Example system prompt for engaging personality
const systemPrompt = `You are AIMCS (AI Multimodal Customer System), a friendly, engaging, and proactive AI assistant with personality!

Your characteristics:
- You're enthusiastic, warm, and genuinely excited to help
- You have a playful sense of humor and love to make connections
- You're curious about users and ask engaging follow-up questions
- You use emojis naturally to express emotion and make responses more engaging
- You have a "can-do" attitude and are always looking for ways to be helpful
- You remember context and build on previous conversations
- You're knowledgeable but explain things in an accessible, friendly way

CRITICAL: Keep responses VERY SHORT - 1-2 sentences maximum (under 30 words). Be conversational, fun, and engaging. Avoid long lists unless specifically asked. Always try to end with a quick question or offer to help with something else!`;
```

## 📊 Analytics & Memory Endpoints

AIMCS provides comprehensive analytics and memory information for all users:

### Analytics Endpoints
- **`/api/analytics/summary`**: Returns total chats, total web searches, most popular question/word, top words, average words per message, search usage percentage, fun fact, uptime, and last updated.
- **`/api/analytics/detailed`**: Returns a full breakdown of usage, trends, system status, fun facts, and more.

### Memory Endpoints
- **`/api/memory/profile`**: Returns user profile info including name, favorite color, interests, fun fact, last topics, conversation style, preferred topics, total interactions, average response time, memory usage, personality traits, and recent questions.
- **`/api/memory/stats`**: Returns total memories, total usage, storage used, average memory size, memory retrieval rate, most accessed memories, memory accuracy, last update, and system status.
- **`/api/memory/search`**: Search through conversation history with query-based matching.
- **`/api/memory/export`**: Export all memories for backup or analysis.

**Anyone using AIMCS can view this information via the API or the flyout panel!**

## 🚀 Deployment

### Frontend (Azure Static Web Apps)

The frontend is automatically deployed via Azure Static Web Apps when you push to the `main` branch. No manual deployment required!

**Live URL**: https://aimcs.net

### Backend (Azure Container Apps)

1. **Build and push Docker image:**
   ```bash
   cd backend
   docker buildx build --platform linux/amd64 -f backend-Dockerfile -t aimcs-backend:latest . --load
   docker tag aimcs-backend:latest aimcsregistry.azurecr.io/aimcs-backend:latest
   docker push aimcsregistry.azurecr.io/aimcs-backend:latest
   ```

2. **Deploy to Azure Container Apps:**
   ```bash
   az containerapp update \
     --name aimcs-backend-eastus2 \
     --resource-group aimcs-rg-eastus2 \
     --image aimcsregistry.azurecr.io/aimcs-backend:latest
   ```

### MongoDB Atlas Setup

1. **Create MongoDB Atlas cluster** (if not already done)
2. **Add connection string** to environment variables
3. **Deploy backend** with memory service enabled

## 🎮 Quick Actions Guide

### Using the Interactive Flyout Panel
- **Click the ☰ menu button** in the top-right corner of the chat interface
- **Explore real-time features**: Watch the live clock, read rotating fun facts, check system status
- **Access all controls**: Analytics, Settings, Memory, and Language toggle

### Using Analytics
- Click the **📊 Analytics** button in the flyout panel
- View real-time chat statistics and fun facts
- Track your conversation patterns and engagement
- Explore trending topics and system health

### Using Settings
- Click the **⚙️ Settings** button in the flyout panel
- Toggle between English and Spanish
- View current system configuration

### Using Memory
- Click the **🧠 Memory** button in the flyout panel
- See what AIMCS remembers about you
- View your profile, interests, and conversation history
- **Continue conversations**: Click 💬 on any memory to continue
- **Add context**: Click ➕ to add context when continuing conversations
- **Search memories**: Use the search bar to find specific conversations
- **Export memories**: Download conversations as JSON files

## 🔄 Recent Updates

### v2.2 - Enhanced Memory & Analytics
- ✅ **Conversation Continuation**: Continue any previous conversation seamlessly
- ✅ **Interactive Memory Panel**: Browse, search, and continue conversations
- ✅ **Enhanced Analytics Dashboard**: Beautiful, detailed analytics with trending topics
- ✅ **Memory Export/Share**: Download and share individual conversations
- ✅ **Smart Search**: Search through conversation history with instant results
- ✅ **Visual Improvements**: Better UI/UX with hover effects and animations
- ✅ **Real-time Stats**: Live analytics with system health monitoring

### v2.1 - Enhanced Flyout Panel & Deployment Fixes
- ✅ **Interactive Flyout Panel**: Real-time clock, rotating fun facts, system status indicators
- ✅ **Enhanced Modals**: Beautiful analytics grid, settings dashboard, memory profile cards
- ✅ **Fixed Deployment**: Removed duplicate deployment workflows, streamlined CI/CD
- ✅ **Improved UX**: Smooth animations, hover effects, and modern styling
- ✅ **Real-time Features**: Live clock updates, rotating fun facts every 5 seconds

### v2.0 - Enhanced Personality & Memory
- ✅ **Proactive Engagement**: AIMCS greets users immediately
- ✅ **Short & Sweet Responses**: Under 30 words for better conversation flow
- ✅ **Functional Quick Actions**: Analytics, Settings, and Memory panels
- ✅ **MongoDB Atlas Integration**: Advanced memory system with user profiles
- ✅ **Enhanced UI**: Better animations and visual feedback
- ✅ **Web Search Optimization**: Concise summaries even with extensive information

### v1.0 - Core Features
- ✅ **AI Chat Interface**: Azure OpenAI o4-mini integration
- ✅ **Web Search**: Automatic current information lookup
- ✅ **Audio Responses**: Text-to-speech with Azure OpenAI TTS
- ✅ **Multilingual Support**: English and Spanish
- ✅ **Azure Deployment**: Static Web Apps + Container Apps
- ✅ **Global CDN**: Azure Front Door with worldwide edge locations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**AIMCS** - Making AI conversations engaging, fun, and memorable! 🚀

## 🛠️ Recent Backend Fixes: OpenAI TTS & MongoDB Atlas SSL

### Azure OpenAI TTS (Text-to-Speech)
- Integrated Azure OpenAI TTS endpoint for audio responses.
- Uses deployment (e.g., `gpt-4o-mini-tts`) and API version `2025-03-01-preview`.
- Requires these environment variables:
  - `AZURE_OPENAI_TTS_DEPLOYMENT` (e.g., `gpt-4o-mini-tts`)
  - `AZURE_OPENAI_ENDPOINT` (e.g., `https://aimcs-foundry.cognitiveservices.azure.com/`)
  - `AZURE_OPENAI_API_KEY`
- Backend returns base64-encoded audio in `audioData` field.

### MongoDB Atlas SSL/TLS Connection
- Explicitly sets `tls: true` and `tlsAllowInvalidCertificates: false` in MongoClient options for robust Atlas SSL support.
- No longer uses deprecated `ssl`/`sslValidate` options.
- If running in Docker/Azure, ensure the container trusts the Atlas CA (see `atlas-ca.pem`).
- Dockerfile updated to copy `atlas-ca.pem` if needed.
- Troubleshooting: If you see SSL/TLS errors, verify your connection string, driver version, and CA trust settings.

### Example MongoClient Initialization
```js
this.client = new MongoClient(this.mongoUri, {
  tls: true,
  tlsAllowInvalidCertificates: false,
});
```

### Example TTS API Call
```js
const ttsResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
  body: JSON.stringify({
    model: process.env.AZURE_OPENAI_TTS_DEPLOYMENT,
    input: aiResponse,
    voice: 'alloy',
    response_format: 'mp3',
    speed: 1.0
  })
});
```
