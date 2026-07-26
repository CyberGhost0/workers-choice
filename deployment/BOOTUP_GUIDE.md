# Workers-Choice System Boot-Up Configuration

## Overview

This guide explains how to set up Workers-Choice to start automatically when your system boots.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and configured
- Redis installed and configured
- Application built for production

## Installation Steps

### 1. Build the Application

```bash
cd /home/mpanshak/workers-choice

# Build server
cd server
npm run build
cd ..

# Build client
cd client
npm run build
cd ..
```

### 2. Install Service Files

```bash
# Copy service files to systemd directory
sudo cp deployment/workers-choice-api.service /etc/systemd/system/
sudo cp deployment/workers-choice-web.service /etc/systemd/system/

# Reload systemd to recognize new services
sudo systemctl daemon-reload
```

### 3. Enable Services

```bash
# Enable services to start on boot
sudo systemctl enable workers-choice-api
sudo systemctl enable workers-choice-web

# Start services now
sudo systemctl start workers-choice-api
sudo systemctl start workers-choice-web
```

### 4. Verify Services

```bash
# Check service status
sudo systemctl status workers-choice-api
sudo systemctl status workers-choice-web

# Check if services are running
curl http://localhost:4000/health
curl http://localhost:3000
```

## Service Management Commands

```bash
# Start services
sudo systemctl start workers-choice-api
sudo systemctl start workers-choice-web

# Stop services
sudo systemctl stop workers-choice-api
sudo systemctl stop workers-choice-web

# Restart services
sudo systemctl restart workers-choice-api
sudo systemctl restart workers-choice-web

# View logs
sudo journalctl -u workers-choice-api -f
sudo journalctl -u workers-choice-web -f

# Check service status
sudo systemctl status workers-choice-api
sudo systemctl status workers-choice-web
```

## Manual Start (Without systemd)

If you prefer to run manually:

```bash
cd /home/mpanshak/workers-choice

# Start server
cd server && npm start &

# Start client
cd client && npm start &
```

## Auto-Start Script

Create a startup script for easy management:

```bash
# Create startup script
cat > /home/mpanshak/workers-choice/start.sh << 'EOF'
#!/bin/bash

echo "Starting Workers-Choice..."

# Start PostgreSQL
sudo systemctl start postgresql

# Start Redis
sudo systemctl start redis

# Start API server
cd /home/mpanshak/workers-choice/server
npm start &

# Start web server
cd /home/mpanshak/workers-choice/client
npm start &

echo "Workers-Choice started!"
echo "API: http://localhost:4000"
echo "Web: http://localhost:3000"
EOF

chmod +x /home/mpanshak/workers-choice/start.sh
```

## Troubleshooting

### Service won't start

```bash
# Check logs for errors
sudo journalctl -u workers-choice-api -n 50
sudo journalctl -u workers-choice-web -n 50

# Check if port is in use
lsof -i :4000
lsof -i :3000

# Restart services
sudo systemctl restart workers-choice-api
sudo systemctl restart workers-choice-web
```

### Database connection issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Test connection
psql -U postgres -d workers_choice -c "SELECT 1;"
```

### Permission issues

```bash
# Fix ownership
sudo chown -R mpanshak:mpanshak /home/mpanshak/workers-choice

# Fix permissions
chmod -R 755 /home/mpanshak/workers-choice
```

## Complete Boot Sequence

When your system boots, the following will happen automatically:

1. PostgreSQL starts
2. Redis starts
3. Workers-Choice API starts (port 4000)
4. Workers-Choice Web starts (port 3000)

Your platform will be accessible at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
