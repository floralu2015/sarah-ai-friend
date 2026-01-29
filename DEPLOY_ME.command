#!/bin/bash
# Double-click this file to deploy Sarah AI Friend to GitHub!

cd /Users/flu/Workspace/ClaudeCode/sarah_ai_friend

echo "🚀 Deploying Sarah AI Friend..."
echo ""

# Clean up
rm -f deploy.sh 2>/dev/null

# Initialize git
echo "📁 Initializing git repository..."
git init

# Add all files
echo "📦 Adding files..."
git add .

# Commit
echo "💾 Committing..."
git commit -m "Initial commit: Sarah AI Friend - emotional support app for kids

Features:
- Mood check-in with fun emojis
- AI chat powered by Claude
- Voice mode (talk and listen)
- Private journal
- Calming activities (breathing, grounding, affirmations)
- Parent dashboard with mood trends

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Create GitHub repo and push
echo "🌐 Creating GitHub repo and pushing..."
gh repo create sarah-ai-friend --public --source=. --push

echo ""
echo "✅ Done! Your repo is at: https://github.com/floralu2015/sarah-ai-friend"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://railway.app/new"
echo "2. Click 'Deploy from GitHub repo'"
echo "3. Select 'sarah-ai-friend'"
echo "4. Add environment variable: ANTHROPIC_API_KEY"
echo ""
echo "Press any key to close..."
read -n 1
