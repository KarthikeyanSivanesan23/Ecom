# ShopHub - Professional E-commerce Platform

A full-stack e-commerce application built with React, TypeScript, Node.js, Express, PostgreSQL, and Prisma.

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios, Lucide Icons  
**Backend:** Node.js, Express.js, TypeScript, Prisma ORM  
**Database:** PostgreSQL  
**Payment:** Razorpay  
**Media:** Cloudinary  
**Auth:** JWT with HTTP-only cookies  

## Project Structure

```
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── context/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── backend/           # Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── config/
│   │   ├── validators/
│   │   └── types/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

```bash
# Backend
cp .env.example .env
# Edit .env with your database URL, JWT secret, Cloudinary, Razorpay keys

# Frontend
cp .env.example .env
# Edit with your API URL and Razorpay key
```

### 3. Database Setup

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed data
npx ts-node prisma/seed.ts
```

### 4. Start Development Servers

```bash
# Backend (port 3000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

## Demo Credentials

- **Admin:** admin@shophub.com / admin123
- **Customer:** customer@shophub.com / user123

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |
| GET | /api/products | List products |
| GET | /api/products/:id | Get product |
| POST | /api/products | Create product (admin) |
| GET | /api/categories | List categories |
| GET | /api/brands | List brands |
| GET | /api/cart | Get cart |
| POST | /api/cart/items | Add to cart |
| GET | /api/wishlist | Get wishlist |
| POST | /api/wishlist/:id | Add to wishlist |
| POST | /api/orders | Create order |
| GET | /api/orders | List user orders |
| POST | /api/payments/create-order | Create payment |
| POST | /api/payments/verify | Verify payment |
| GET | /api/admin/dashboard | Dashboard stats |

## Features

- Product listing with filters, search, sorting, pagination
- Product detail with variants, images, reviews
- Cart with quantity management
- Wishlist
- Multi-step checkout
- Razorpay payment integration
- Order tracking
- User account management
- Admin dashboard
- Admin product/order/customer management
- Coupon system
- Responsive design
- SEO optimization
