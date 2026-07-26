# Workers-Choice - Test Data Guide

## Overview

This guide explains the sample data created by the seed script for testing the Workers-Choice platform.

## Test Accounts

All accounts use the password: `password123`

### Admin Account
| Field | Value |
|-------|-------|
| Email | admin@workerschoice.com |
| Password | password123 |
| Role | ADMIN |

### Artisan Accounts
| Name | Email | Business | Category |
|------|-------|----------|----------|
| John Smith | john.plumber@example.com | Smith Plumbing Co. | Plumbing |
| Sarah Johnson | sarah.cleaner@example.com | SparkleClean Pro | Cleaning |
| Mike Williams | mike.electrician@example.com | PowerTech Electric | Electrical |
| Emily Brown | emily.gardener@example.com | Green Thumb Gardening | Gardening |
| David Lee | david.carpenter@example.com | Ace Carpentry | Carpentry |
| Lisa Anderson | lisa.painter@example.com | ColorCraft Painting | Painting |

### Seller Accounts
| Name | Email | Business |
|------|-------|----------|
| Mike Store Owner | mike.store@example.com | Home Essentials Store |
| Jenny Martinez | jenny.shop@example.com | Jenny's Craft Corner |

### Customer Accounts
| Name | Email |
|------|-------|
| Alice Customer | alice.customer@example.com |
| Bob Customer | bob.customer@example.com |
| Carol Customer | carol.customer@example.com |

## Sample Data

### Services (18 total)
- **Plumbing**: Pipe Repair, Drain Cleaning, Water Heater Installation
- **Cleaning**: House Cleaning, Office Cleaning, Deep Cleaning
- **Electrical**: Electrical Repair, Light Installation, Wiring Service
- **Gardening**: Lawn Mowing, Garden Design, Tree Trimming
- **Carpentry**: Furniture Repair, Custom Woodwork, Deck Building
- **Painting**: Interior Painting, Exterior Painting, Wallpaper Installation

### Products (6 total)
- Premium Tool Set - $149.99
- LED Work Light - $29.99
- Safety Goggles - $24.99
- Handmade Wall Art - $79.99
- Custom Name Sign - $49.99
- Decorative Planters - $39.99

### Orders (3 total)
1. **Completed**: Alice → John (Plumbing) - $150
2. **In Progress**: Bob → Sarah (Cleaning) - $200
3. **Pending**: Carol → Mike (Electrical) - $175

### Reviews
- 5-star review from Alice for John's plumbing service

### Messages
- 5 messages between Alice and John about a leaky faucet repair

### Skill Groups (6 total)
1. Master Plumbers
2. Certified Electricians
3. Professional Cleaners
4. Expert Carpenters
5. Garden Masters
6. Painting Pros

### Join Requests
- Emily (Gardener) → Master Plumbers (Pending)
- David (Carpenter) → Certified Electricians (Pending)
- Lisa (Painter) → Professional Cleaners (Approved)

### Announcements
1. Welcome to Workers-Choice! (News)
2. New Feature: Before/After Photos (Update)
3. Weekend Flash Sale (Promo)

## Testing Scenarios

### 1. Customer Flow
1. Login as `alice.customer@example.com`
2. Browse marketplace for services
3. Book a service (creates order)
4. Chat with provider
5. Confirm job completion
6. Leave a review

### 2. Artisan Flow
1. Login as `john.plumber@example.com`
2. View dashboard with orders
3. Accept incoming requests
4. Mark jobs as completed
5. Respond to customer messages
6. Upload before/after photos

### 3. Seller Flow
1. Login as `mike.store@example.com`
2. View product listings
3. Add new products
4. Manage inventory
5. Respond to buyer inquiries

### 4. Admin Flow
1. Login as `admin@workerschoice.com`
2. View platform statistics
3. Manage users (verify, suspend)
4. Manage groups and join requests
5. Configure platform settings
6. Handle disputes

### 5. Group Management
1. Login as admin
2. Navigate to Admin → Groups & Skills
3. View existing groups
4. Approve/reject join requests
5. Create new groups

### 6. Chat Features
1. Login as any user
2. Open messages
3. See welcome window with:
   - News updates
   - Seller adverts (auto-rotating)
   - Top artisans of the week (auto-changing)
4. Send messages
5. See typing indicators
6. See delivered/read status

## Running the Seed

```bash
cd /home/mpanshak/workers-choice/server

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
# or
npx ts-node prisma/seed.ts
```

## Reset Database

To clear all data and re-seed:

```bash
cd /home/mpanshak/workers-choice/server

# Reset database
npx prisma migrate reset

# Re-seed
npx prisma db seed
```

## API Endpoints to Test

### Authentication
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice.customer@example.com","password":"password123"}'
```

### Services
```bash
# Get all services
curl http://localhost:4000/api/services

# Get services by category
curl "http://localhost:4000/api/services?category=Plumbing"
```

### Products
```bash
# Get all products
curl http://localhost:4000/api/products
```

### Groups
```bash
# Get all groups
curl http://localhost:4000/api/groups

# Join a group (requires auth)
curl -X POST http://localhost:4000/api/groups/{groupId}/join \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"message":"I want to join this group"}'
```

## Notes

- All users have `emailVerified: true`
- All artisans/sellers have `isVerified: true`
- Orders have realistic amounts and statuses
- Messages show a conversation about a plumbing repair
- Groups have pending join requests for testing approval flow
