const BACKEND_URL = 'https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io';

export async function getTopics() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/orb/topics`);
    if (!response.ok) throw new Error('Failed to fetch topics');
    const data = await response.json();
    return data.topics || [];
  } catch (error) {
    console.error('Error fetching topics:', error);
    // Fallback sample data
    return [
      { id: 1, category: 'Technology', headline: 'AI Breakthrough', color: '#00ff88' },
      { id: 2, category: 'Science', headline: 'Ocean Discovery', color: '#3366ff' },
      { id: 3, category: 'Art', headline: 'Digital Art', color: '#ff6b6b' },
      { id: 4, category: 'Nature', headline: 'Bee Recovery', color: '#4ecdc4' },
      { id: 5, category: 'Sports', headline: 'Olympic Records', color: '#ffa726' },
      { id: 6, category: 'Music', headline: 'New Instrument', color: '#ab47bc' },
      { id: 7, category: 'Space', headline: 'Mars Mission', color: '#7c4dff' },
      { id: 8, category: 'Innovation', headline: 'Clean Energy', color: '#26c6da' }
    ];
  }
}

export async function generateTTS(topicId) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/orb/tts/${topicId}`);
    if (!response.ok) throw new Error('Failed to generate TTS');
    const data = await response.json();
    return `data:audio/mp3;base64,${data.audioData}`;
  } catch (error) {
    console.error('Error generating TTS:', error);
    throw error;
  }
} 