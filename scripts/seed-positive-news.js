#!/usr/bin/env node

/**
 * Manual Positive News Seeder
 * ---------------------------
 * Seeds the database with sample positive news stories
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MONGO_URI not set');
  process.exit(1);
}

const sampleStories = {
  Technology: [
    {
      headline: "AI Helps Reduce Energy Consumption in Data Centers",
      summary: "New AI systems cut power usage by 20% in major tech facilities.",
      fullText: "Researchers developed an AI that dynamically adjusts cooling systems based on real-time server load, reducing energy consumption by 20% in major data centers. The system uses machine learning to predict optimal temperature settings and has been deployed across multiple facilities.",
      source: "TechNews Daily"
    },
    {
      headline: "Solar Panel Efficiency Reaches New Record",
      summary: "Breakthrough in photovoltaic technology achieves 30% efficiency.",
      fullText: "Scientists have developed a new type of solar panel that achieves 30% efficiency, breaking previous records. The innovation uses advanced materials and novel cell architecture, making renewable energy more accessible and cost-effective for homes and businesses worldwide.",
      source: "Green Energy Weekly"
    },
    {
      headline: "Quantum Computing Milestone Achieved",
      summary: "Researchers successfully demonstrate quantum advantage in practical applications.",
      fullText: "A team of researchers has achieved a major milestone in quantum computing, demonstrating quantum advantage in solving complex optimization problems. This breakthrough could revolutionize fields from drug discovery to climate modeling, opening new possibilities for scientific advancement.",
      source: "Science Today"
    }
  ],
  Science: [
    {
      headline: "Breakthrough in Cancer Treatment Research",
      summary: "New immunotherapy approach shows promising results in clinical trials.",
      fullText: "Scientists have developed a novel immunotherapy approach that targets specific cancer cells while leaving healthy tissue unharmed. Early clinical trials show a 60% improvement in survival rates for patients with advanced-stage cancers, offering new hope for effective treatments.",
      source: "Medical Research Journal"
    },
    {
      headline: "Ocean Cleanup Project Removes 100,000 Tons of Plastic",
      summary: "Innovative technology successfully removes plastic waste from Pacific Ocean.",
      fullText: "An ambitious ocean cleanup project has successfully removed over 100,000 tons of plastic waste from the Pacific Ocean using innovative floating barriers and AI-powered collection systems. The project aims to clean up 90% of ocean plastic by 2040.",
      source: "Environmental Science News"
    },
    {
      headline: "Breakthrough in Fusion Energy Research",
      summary: "Scientists achieve sustained fusion reaction for record duration.",
      fullText: "Researchers have achieved a sustained fusion reaction for over 10 minutes, marking a significant step toward clean, limitless energy. The breakthrough brings us closer to practical fusion power plants that could provide clean energy without greenhouse gas emissions.",
      source: "Physics Today"
    }
  ]
};

async function seedStories() {
  const client = new MongoClient(mongoUri, {
    tls: true,
    tlsAllowInvalidCertificates: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  try {
    await client.connect();
    const db = client.db('aimcs');
    const stories = db.collection('positive_news_stories');

    console.log('🌱 Seeding positive news stories...');

    for (const [category, categoryStories] of Object.entries(sampleStories)) {
      for (const story of categoryStories) {
        const newsStory = {
          category,
          headline: story.headline,
          summary: story.summary,
          fullText: story.fullText,
          source: story.source,
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastUsed: null,
          useCount: 0,
          isFresh: true,
          ttsAudio: null,
          ttsGeneratedAt: null
        };

        // Check if story already exists
        const existing = await stories.findOne({
          category,
          headline: story.headline,
          summary: story.summary
        });

        if (!existing) {
          await stories.insertOne(newsStory);
          console.log(`✅ Added story for ${category}: ${story.headline}`);
        } else {
          console.log(`⏭️  Story already exists for ${category}: ${story.headline}`);
        }
      }
    }

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await client.close();
  }
}

seedStories(); 