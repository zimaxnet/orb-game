const BACKEND_URL = 'https://api.orbgame.us';

export async function getPositiveNews(category) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/orb/positive-news/${category}`);
    if (!response.ok) throw new Error('Failed to fetch positive news');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching positive news:', error);
    // Fallback data if API fails
    return {
      headline: 'Positive News',
      summary: 'Stay tuned for more positive stories!',
      fullText: 'We\'re working on bringing you the latest positive news.',
      source: 'Orb Game',
      publishedAt: new Date().toISOString(),
      ttsAudio: null
    };
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