#!/bin/bash

# Git initialization script for Currency Exchange API
echo "🚀 Initializing Git repository..."

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Currency Exchange API

Features:
- Multi-source USD to ARS/BRL exchange rate aggregation
- Three REST endpoints: /quotes, /average, /slippage
- 60-second intelligent caching
- SQLite database for historical data
- Production-ready with Docker support
- Comprehensive documentation

Tech Stack:
- Node.js + Express.js
- SQLite3
- Axios + Cheerio for web scraping
- Winston for logging
- Helmet for security"

echo ""
echo "✅ Git repository initialized!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Run: git remote add origin <your-github-repo-url>"
echo "3. Run: git branch -M main"
echo "4. Run: git push -u origin main"
echo ""
echo "Or use GitHub CLI:"
echo "  gh repo create currency-exchange-api --public --source=. --remote=origin --push"
