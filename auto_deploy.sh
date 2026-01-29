#!/bin/bash
cd /Users/flu/Workspace/ClaudeCode/sarah_ai_friend
rm -f deploy.sh DEPLOY_ME.command run_deploy.scpt
git init
git add .
git commit -m "Initial commit: Sarah AI Friend - emotional support app

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
gh repo create sarah-ai-friend --public --source=. --push
rm -f auto_deploy.sh
