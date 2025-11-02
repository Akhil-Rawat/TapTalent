# 🚀 Deployment Guide

## Deployment Options

### Option 1: Render.com (Recommended - Free Tier Available)

1. **Create account** at [render.com](https://render.com)

2. **Create New Web Service**
   - Connect your GitHub repository
   - Choose "Web Service"
   - Settings:
     - **Name**: currency-exchange-api
     - **Region**: Choose closest to your target audience
     - **Branch**: main
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Node

3. **Add Environment Variables**:
   ```
   NODE_ENV=production
   REGION=ARS (or BRL)
   CACHE_TTL=60
   ```

4. **Deploy**: Click "Create Web Service"

5. Your API will be available at: `https://your-app-name.onrender.com`

### Option 2: Railway.app

1. **Create account** at [railway.app](https://railway.app)

2. **New Project**
   - Deploy from GitHub repo
   - Railway auto-detects Node.js

3. **Add Environment Variables** in Settings:
   ```
   REGION=ARS
   NODE_ENV=production
   ```

4. **Deploy** - Railway handles everything automatically

5. Get your public URL from the deployment

### Option 3: Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create currency-exchange-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set REGION=ARS

# Deploy
git push heroku main

# Open app
heroku open
```

### Option 4: DigitalOcean App Platform

1. **Create account** at DigitalOcean
2. **Create App** from GitHub
3. **Configure**:
   - Detected as Node.js
   - Build: `npm install`
   - Run: `npm start`
4. **Add environment variables**
5. **Deploy**

### Option 5: AWS EC2 / VPS

```bash
# SSH into server
ssh user@your-server

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo-url>
cd Taptalent

# Install dependencies
npm install --production

# Install PM2 for process management
sudo npm install -g pm2

# Create .env file
nano .env
# Add your configuration

# Start with PM2
pm2 start src/index.js --name currency-api
pm2 save
pm2 startup

# Setup Nginx as reverse proxy (optional)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/currency-api
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 6: Docker Deployment

```bash
# Build image
docker build -t currency-exchange-api .

# Run container
docker run -d \
  -p 3000:3000 \
  -e REGION=ARS \
  -e NODE_ENV=production \
  --name currency-api \
  currency-exchange-api

# Or use docker-compose
docker-compose up -d
```

## Testing Your Deployment

Once deployed, test your endpoints:

```bash
# Health check
curl https://your-app-url.com/health

# Get quotes
curl https://your-app-url.com/quotes

# Get average
curl https://your-app-url.com/average

# Get slippage
curl https://your-app-url.com/slippage
```

## Monitoring

### Check Logs

**Render/Railway/Heroku**: Use their web dashboard

**PM2 (VPS)**:
```bash
pm2 logs currency-api
pm2 monit
```

**Docker**:
```bash
docker logs currency-api
```

## Troubleshooting

### Common Issues

1. **Scrapers failing**: Some websites may block automated requests
   - Solution: The app continues to work with available sources

2. **Port already in use**:
   - Change PORT in environment variables

3. **Database errors**:
   - Ensure data directory has write permissions
   - Check DB_PATH in .env

4. **Memory issues**:
   - Increase instance size on hosting platform
   - Monitor with: `pm2 monit`

## Performance Tips

1. **Enable caching**: Keep CACHE_TTL at 60 seconds
2. **Use CDN**: For static content if you add frontend
3. **Monitor uptime**: Use UptimeRobot or similar
4. **Set up alerts**: For downtime or errors

## Security Checklist

- ✅ Helmet.js enabled (XSS, clickjacking protection)
- ✅ CORS configured
- ✅ No sensitive data in logs
- ✅ Environment variables for configuration
- ✅ Rate limiting (can be enhanced)
- ✅ Input validation on query parameters

## Scaling

For high traffic:
1. **Horizontal scaling**: Deploy multiple instances
2. **Load balancer**: Distribute traffic
3. **Redis cache**: Replace node-cache with Redis
4. **Database**: Upgrade from SQLite to PostgreSQL

---

**Recommended for this assignment**: Render.com (free, easy, no credit card required)
