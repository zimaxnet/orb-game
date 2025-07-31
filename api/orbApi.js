export const BACKEND_URL = 'https://api.orbgame.us';

export async function getPositiveNews(category, epoch = 'Modern', language = 'en', count = 1) {
  try {
    // Use the image-enhanced endpoint for historical figure stories
    const response = await fetch(`${BACKEND_URL}/api/orb/stories-with-images?category=${category}&epoch=${epoch}&language=${language}&count=${count}`);
    if (!response.ok) throw new Error('Failed to fetch positive news');
    const data = await response.json();
    
    // Return the stories array from the response
    if (data.success && data.stories) {
      return data.stories;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching positive news:', error);
    // Fallback data if API fails
    return [{
      headline: 'Positive News',
      summary: 'Stay tuned for more positive stories!',
      fullText: 'We\'re working on bringing you the latest positive news.',
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