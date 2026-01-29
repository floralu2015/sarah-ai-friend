# Your AI Friend

A supportive emotional companion app designed for Sarah (10 years old, 5th grade). This app provides a safe space for Sarah to express her feelings through chat, voice, journaling, and calming activities.

## Features

- **Mood Check-in** - Fun emoji-based mood selector
- **Chat with AI Friend** - Warm, supportive conversations powered by Claude
- **Voice Mode** - Talk and listen using speech recognition
- **Journal** - Private diary entries and conversation saving
- **Calming Activities** - Breathing exercises, grounding techniques, affirmations
- **Daily Encouragement** - Motivational messages and streak tracking
- **Parent Dashboard** - Mood trends and conversation themes (not full chats)

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Setup

```bash
cd sarah_ai_friend

# Install root dependencies
npm install

# Set up environment
cp server/.env.example server/.env
# Edit server/.env and add your ANTHROPIC_API_KEY

# Build frontend and start server
npm run build
npm start
```

### Access the App
Open http://localhost:3001 in your browser.

### Development Mode
```bash
# Terminal 1: Run server with auto-reload
npm run dev

# Terminal 2: Run frontend dev server (optional, for hot reload)
cd frontend && npm run dev
```

## Deploy to Railway

### Option 1: One-Click Deploy
1. Push this repo to GitHub
2. Go to [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variable: `ANTHROPIC_API_KEY`
6. Railway will auto-detect and deploy!

### Option 2: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add your API key
railway variables set ANTHROPIC_API_KEY=sk-ant-xxxxx

# Deploy
railway up
```

### Railway Configuration
The app includes:
- `railway.toml` - Railway deployment settings
- `nixpacks.toml` - Build configuration (Node.js 18)

Railway will automatically:
1. Install dependencies
2. Build the React frontend
3. Start the Express server

## Project Structure

```
sarah_ai_friend/
├── frontend/               # React app (Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── MoodSelector.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── VoiceMode.jsx
│   │   │   ├── BreathingExercise.jsx
│   │   │   ├── GroundingExercise.jsx
│   │   │   ├── Affirmations.jsx
│   │   │   ├── DailyMessage.jsx
│   │   │   └── Navigation.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Chat.jsx
│   │       ├── Journal.jsx
│   │       ├── Activities.jsx
│   │       └── Parent.jsx
│   └── package.json
├── server/                 # Express server
│   ├── index.js           # Main server + API routes
│   └── .env.example
├── public/                 # Built frontend (generated)
├── package.json           # Root config
├── railway.toml           # Railway deployment config
└── nixpacks.toml          # Build config
```

## Customization

### Changing the AI Personality
Edit the `SYSTEM_PROMPT` in `server/index.js` to adjust how the AI friend responds.

### Parent Dashboard PIN
The default PIN is `1234`. Change it in `frontend/src/pages/Parent.jsx`.

### Daily Messages
Add or edit messages in `frontend/src/components/DailyMessage.jsx`.

### Affirmations
Add more affirmations in `frontend/src/components/Affirmations.jsx`.

## Safety Features

- AI is tuned for age-appropriate, therapeutic support
- Guardrails for serious topics (suggests talking to trusted adults)
- Parent dashboard shows trends only, not private conversations
- No personally identifiable information stored beyond first name

## Voice Mode Notes

Voice mode uses the Web Speech API which is:
- Best supported in Chrome
- Requires microphone permissions
- May not work in all browsers (Safari has limited support)
- For mobile: HTTPS is required (Railway provides this automatically)

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express
- **AI**: Claude API (Anthropic)
- **Voice**: Web Speech API (browser-native)
- **Deployment**: Railway

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Claude API key |
| `PORT` | No | Server port (default: 3001, Railway sets automatically) |

## License

For personal/educational use.
