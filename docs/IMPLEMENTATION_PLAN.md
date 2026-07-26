# Workers-Choice - Implementation Plan

## Project Overview

**Workers-Choice** is a modern artisan marketplace platform connecting customers with local service providers (plumbers, electricians, cleaners, carpenters, etc.) and product sellers. The platform features:

- Real-time chat between customers and providers
- Before/after job photo uploads
- Escrow payment system with dual-confirmation release
- Rating and review system
- Location-based search
- Mobile-responsive design

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + PostGIS (geolocation) |
| ORM | Prisma |
| Auth | NextAuth.js |
| Payments | Stripe Connect (escrow) |
| Chat | Socket.IO |
| File Upload | Cloudinary |
| Container | Docker + Docker Compose |

---

## Design System

**Color Palette** (Modern, balanced):
- Primary: `#4F46E5` (Indigo - professional, trustworthy)
- Secondary: `#F59E0B` (Amber - warm, action-oriented)
- Background: `#F8FAFC` (Light slate)
- Surface: `#FFFFFF` (White cards)
- Text Primary: `#1E293B` (Slate-800)
- Text Secondary: `#64748B` (Slate-500)
- Success: `#10B981` (Emerald)
- Error: `#EF4444` (Red)
- Border: `#E2E8F0` (Slate-200)

**Typography**:
- Headings: Inter (Bold/Semibold)
- Body: Inter (Regular)
- Monospace: JetBrains Mono

---

## Database Schema

### Core Tables

```sql
-- Users (Authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('customer', 'artisan', 'seller', 'admin')) DEFAULT 'customer',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Business Profiles (Artisans & Sellers)
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  years_experience INT,
  hourly_rate DECIMAL(10,2),
  is_verified BOOLEAN DEFAULT false,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  stripe_account_id VARCHAR(255),
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Services (Artisan offerings)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  price_type VARCHAR(20) CHECK (price_type IN ('hourly', 'fixed', 'starting_at')),
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products (Seller offerings)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders/Bookings
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES business_profiles(id),
  service_id UUID REFERENCES services(id),
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed')) DEFAULT 'pending',
  scheduled_date TIMESTAMP,
  total_amount DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  provider_payout DECIMAL(10,2),
  stripe_payment_intent_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),
  customer_confirmed BOOLEAN DEFAULT false,
  provider_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  reviewer_id UUID REFERENCES users(id),
  reviewee_id UUID REFERENCES users(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages (Chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  content TEXT,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Job Photos (Before/After)
CREATE TABLE job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  uploader_id UUID REFERENCES users(id),
  photo_type VARCHAR(20) CHECK (photo_type IN ('before', 'during', 'after')),
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Webhook Events (Stripe)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  payload JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Escrow Payment Flow

```
1. Customer books service → Creates order (status: pending)
2. Customer pays → Stripe PaymentIntent (manual capture)
3. Funds captured → Held on platform (status: funded)
4. Provider starts work → (status: in_progress)
5. Provider marks complete → (provider_confirmed: true)
6. Customer confirms → (customer_confirmed: true)
7. Both confirmed → Transfer to provider + platform fee deducted
8. Provider receives payout
```

---

## Project Structure

```
worker-home/
├── client/                    # Next.js Frontend
│   ├── app/
│   │   ├── (auth)/           # Login, Register
│   │   ├── (dashboard)/      # User dashboards
│   │   ├── (marketplace)/    # Public listings
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── ui/               # shadcn/ui
│   │   ├── layout/           # Header, Footer
│   │   ├── forms/            # Form components
│   │   └── cards/            # Listing cards
│   ├── lib/
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Helpers
│   │   └── validations/      # Zod schemas
│   └── styles/
│
├── server/                    # Backend API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/           # Prisma schema
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── prisma/
│
├── shared/                    # Shared types
├── docs/                      # Documentation
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup (Next.js + Express + PostgreSQL)
- [ ] Docker Compose configuration
- [ ] Prisma schema and migrations
- [ ] Basic authentication (register/login)

### Phase 2: Core Features (Week 2)
- [ ] User profiles
- [ ] Artisan/Seller business profiles
- [ ] Service/Product listings
- [ ] Image upload with Cloudinary

### Phase 3: Search & Discovery (Week 3)
- [ ] Location-based search (PostGIS)
- [ ] Category filtering
- [ ] Rating-based sorting
- [ ] Price filters

### Phase 4: Communication (Week 4)
- [ ] Real-time chat with Socket.IO
- [ ] Message notifications
- [ ] Order-linked conversations

### Phase 5: Payments (Week 5)
- [ ] Stripe Connect integration
- [ ] Escrow payment flow
- [ ] Dual-confirmation system
- [ ] Provider payouts

### Phase 6: Reviews & Polish (Week 6)
- [ ] Rating and review system
- [ ] Before/after photo uploads
- [ ] UI/UX polish
- [ ] Mobile responsiveness

### Phase 7: Testing & Deployment (Week 7)
- [ ] Unit and integration tests
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Documentation

---

## Docker Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: workers_choice
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    ports:
      - "3000:3000"
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/workers_choice
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/workers_choice

# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
```

---

## Next Steps

1. **Review and approve this plan**
2. **Set up the project structure**
3. **Initialize the database**
4. **Begin Phase 1 implementation**

---

*Plan created: July 19, 2026*
*Project: Workers-Choice*
*Status: Ready for implementation*
