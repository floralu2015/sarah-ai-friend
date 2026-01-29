#!/bin/bash
exec > /Users/flu/Workspace/ClaudeCode/sarah_ai_friend/deploy_output.log 2>&1
echo "Starting deployment at $(date)"
echo "Current directory: $(pwd)"
cd /Users/flu/Workspace/ClaudeCode/sarah_ai_friend
echo "Changed to: $(pwd)"
echo "Files in directory:"
ls -la
echo ""
echo "=== Cleaning up ==="
rm -f deploy.sh DEPLOY_ME.command run_deploy.scpt auto_deploy.sh
echo ""
echo "=== Git init ==="
git init
echo ""
echo "=== Git add ==="
git add .
echo ""
echo "=== Git commit ==="
git commit -m "Initial commit: Sarah AI Friend app

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
echo ""
echo "=== Creating GitHub repo ==="
gh repo create sarah-ai-friend --public --source=. --push
echo ""
echo "=== Done at $(date) ==="
