# Migration Plan: Positive-News → Historical-Figures Service

## 🎯 **Migration Goal**
Migrate away from the legacy positive-news service to a fresh, comprehensive historical-figures service with integrated audio and images.

## 📊 **Current State Analysis**

### **Database Collections**
1. **`stories`** - Main story cache (used by HistoricalFiguresService)
2. **`positive_news_stories`** - Legacy collection (to be deprecated)
3. **`historical_figure_images`** - Image metadata (currently has invalid data)
4. **`audio`** - TTS audio cache
5. **`memories`** - Memory service data
6. **`connection_test`** - Test collection

### **Current API Endpoints**
- **Legacy**: `/api/orb/positive-news/:category` (backward compatibility)
- **New**: `/api/orb/historical-figures/:category` (preferred)
- **Image**: `/api/orb/images/*` (multiple endpoints)
- **TTS**: `/api/tts/generate`

## 🚀 **Migration Strategy**

### **Phase 1: Clean Database & Test New System**
1. Clear old invalid image data from `historical_figure_images`
2. Test new image service with clean database
3. Verify historical-figures service is working
4. Test TTS integration

### **Phase 2: Update Frontend**
1. Update frontend to use `/api/orb/historical-figures/:category`
2. Remove references to positive-news endpoints
3. Test image and audio display

### **Phase 3: Deprecate Legacy**
1. Remove positive-news endpoints
2. Clean up old collections
3. Update documentation

## 🔧 **Implementation Plan**

### **Step 1: Database Cleanup**
- Clear `historical_figure_images` collection
- Verify `stories` collection has good data
- Test new image service with clean slate

### **Step 2: API Consolidation**
- Ensure `/api/orb/historical-figures/:category` is primary endpoint
- Add image and audio integration to historical-figures endpoint
- Test comprehensive story+image+audio responses

### **Step 3: Frontend Migration**
- Update `OrbGame.jsx` to use new endpoint
- Test image and audio display
- Verify fallback systems work

### **Step 4: Testing & Validation**
- Test all categories and epochs
- Verify image fallbacks work
- Test TTS audio generation
- Performance testing

## 📋 **Success Criteria**
- [ ] Historical-figures endpoint returns stories with images and audio
- [ ] Image service uses verified sources and reliable fallbacks
- [ ] TTS audio is generated and cached properly
- [ ] Frontend displays images and plays audio correctly
- [ ] No more 404 errors or invalid URLs
- [ ] Performance is acceptable (< 2s response time)

## 🛠️ **Tools & Scripts**
- `scripts/clear-and-test-image-service.js` - Database cleanup
- `scripts/verify-new-image-service.js` - Service verification
- `scripts/test-comprehensive-migration.js` - End-to-end testing 