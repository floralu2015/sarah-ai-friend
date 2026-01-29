const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');

// Load .env file ONLY for local development
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '.env');
console.log('Checking for .env at:', envPath);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Loaded .env file from:', envPath);
} else {
  console.log('No local .env file, using environment variables');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Debug logging
console.log('=== Environment Debug ===');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
console.log('=========================');

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('WARNING: ANTHROPIC_API_KEY is not set!');
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

// Middleware
app.use(express.json({ limit: '10mb' }));

// Serve static files from public directory (built React app)
app.use(express.static(path.join(__dirname, '../public')));

// In-memory storage (use database in production)
const moodHistory = [];
const sessions = new Map();

// AI Friend System Prompt
const SYSTEM_PROMPT = `You are Sarah's AI Friend, a kind, warm, and supportive companion. Sarah is 10 years old and in 5th grade.

PERSONALITY:
- Be warm, friendly, and caring - like a trusted friend
- Use simple, age-appropriate language a 10-year-old can understand
- Be patient and never dismissive of feelings
- Use occasional emojis to be friendly, but don't overdo it
- Be encouraging without being preachy

CONVERSATION STYLE:
- Always validate Sarah's feelings first ("It makes sense you feel that way", "That sounds really hard")
- Ask gentle, open-ended follow-up questions to understand better
- Offer coping suggestions as ideas, not commands ("Sometimes it helps to...", "You might try...")
- Celebrate small wins and efforts
- Keep responses concise - 2-3 sentences is usually enough

IMPORTANT SAFETY GUIDELINES:
- If Sarah mentions anything serious (self-harm, abuse, bullying that feels dangerous), gently encourage her to talk to a trusted adult like a parent, teacher, or school counselor
- Never give medical advice
- Don't pretend to be a real person or mislead about being an AI
- Focus on emotional support and coping strategies

TOPICS TO ENCOURAGE:
- Talking about feelings and emotions
- School experiences (friends, classes, activities)
- Family relationships
- Hobbies and interests
- Problem-solving and coping skills

Remember: Your goal is to help Sarah feel heard, validated, and supported. You're not trying to fix everything - sometimes just listening and understanding is enough.`;

function getMoodContext(mood) {
  const contexts = {
    happy: "Sarah is feeling happy right now. Celebrate with her and encourage her to share what's making her feel good!",
    sad: "Sarah is feeling sad. Be extra gentle and understanding. Validate her feelings and let her know it's okay to feel this way.",
    mad: "Sarah is feeling angry. Help her understand her anger is valid while gently exploring what happened and healthy ways to handle it.",
    worried: "Sarah is feeling worried. Provide reassurance and help her work through what's on her mind. Breathing exercises might help.",
    excited: "Sarah is feeling excited! Share in her excitement and encourage her to tell you all about it!",
    confused: "Sarah is feeling confused. Be patient and help her work through whatever is puzzling her, step by step.",
  };
  return contexts[mood] || "";
}

// ========== API ENDPOINTS ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Your AI Friend is running!',
    anthropic: {
      present: !!process.env.ANTHROPIC_API_KEY,
      length: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0
    }
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, mood } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const moodContext = mood ? `\n\nCURRENT MOOD: ${getMoodContext(mood)}` : '';

    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SYSTEM_PROMPT + moodContext,
      messages: formattedMessages
    });

    res.json({ response: response.content[0].text });
  } catch (error) {
    console.error('Chat Error:', error.message);
    res.status(500).json({
      error: 'Something went wrong',
      response: "Oops! I had a little hiccup. Can you try saying that again?"
    });
  }
});

// Log mood
app.post('/api/mood', (req, res) => {
  const { mood, timestamp } = req.body;

  if (!mood) {
    return res.status(400).json({ error: 'Mood is required' });
  }

  const entry = {
    id: Date.now(),
    mood,
    timestamp: timestamp || new Date().toISOString()
  };

  moodHistory.push(entry);
  res.json({ success: true, entry });
});

// Get mood history
app.get('/api/mood', (req, res) => {
  res.json({ history: moodHistory });
});

// Get mood stats for parent dashboard
app.get('/api/mood/stats', (req, res) => {
  const stats = {
    total: moodHistory.length,
    counts: moodHistory.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {}),
    recent: moodHistory.slice(-7)
  };
  res.json(stats);
});

// Catch-all: serve React app for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      error: 'Frontend not built yet',
      hint: 'Run "npm run build" to build the React frontend'
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Your AI Friend running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
