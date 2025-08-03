#!/usr/bin/env node

/**
 * List Current Backend Endpoints
 * Provides a comprehensive overview of all available API endpoints
 */

console.log('🌐 Current Backend Endpoints');
console.log('============================\n');

const endpoints = [
    // Health & Status
    {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint'
    },
    {
        method: 'GET',
        path: '/',
        description: 'Root endpoint'
    },
    {
        method: 'GET',
        path: '/api',
        description: 'API information endpoint'
    },

    // Analytics
    {
        method: 'GET',
        path: '/api/analytics/summary',
        description: 'Analytics summary data'
    },
    {
        method: 'GET',
        path: '/api/analytics/detailed',
        description: 'Detailed analytics data'
    },
    {
        method: 'GET',
        path: '/api/analytics/search-decisions',
        description: 'Search decision analytics'
    },

    // Memory Service
    {
        method: 'GET',
        path: '/api/memory/profile',
        description: 'Memory profile data'
    },
    {
        method: 'GET',
        path: '/api/memory/stats',
        description: 'Memory statistics'
    },
    {
        method: 'GET',
        path: '/api/memory/export',
        description: 'Export memory data'
    },
    {
        method: 'POST',
        path: '/api/memory/search',
        description: 'Search memories'
    },

    // Chat
    {
        method: 'POST',
        path: '/api/chat',
        description: 'Chat with AI'
    },

    // Historical Figures
    {
        method: 'GET',
        path: '/api/orb/historical-figures/:category',
        description: 'Get historical figures by category'
    },
    {
        method: 'POST',
        path: '/api/orb/generate-historical-figures/:category',
        description: 'Generate historical figures for category'
    },
    {
        method: 'GET',
        path: '/api/historical-figures/stats',
        description: 'Historical figures statistics'
    },
    {
        method: 'GET',
        path: '/api/historical-figures/list/:category/:epoch',
        description: 'List historical figures by category and epoch'
    },
    {
        method: 'GET',
        path: '/api/historical-figures/random/:category',
        description: 'Get random historical figure by category'
    },
    {
        method: 'POST',
        path: '/api/historical-figures/preload/:epoch',
        description: 'Preload historical figures for epoch'
    },

    // Text-to-Speech
    {
        method: 'POST',
        path: '/api/tts/generate',
        description: 'Generate TTS audio'
    },
    {
        method: 'GET',
        path: '/api/tts/audio/:storyId',
        description: 'Get TTS audio by story ID'
    },

    // Cache Management
    {
        method: 'GET',
        path: '/api/cache/stats',
        description: 'Cache statistics'
    },
    {
        method: 'GET',
        path: '/api/cache/check/:category/:epoch/:model/:language',
        description: 'Check cache for specific parameters'
    },
    {
        method: 'DELETE',
        path: '/api/cache/clear',
        description: 'Clear cache'
    },

    // Stories
    {
        method: 'GET',
        path: '/api/stories/modern-cached',
        description: 'Get modern cached stories'
    },

    // Models
    {
        method: 'GET',
        path: '/api/models/reliability',
        description: 'Model reliability information'
    },

    // Image Service
    {
        method: 'GET',
        path: '/api/orb/images/best',
        description: 'Get best image for figure'
    },
    {
        method: 'GET',
        path: '/api/orb/images/gallery',
        description: 'Get image gallery for figure'
    },
    {
        method: 'GET',
        path: '/api/orb/images/by-type',
        description: 'Get images by type'
    },
    {
        method: 'GET',
        path: '/api/orb/images/stats',
        description: 'Image service statistics'
    },
    {
        method: 'GET',
        path: '/api/orb/images/permalink/:permalink',
        description: 'Get image by permalink'
    },
    {
        method: 'GET',
        path: '/api/orb/images/most-accessed',
        description: 'Get most accessed images'
    },
    {
        method: 'POST',
        path: '/api/orb/images/import',
        description: 'Import image data'
    },
    {
        method: 'POST',
        path: '/api/orb/images/cleanup',
        description: 'Cleanup images'
    },
    {
        method: 'POST',
        path: '/api/orb/images/populate',
        description: 'Populate images for story'
    },
    {
        method: 'GET',
        path: '/api/orb/images/check-updated',
        description: 'Check for updated images'
    },
    {
        method: 'GET',
        path: '/api/orb/stories-with-images',
        description: 'Get stories with images (main endpoint)'
    }
];

// Group endpoints by category
const categories = {
    'Health & Status': endpoints.filter(e => ['/health', '/', '/api'].includes(e.path)),
    'Analytics': endpoints.filter(e => e.path.startsWith('/api/analytics')),
    'Memory Service': endpoints.filter(e => e.path.startsWith('/api/memory')),
    'Chat': endpoints.filter(e => e.path.startsWith('/api/chat')),
    'Historical Figures': endpoints.filter(e => e.path.includes('historical-figures')),
    'Text-to-Speech': endpoints.filter(e => e.path.startsWith('/api/tts')),
    'Cache Management': endpoints.filter(e => e.path.startsWith('/api/cache')),
    'Stories': endpoints.filter(e => e.path.startsWith('/api/stories')),
    'Models': endpoints.filter(e => e.path.startsWith('/api/models')),
    'Image Service': endpoints.filter(e => e.path.startsWith('/api/orb/images') || e.path === '/api/orb/stories-with-images')
};

// Display endpoints by category
Object.entries(categories).forEach(([category, categoryEndpoints]) => {
    if (categoryEndpoints.length > 0) {
        console.log(`📁 ${category}`);
        console.log('─'.repeat(category.length + 2));
        
        categoryEndpoints.forEach(endpoint => {
            const method = endpoint.method.padEnd(4);
            const path = endpoint.path.padEnd(50);
            console.log(`${method} ${path} ${endpoint.description}`);
        });
        console.log('');
    }
});

// Summary
console.log('📊 Endpoint Summary');
console.log('==================');
console.log(`Total Endpoints: ${endpoints.length}`);
console.log(`Categories: ${Object.keys(categories).length}`);

Object.entries(categories).forEach(([category, categoryEndpoints]) => {
    if (categoryEndpoints.length > 0) {
        console.log(`${category}: ${categoryEndpoints.length} endpoints`);
    }
});

console.log('\n🔗 Base URL: https://api.orbgame.us');
console.log('📚 Documentation: Available in repository docs/'); 