# Workers-Choice Deployment Guide

## Table of Contents
1. [Local Network Stress Testing](#1-local-network-stress-testing)
2. [Deploy to GitHub](#2-deploy-to-github)
3. [Deploy to Vercel (Frontend) + Railway (Backend)](#3-deploy-to-vercel--railway)
4. [Deploy with Docker on a VPS](#4-deploy-with-docker-on-a-vps)

---

## 1. Local Network Stress Testing

This allows testers on the same WiFi/network to access the app from their phones or laptops.

### Step 1: Find Your Computer's IP Address

**On Linux/Mac:**
```bash
hostname -I | awk '{print $1}'
# Example output: 192.168.1.105
```

**On Windows:**
```cmd
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

### Step 2: Update Environment Variables

Edit the `.env` file in the project root:

```bash
# Replace 192.168.1.105 with YOUR computer's IP
CORS_ORIGINS=http://localhost:3000,http://192.168.1.105:3000,http://192.168.1.105:4000

# Set these for network access
APP_URL=http://192.168.1.105:3000
API_URL=http://192.168.1.105:4000

# IMPORTANT: Set a real JWT secret (not the fallback)
JWT_SECRET=your-random-secret-here-at-least-32-chars

# For password recovery, set up SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@workerschoice.com
```

### Step 3: Start the Application

```bash
cd /home/mpanshak/workers-choice

# Option A: Using Docker (Recommended)
docker-compose up -d

# Wait 30 seconds for services to start, then run migrations
docker exec -it workers_choice_server npx prisma migrate dev
docker exec -it workers_choice_server npx prisma generate

# Option B: Manual setup
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
npm run db:migrate
npm run db:seed
npm run dev
```

### Step 4: Share Access with Testers

Tell testers to open their browser and go to:
```
http://192.168.1.105:3000
```

Replace `192.168.1.105` with your actual IP.

**Important Notes:**
- All testers must be on the SAME WiFi/network
- The host computer must stay on and running
- If testers can't connect, check your firewall:
  ```bash
  # Linux - allow ports 3000 and 4000
  sudo ufw allow 3000
  sudo ufw allow 4000
  ```

---

## 2. Deploy to GitHub

### Step 1: Initialize Git Repository

```bash
cd /home/mpanshak/workers-choice

# Initialize git
git init

# Make sure .gitignore includes .env
cat .gitignore
# Verify it contains: .env
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `workers-choice`
3. Choose **Private** (recommended for pre-launch)
4. Do NOT initialize with README (you already have one)
5. Click "Create repository"

### Step 3: Push to GitHub

```bash
cd /home/mpanshak/workers-choice

# Add all files
git add .

# Commit
git commit -m "Initial commit: Workers-Choice marketplace platform"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/workers-choice.git

# Push
git branch -M main
git push -u origin main
```

### Step 4: Set Up GitHub Secrets (for CI/CD)

If you plan to deploy via GitHub Actions:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `DATABASE_URL` - Your database connection string
   - `JWT_SECRET` - A secure random string
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

---

## 3. Deploy to Vercel (Frontend) + Railway (Backend)

This is the **easiest free hosting** option for a working deployment.

### Part A: Deploy Backend to Railway

#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

#### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `workers-choice` repository
4. Select the `/server` directory as root

#### Step 3: Add PostgreSQL Database
1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will auto-generate a `DATABASE_URL`

#### Step 4: Set Environment Variables
In Railway, go to your service → Variables tab, add:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=(Railway auto-fills this from the PostgreSQL service)
JWT_SECRET=(generate a secure random string - use: openssl rand -hex 32)
NEXTAUTH_SECRET=(same as JWT_SECRET)
APP_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REDIS_URL=(optional - add Redis service if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
RESET_TOKEN_SECRET=(generate: openssl rand -hex 32)
RESET_TOKEN_EXPIRY=3600000
```

#### Step 5: Configure Build
In Railway service settings:
- **Build Command:** `npx prisma generate && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `server`

#### Step 6: Run Database Migrations
In Railway terminal:
```bash
npx prisma migrate deploy
```

#### Step 7: Note Your Backend URL
Railway gives you a URL like: `https://workers-choice-server.up.railway.app`

### Part B: Deploy Frontend to Vercel

#### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

#### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Import your `workers-choice` repository
3. Framework: Next.js (auto-detected)
4. Root Directory: `client`

#### Step 3: Set Environment Variables
```
NEXT_PUBLIC_API_URL=https://workers-choice-server.up.railway.app
NEXT_PUBLIC_APP_URL=https://workers-choice.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

#### Step 4: Deploy
Click "Deploy" - Vercel will build and deploy automatically.

### Part C: Update CORS on Railway
Update your Railway environment variable:
```
CORS_ORIGINS=https://your-frontend.vercel.app
```

---

## 4. Deploy with Docker on a VPS

For a production-like deployment on a Virtual Private Server.

### Step 1: Get a VPS
- **DigitalOcean:** https://digitalocean.com (starts at $4/month)
- **Hetzner:** https://hetzner.com (starts at €3.50/month)
- **Linode:** https://linode.com (starts at $5/month)

### Step 2: SSH into Your Server

```bash
ssh root@YOUR_SERVER_IP
```

### Step 3: Install Docker

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y
```

### Step 4: Clone Your Repository

```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/workers-choice.git
cd workers-choice
```

### Step 5: Create Production .env

```bash
cp .env.example .env
nano .env
```

Fill in all values with production credentials:

```bash
DATABASE_URL=postgresql://postgres:STRONG_PASSWORD_HERE@postgres:5432/workers_choice
JWT_SECRET=$(openssl rand -hex 32)
NEXTAUTH_SECRET=$(openssl rand -hex 32)
APP_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
RESET_TOKEN_SECRET=$(openssl rand -hex 32)
RESET_TOKEN_EXPIRY=3600000
REDIS_URL=redis://:redis_password_change_me@redis:6379
```

### Step 6: Update docker-compose.yml for Production

Edit the docker-compose.yml to set production environment:

```yaml
services:
  server:
    environment:
      - NODE_ENV=production
    # ... rest stays the same
  
  client:
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
      - NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 7: Add Nginx Reverse Proxy

```bash
apt install nginx -y
```

Create `/etc/nginx/sites-available/workers-choice`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/workers-choice /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 8: Add SSL with Let's Encrypt

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### Step 9: Start the Application

```bash
cd /opt/workers-choice
docker-compose up -d

# Run migrations
docker exec -it workers_choice_server npx prisma migrate deploy
docker exec -it workers_choice_server npx prisma generate

# Seed database (first time only)
docker exec -it workers_choice_server npm run seed
```

### Step 10: Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl https://yourdomain.com/api/health
curl https://yourdomain.com
```

---

## Troubleshooting

### "CORS error" when accessing from another device
- Make sure `CORS_ORIGINS` includes the IP/domain testers are using
- Make sure the protocol matches (http vs https)

### "Cannot connect to database"
- Check PostgreSQL is running: `docker-compose ps`
- Verify DATABASE_URL is correct

### "JWT_SECRET not set"
- Generate a secret: `openssl rand -hex 32`
- Add it to your `.env` file
- Restart the server

### Password reset emails not sending
- Check SMTP credentials
- For Gmail: use an App Password, not your regular password
  1. Go to https://myaccount.google.com/apppasswords
  2. Generate an app password
  3. Use that in SMTP_PASS

### Port 3000/4000 already in use
```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```
