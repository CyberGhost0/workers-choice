# Workers-Choice

A modern artisan marketplace platform connecting customers with local service providers and product sellers.

## Features

- **Service Marketplace**: Browse and hire verified plumbers, electricians, cleaners, and more
- **Product Listings**: Shop from local sellers
- **Real-time Chat**: Direct messaging with providers
- **Escrow Payments**: Secure payment system with dual-confirmation
- **Reviews & Ratings**: Trust-based rating system
- **Before/After Photos**: Job documentation
- **Mobile Responsive**: Works on all devices

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with PostGIS
- **ORM**: Prisma
- **Auth**: JWT
- **Payments**: Stripe Connect (Escrow)
- **Chat**: Socket.IO
- **File Upload**: Cloudinary
- **Container**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Stripe account (for payments)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/workers-choice.git
   cd workers-choice
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   cd server
   npx prisma migrate dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000

### Manual Setup (Without Docker)

1. **Install dependencies**
   ```bash
   # Root
   npm install

   # Client
   cd client && npm install

   # Server
   cd server && npm install
   ```

2. **Start PostgreSQL**
   Make sure PostgreSQL is running on port 5432

3. **Run migrations**
   ```bash
   cd server
   npx prisma migrate dev
   ```

4. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

## Project Structure

```
workers-choice/
├── client/                 # Next.js Frontend
│   ├── app/               # App Router pages
│   ├── components/        # Reusable UI components
│   └── lib/               # Utilities and hooks
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, validation
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   └── prisma/            # Database schema
│
├── shared/                 # Shared types
├── docs/                   # Documentation
└── docker-compose.yml
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - List services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (Artisan)
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Seller)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/customer/orders` - Customer orders
- `GET /api/orders/provider/orders` - Provider orders
- `POST /api/orders/:id/confirm` - Confirm completion

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - List conversations
- `GET /api/messages/conversation/:userId` - Get conversation

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm/:orderId` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook

## Escrow Payment Flow

1. Customer creates order
2. Customer pays → Funds held by platform
3. Provider completes job
4. Provider confirms completion
5. Customer confirms completion
6. Both confirmed → Funds released to provider

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@workerschoice.com or create an issue in the repository.
