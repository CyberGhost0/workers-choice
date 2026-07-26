# Workers-Choice - Installation Guide

## Step 1: Install Node.js (v18+)

Open a terminal and run these commands one by one:

```bash
# Download and install Node.js v18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 2: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib postgis

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user and database
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "ALTER USER postgres CREATEDB CREATEROLE;"
sudo -u postgres psql -c "CREATE DATABASE workers_choice OWNER postgres;"
sudo -u postgres psql -c "ALTER USER postgres WITH SUPERUSER;"

# Enable PostGIS extension
sudo -u postgres psql -d workers_choice -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

## Step 3: Install Docker & Docker Compose (Optional - for containerized deployment)

```bash
# Install Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group (logout and login after this)
sudo usermod -aG docker $USER
```

## Step 4: Setup Workers-Choice

```bash
# Navigate to project directory
cd /home/mpanshak/workers-choice

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..

# Copy environment file
cp .env.example .env

# Edit .env file with your settings (optional - defaults work for local dev)
nano .env
```

## Step 5: Initialize Database

```bash
cd server

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample data (optional)
# npm run seed

cd ..
```

## Step 6: Start the Application

```bash
# Option A: Start both client and server
npm run dev

# Option B: Start individually
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

## Step 7: Access the Application

- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## Quick Commands Reference

```bash
# Start everything
npm run dev

# Database commands
cd server && npx prisma migrate dev     # Run migrations
cd server && npx prisma studio          # Open database GUI
cd server && npx prisma generate        # Regenerate Prisma client

# Stop PostgreSQL
sudo systemctl stop postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check PostgreSQL status
sudo systemctl status postgresql
```

## Troubleshooting

### Port 3000 or 4000 already in use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### PostgreSQL connection error
```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Check status
sudo systemctl status postgresql
```

### Permission errors
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

**After installation, come back and I'll start the application for you!**
