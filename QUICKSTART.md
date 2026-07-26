# Workers-Choice - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Option 1: Using Docker (Recommended)

1. **Navigate to project directory**
   ```bash
   cd /home/mpanshak/workers-choice
   ```

2. **Start Docker services**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to start** (about 30 seconds)

4. **Access the application**
   - 🌐 Frontend: http://localhost:3000
   - 🔌 API: http://localhost:4000

### Option 2: Manual Setup

1. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client && npm install && cd ..

   # Install server dependencies
   cd server && npm install && cd ..
   ```

2. **Set up PostgreSQL**
   - Make sure PostgreSQL is running
   - Create database: `workers_choice`

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Run database migrations**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   cd ..
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
workers-choice/
├── client/          → Next.js Frontend (Port 3000)
├── server/          → Express API (Port 4000)
├── shared/          → Shared types
├── docs/            → Documentation
└── docker-compose.yml
```

## 🎯 Key Features Implemented

✅ **Authentication** - Register/Login with JWT  
✅ **User Profiles** - Customer, Artisan, Seller roles  
✅ **Service Listings** - Create, browse, search services  
✅ **Product Listings** - Create, browse products  
✅ **Real-time Chat** - Socket.IO messaging  
✅ **Escrow Payments** - Stripe Connect integration  
✅ **Reviews & Ratings** - 5-star rating system  
✅ **Image Upload** - Cloudinary integration  
✅ **Responsive Design** - Mobile-first UI  

## 🛠️ Available Scripts

```bash
npm run dev          # Start both client & server
npm run dev:client   # Start only client
npm run dev:server   # Start only server
npm run docker:up    # Start Docker services
npm run docker:down  # Stop Docker services
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

## 📚 Next Steps

1. **Set up Stripe account** - Get API keys from stripe.com
2. **Set up Cloudinary** - Get credentials for image uploads
3. **Configure email** - Set up SMTP for notifications
4. **Deploy** - Choose a hosting provider (Vercel, Railway, etc.)

## 🐛 Troubleshooting

### Database connection issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Reset database
cd server
npx prisma migrate reset
```

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

### Docker issues
```bash
# Rebuild containers
docker-compose down
docker-compose up --build
```

## 📞 Support

- Check the [README.md](./README.md) for detailed documentation
- Review the [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)

---

**Happy coding! 🎉**
