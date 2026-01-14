# Backend Technical Assignment – REST API & Payment Integration

This is a NestJS-based backend implementation for a simple e-commerce system with Stripe payment integration.

## Tech Stack
- **Framework**: NestJS
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (Passport.js)
- **Payment Gateway**: Stripe (Checkout Sessions & Webhooks)
- **Language**: TypeScript

## Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)
- Stripe Account (for Test Mode API keys)

## Setup Instructions

1. **Clone the repository** (or extract the project folder).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_secret_key
   JWT_EXPIRES_IN=1d
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   APP_URL=http://localhost:3000
   ```
4. **Run the application**:
   ```bash
   # Development
   npm run start:dev

   # Production Build
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Login and receive JWT.
- `GET /api/auth/profile`: Get logged-in user profile (Auth required).

### Products
- `GET /api/products`: List all active products.
- `GET /api/products/:id`: Get product details.
- `POST /api/products`: Create a new product (Auth required).

### Orders & Payments
- `POST /api/orders`: Create an order and initiate Stripe Checkout (Auth required).
  - Body: `{ "productId": "..." }`
- `GET /api/orders`: List user's orders (Auth required).
- `POST /api/webhook`: Stripe webhook endpoint (Raw body verification).

## Payment Flow Explanation
1. **Initiate**: User selects a product and calls `POST /api/orders`.
2. **Checkout**: The server creates a `pending` order and a Stripe Checkout Session. It returns a `checkoutUrl`.
3. **Payment**: The user is redirected to Stripe to complete payment.
4. **Webhook**: Stripe sends a `checkout.session.completed` event to `/api/webhook`.
5. **Update**: The server verifies the signature, finds the order via `orderId` in metadata, and updates status to `completed`.

## Postman Collection
A Postman collection export is provided in the root directory as `Postman_Collection.json`.
