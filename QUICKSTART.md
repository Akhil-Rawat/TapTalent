# ⚡ Quick Start Guide

Get the Currency Exchange API running in under 5 minutes!

## 🚀 Local Development

### Step 1: Install Dependencies
```bash
cd Taptalent
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env if needed (default is ARS for Argentina)
```

### Step 3: Initialize Database
```bash
npm run db:migrate
```

### Step 4: Start the Server
```bash
npm start
```

The API will be running at `http://localhost:3000`

### Step 5: Test It!
```bash
# In a new terminal
curl http://localhost:3000/health
curl http://localhost:3000/quotes
curl http://localhost:3000/average
curl http://localhost:3000/slippage

# Or use the test script
./test-api.sh
```

## 🐳 Docker Quick Start

```bash
# Build and run with Docker
docker build -t currency-exchange-api .
docker run -p 3000:3000 -e REGION=ARS currency-exchange-api

# Or use docker-compose
docker-compose up
```

## ☁️ Deploy to Render (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Currency Exchange API"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render.com**
   - Go to [render.com](https://render.com) and sign up
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment Variables**: Add `REGION=ARS` (or `BRL`)
   - Click "Create Web Service"

3. **Done!** Your API will be live at `https://your-app-name.onrender.com`

## 🧪 Testing Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Get Quotes
```bash
curl http://localhost:3000/quotes
```

### Get Average
```bash
curl http://localhost:3000/average
```

### Get Slippage
```bash
curl http://localhost:3000/slippage
```

### Force Refresh (bypass cache)
```bash
curl http://localhost:3000/quotes?refresh=true
```

### Historical Data
```bash
curl http://localhost:3000/historical?limit=10
```

## 🔧 Configuration

### Change Region
Edit `.env` file:
```env
REGION=BRL  # For Brazil (USD to BRL)
# or
REGION=ARS  # For Argentina (USD to ARS)
```

Restart the server after changing.

### Adjust Cache Time
```env
CACHE_TTL=60  # Cache time in seconds (default: 60)
```

## 📖 Documentation

- **API Reference**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Solution Summary**: See [SOLUTION_SUMMARY.md](SOLUTION_SUMMARY.md)

## 🆘 Troubleshooting

### Server won't start
- Check if port 3000 is available: `lsof -i :3000`
- Kill existing process: `kill -9 <PID>`
- Or change port in `.env`: `PORT=3001`

### No quotes returned
- Check internet connection
- Some websites may block automated requests
- The API continues to work with available sources

### Database errors
- Delete `data/quotes.db` and run `npm run db:migrate` again
- Ensure `data/` directory has write permissions

## 💻 Development Mode

```bash
# Install nodemon for auto-reload
npm install

# Start in development mode
npm run dev
```

## 🎯 What's Next?

1. Test all endpoints thoroughly
2. Deploy to a public URL
3. Share the GitHub repository
4. Add custom improvements if time permits

## 📦 Project Structure
```
Taptalent/
├── src/              # Source code
├── data/             # Database storage
├── .env              # Configuration
├── package.json      # Dependencies
└── README.md         # Documentation
```

---

**That's it!** You now have a production-ready Currency Exchange API running! 🎉

For detailed information, check the full [README.md](README.md).
