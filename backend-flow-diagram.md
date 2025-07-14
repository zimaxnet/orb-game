# AIMCS Backend Flow Logic Diagram

## Complete System Architecture

```mermaid
flowchart TD
    A[User sends chat message] --> B[POST /api/chat]
    B --> C{Check required fields}
    C -->|Missing message| D[Return 400 Error]
    C -->|Missing API keys| E[Return 500 Error]
    C -->|Valid request| F[Extract message & useWebSearch setting]
    
    F --> G[Memory Service: Retrieve relevant memories]
    G --> H[Enhance user message with memory context]
    
    H --> I{Determine routing strategy}
    I -->|useWebSearch = 'always'| J[Route to Web Search]
    I -->|useWebSearch = 'never'| K[Route to Azure OpenAI only]
    I -->|useWebSearch = 'auto'| L[Check for web search keywords]
    
    L --> M{needsWebSearch function}
    M -->|Contains keywords| J
    M -->|No keywords found| K
    
    %% Web Search Keywords Check
    M --> N[Keywords: latest, recent, today, yesterday, this week, this month, current, news, update, breaking, live, now, weather, stock, price, market, sports, score, election, politics, covid, pandemic, vaccine, 2024, 2025, this year, last year]
    
    %% Web Search Path
    J --> O[Call Perplexity API with 'sonar' model]
    O --> P{Perplexity API success?}
    P -->|Yes| Q[Get web search results + sources]
    P -->|No| R[Fallback to Azure OpenAI only]
    
    Q --> S[Enhance user message with web search context]
    S --> T[Send to Azure OpenAI o4-mini with enhanced context]
    
    %% Direct Azure OpenAI Path
    K --> U[Send to Azure OpenAI o4-mini directly]
    R --> U
    
    %% Azure OpenAI Processing
    T --> V[Azure OpenAI o4-mini processes request]
    U --> V
    V --> W[Get AI response text]
    
    %% Memory Storage
    W --> X[Memory Service: Store conversation]
    X --> Y[Analytics Service: Track metrics]
    
    %% Text-to-Speech Processing
    Y --> Z[Send AI response to Azure OpenAI gpt-4o-mini-tts]
    Z --> AA{TTS success?}
    AA -->|Yes| BB[Convert to base64 audio data]
    AA -->|No| CC[Continue without audio]
    
    %% Response Assembly
    BB --> DD[Assemble final response]
    CC --> DD
    DD --> EE[Return JSON with: response, searchUsed, searchResults, audioData, timestamp, memoryContext]
    
    %% Response Structure
    EE --> FF[Frontend receives: text response + optional audio + search metadata + memory context]
```

## Memory Integration Flow

```mermaid
flowchart TD
    A[User Message] --> B[Memory Service]
    B --> C[Search for relevant memories]
    C --> D{Found memories?}
    D -->|Yes| E[Retrieve top 3-5 memories]
    D -->|No| F[Continue without memory context]
    
    E --> G[Format memory context]
    G --> H[Inject into AI prompt]
    F --> H
    
    H --> I[AI generates response]
    I --> J[Store new conversation]
    J --> K[Update memory profile]
    K --> L[Track analytics]
```

## Analytics Tracking System

```mermaid
flowchart TD
    A[Chat Request] --> B[Analytics Service]
    B --> C[Track request metrics]
    C --> D[Update counters]
    D --> E[Store conversation data]
    E --> F[Update trending topics]
    F --> G[Calculate response times]
    G --> H[Update memory hit rates]
    H --> I[Generate insights]
    I --> J[Store analytics data]
```

## Decision Logic Details

### 1. **Enhanced Routing Decision Matrix**

| User Setting | Keyword Detection | Memory Context | Final Route |
|--------------|------------------|----------------|-------------|
| `always` | Any | Available | Perplexity Web Search → Azure OpenAI (with memory) |
| `never` | Any | Available | Azure OpenAI Only (with memory) |
| `auto` | Contains keywords | Available | Perplexity Web Search → Azure OpenAI (with memory) |
| `auto` | No keywords | Available | Azure OpenAI Only (with memory) |

### 2. **Memory Integration**

**Memory Retrieval Process:**
- Search for relevant memories based on user message
- Retrieve top 3-5 most relevant memories
- Format memory context for AI prompt injection
- Store new conversation after AI response

**Memory Storage:**
- Store conversation with timestamp
- Update user memory profile
- Track memory access patterns
- Calculate memory hit rates

### 3. **Analytics Tracking**

**Metrics Tracked:**
- Total conversations
- Web search usage rate
- Memory retrieval success rate
- Average response times
- Trending topics
- User engagement patterns

**Analytics Endpoints:**
- `/api/analytics/summary` - Overview statistics
- `/api/analytics/trending` - Popular topics
- `/api/analytics/performance` - System performance

### 4. **Model Usage**

| Service | Model | Purpose | Input | Output |
|---------|-------|---------|-------|--------|
| **Memory Service** | MongoDB Atlas | Memory retrieval & storage | User message | Relevant memories |
| **Perplexity** | `sonar` | Web search & current info | User query | Search results + sources |
| **Azure OpenAI** | `o4-mini` | AI response generation | Enhanced message (memory + web search) | Text response |
| **Azure OpenAI** | `gpt-4o-mini-tts` | Text-to-speech | AI response text | MP3 audio (base64) |

### 5. **Enhanced Response Structure**

```json
{
  "id": "timestamp",
  "response": "AI generated text response",
  "timestamp": "ISO timestamp",
  "searchUsed": true/false,
  "originalMessage": "user's original query",
  "searchResults": [{"title": "...", "snippet": "...", "url": "..."}],
  "audioData": "base64_encoded_mp3_audio",
  "audioFormat": "audio/mp3",
  "memoryContext": {
    "retrievedMemories": ["memory1", "memory2"],
    "memoryHitRate": "85%",
    "conversationContinued": true/false
  },
  "analytics": {
    "responseTime": "2.3s",
    "searchUsed": true,
    "memoryRetrieved": true
  }
}
```

## Memory Service Architecture

```mermaid
flowchart TD
    A[MongoDB Atlas] --> B[Memory Service]
    B --> C[Conversation Storage]
    B --> D[Memory Profile]
    B --> E[Analytics Data]
    
    C --> F[Store conversations]
    D --> G[Update user profile]
    E --> H[Track metrics]
    
    F --> I[Search memories]
    G --> J[Retrieve profile]
    H --> K[Generate insights]
    
    I --> L[Memory retrieval]
    J --> M[Profile display]
    K --> N[Analytics dashboard]
```

## Key System Features

### 1. **Memory Integration**
- **Smart Memory Retrieval**: Automatically finds relevant past conversations
- **Memory Injection**: Enhances AI responses with historical context
- **Memory Storage**: Stores all conversations for future reference
- **Memory Analytics**: Tracks memory hit rates and usage patterns

### 2. **Enhanced Analytics**
- **Real-time Tracking**: Monitors all system interactions
- **Performance Metrics**: Response times, success rates, usage patterns
- **Trending Analysis**: Identifies popular topics and user interests
- **System Health**: Monitors backend services and API performance

### 3. **Hybrid Intelligence**
- **Web Search + AI**: Perplexity for current info, Azure OpenAI for responses
- **Memory + Context**: Historical conversations enhance current responses
- **Fallback Strategy**: Graceful degradation when services are unavailable
- **Multi-modal Output**: Text responses with optional audio synthesis

### 4. **User Experience**
- **Conversation Continuity**: AI remembers past interactions
- **Smart Search**: Automatic web search when needed
- **Audio Responses**: Text-to-speech for all responses
- **Analytics Dashboard**: Real-time insights and system status

## System Health Monitoring

```mermaid
flowchart TD
    A[System Health Check] --> B{Check Services}
    B --> C[Azure OpenAI Status]
    B --> D[Memory Service Status]
    B --> E[Perplexity API Status]
    B --> F[MongoDB Atlas Status]
    
    C --> G[Update Health Dashboard]
    D --> G
    E --> G
    F --> G
    
    G --> H[Display in Control Panel]
    H --> I[Real-time Status Updates]
```

This updated architecture reflects the complete AIMCS system with memory integration, analytics tracking, and enhanced user experience features. 