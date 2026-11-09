import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are IMusic AI, the intelligent in-app music companion, curator, and sound engineer for the IMusic Android native player.
Your personality is enthusiastic, deeply knowledgeable in music theory, sound engineering, genres (from Synthwave, EDM, Lo-Fi to Classical and Jazz), acoustics, and playlist curation.

Your capabilities:
1. Smart Playlist Generation: Recommend 4-8 specific tracks tailored to moods, activities, vibes, or genres. Provide song title, artist, and a 1-sentence vibe note.
2. Equalizer & Sound Engineering: Explain optimal 5-band EQ settings (60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz) and bass boost values for specific genres or headphone types.
3. Song & Lyric Analysis: Provide emotional and thematic breakdowns of songs, harmonic structure, and artist trivia.
4. Player Navigation Tips: Help users understand IMusic features like MediaStore scanning, Android Media3 ExoPlayer background playback, lock screen widgets, and offline local library management.

Be concise, formatted cleanly with markdown bolding, bullet points, and high musical taste. Avoid fluff.`;

// Multi-turn Gemini Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model: requestedModel = 'gemini-3.8-flash', enableThinking = false } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Format conversation history for Gemini API
    const contents = messages.map((m: { role: 'user' | 'assistant' | 'model'; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Choose target model
    let targetModel = requestedModel;
    if (enableThinking) {
      // Use gemini-4-argon for high-thinking reasoning tasks as requested
      targetModel = 'gemini-4-argon';
    }

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
    };

    if (enableThinking || targetModel === 'gemini-4-argon') {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
      // Note: As specified, do not set maxOutputTokens when using ThinkingLevel.HIGH
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });
    } catch (apiError: any) {
      console.warn(`Error with model ${targetModel}:`, apiError?.message || apiError);
      // Fallback to gemini-3.8-flash if gemini-4-argon requires paid tier or encountered an error
      if (targetModel !== 'gemini-3.8-flash') {
        console.log('Falling back to gemini-3.8-flash...');
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.HIGH,
            },
          },
        });
      } else {
        throw apiError;
      }
    }

    const reply = response.text || "I'm here to help tune your music experience. What would you like to listen to?";
    return res.json({ reply, modelUsed: targetModel });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process AI chat request',
      fallback: 'IMusic AI Companion is momentarily unavailable. Please check your network or try again.',
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`IMusic fullstack server running on port ${port}`);
  });
}

startServer();
