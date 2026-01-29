#!/bin/bash
set -e

cd /Users/flu/Workspace/ClaudeCode/sarah_ai_friend

echo "=== Checking directory ==="
pwd
ls -la

echo "=== Initializing git ==="
git init 2>/dev/null || echo "Git already initialized"

echo "=== Adding files ==="
git add .

echo "=== Committing ==="
git commit -m "Initial commit: Sarah AI Friend - emotional support app

Features:
- Mood check-in with emojis
- AI chat powered by Claude
- Voice mode (speech-to-text/text-to-speech)
- Journal for private entries
- Calming activities (breathing, grounding, affirmations)
- Parent dashboard with mood trends

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" 2>/dev/null || echo "Nothing to commit or already committed"

echo "=== Creating GitHub repo and pushing ==="
gh repo create sarah-ai-friend --public --source=. --push 2>/dev/null || {
    echo "Repo may already exist, trying to push..."
    git remote add origin https://github.com/floralu2015/sarah-ai-friend.git 2>/dev/null || true
    git branch -M main
    git push -u origin main
}

echo "=== Done! ==="
echo "GitHub repo: https://github.com/floralu2015/sarah-ai-friend"
echo "Now go to Railway and deploy from this repo"
