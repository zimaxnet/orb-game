export const BACKEND_URL = 'http://localhost:3000';

export async function getHistoricalFigures(category, epoch = 'Modern', language = 'en', count = 1, model = 'gpt-5-mini') {
  try {
    // Use the historical figures endpoint with gpt-5-mini model
    const response = await fetch(`${BACKEND_URL}/api/orb/historical-figures/${category}?epoch=${epoch}&language=${language}&count=${count}&model=${model}`);
    if (!response.ok) throw new Error('Failed to fetch historical figures');
    const data = await response.json();
    
    // Handle the new response format: { stories: [...] }
    if (data && data.stories && Array.isArray(data.stories)) {
      return data.stories;
    } else if (data && Array.isArray(data)) {
      // Fallback for direct array response
      return data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching historical figures:', error);
    // Fallback data if API fails
    return [{
      headline: 'Historical Figure Story',
      summary: 'Stay tuned for more historical stories!',
      fullText: 'We\'re working on bringing you the latest historical figure stories.',
      source: 'Orb Game',
      publishedAt: new Date().toISOString(),
      ttsAudio: null,
      imageStatus: 'error'
    }];
  }
}

// Legacy function for backward compatibility (returns empty array)
export async function getTopics() {
  return [];
}

// Legacy function for backward compatibility (returns null)
export async function generateTTS(topicId) {
  return null;
} 