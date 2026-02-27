# BazaarAI — AI-Powered Multi-Vendor Marketplace
### Claude Code Project Context File
> Place this file at the root of your project. Claude Code (claude-opus-4-6) will automatically read it at the start of every session.

---

## Project Overview

**BazaarAI** is a full-stack, multi-vendor e-commerce marketplace inspired by Amazon and Daraz. Multiple vendors register and manage their own stores inside a single platform. Customers browse all vendor products in one unified experience. A Super Admin oversees the platform and earns a commission on every sale. AI is integrated across search, recommendations, chatbot, sentiment analysis, fraud detection, and product descriptions.

- **Type:** Full-Stack Web Application (Portfolio Project)
- **Inspiration:** Amazon, Etsy, Daraz
- **Timeline:** 8–9 Weeks
- **Status:** In Development

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Railway) |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| Payments | Stripe Connect |
| AI | OpenAI GPT-4o API |
| File Upload | Cloudinary |
| Email | Resend + React Email |
| State | Zustand |
| Validation | Zod |
| Testing | Jest + Playwright |
| Deployment | Vercel (app) + Railway (DB) |

---

## User Roles

There are **3 distinct roles**. Every route and API must enforce role-based access.

### 1. Customer
- Public registration (email/password + Google OAuth)
- Can browse all vendor products, add to cart, checkout, track orders, write reviews, manage wishlist

### 2. Vendor
- Registers via a separate application form (storeName, description, category, payout details)
- Status flow: `PENDING → APPROVED / REJECTED` by Super Admin
- Gets email notification on approval/rejection
- Can only manage **their own** products, orders, earnings, and store settings
- Cannot see other vendors' data at any point

### 3. Super Admin
- Seeded account — not publicly registerable
- Full platform access: approve/reject vendors, moderate products, manage all users, set commission rates, approve payouts, view platform-wide analytics

---

## Folder Structure

```
bazaarai/
├── app/
│   ├── (auth)/              # Login, Register, Vendor Apply pages
│   ├── (shop)/              # Homepage, Products, Vendors, Cart, Checkout
│   ├── (customer)/          # Orders, Profile, Wishlist
│   ├── vendor/              # Vendor dashboard
│   │   ├── products/        # Product CRUD
│   │   ├── orders/          # Sub-order management
│   │   ├── earnings/        # Balance + payout requests
│   │   └── settings/        # Store profile settings
│   ├── admin/               # Super Admin dashboard
│   │   ├── vendors/         # Approve/manage vendors
│   │   ├── products/        # Moderate products
│   │   ├── orders/          # All platform orders
│   │   ├── payouts/         # Approve payout requests
│   │   └── analytics/       # Platform revenue + trends
│   └── api/
│       ├── auth/
│       ├── products/
│       ├── vendors/
│       ├── orders/
│       ├── checkout/
│       ├── webhooks/stripe/
│       └── ai/
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── product/             # ProductCard, ProductGrid, ProductDetail
│   ├── vendor/              # VendorCard, StoreHeader, StoreProfile
│   ├── cart/                # CartDrawer, CartItem, CartSummary
│   └── ai/                  # ChatBot, AISearch, Recommendations
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── openai.ts            # OpenAI client
│   ├── stripe.ts            # Stripe Connect client
│   └── auth.ts              # Auth helpers + role checks
├── prisma/
│   ├── schema.prisma
│   └── seed.ts              # Sample vendors, products, users
├── store/                   # Zustand stores (cart, auth state)
├── types/                   # TypeScript interfaces
├── emails/                  # React Email templates
└── .env.local
```

---

## Database Schema

### Models

```prisma
model User {
  id            String        @id @default(cuid())
  name          String
  email         String        @unique
  password      String?
  role          Role          @default(CUSTOMER)
  vendorProfile VendorProfile?
  orders        Order[]
  reviews       Review[]
  cart          Cart?
  wishlist      Wishlist?
  createdAt     DateTime      @default(now())
}

enum Role {
  CUSTOMER
  VENDOR
  ADMIN
}

model VendorProfile {
  id               String    @id @default(cuid())
  userId           String    @unique
  user             User      @relation(fields: [userId], references: [id])
  storeName        String
  slug             String    @unique
  description      String?
  logo             String?
  banner           String?
  status           VendorStatus @default(PENDING)
  commissionRate   Float     @default(10)
  stripeAccountId  String?
  products         Product[]
  subOrders        SubOrder[]
  payouts          Payout[]
  createdAt        DateTime  @default(now())
}

enum VendorStatus {
  PENDING
  APPROVED
  SUSPENDED
}

model Product {
  id          String        @id @default(cuid())
  vendorId    String
  vendor      VendorProfile @relation(fields: [vendorId], references: [id])
  title       String
  description String
  price       Float
  stock       Int
  images      String[]
  categoryId  String
  category    Category      @relation(fields: [categoryId], references: [id])
  status      ProductStatus @default(DRAFT)
  rating      Float         @default(0)
  reviews     Review[]
  orderItems  OrderItem[]
  createdAt   DateTime      @default(now())
}

enum ProductStatus {
  DRAFT
  ACTIVE
  OUT_OF_STOCK
  DELISTED
}

model Category {
  id             String    @id @default(cuid())
  name           String
  slug           String    @unique
  commissionRate Float?
  products       Product[]
}

model Order {
  id                   String     @id @default(cuid())
  customerId           String
  customer             User       @relation(fields: [customerId], references: [id])
  subOrders            SubOrder[]
  total                Float
  shippingAddress      Json
  stripePaymentIntentId String?
  createdAt            DateTime   @default(now())
}

model SubOrder {
  id              String        @id @default(cuid())
  orderId         String
  order           Order         @relation(fields: [orderId], references: [id])
  vendorId        String
  vendor          VendorProfile @relation(fields: [vendorId], references: [id])
  items           OrderItem[]
  status          SubOrderStatus @default(PLACED)
  subtotal        Float
  vendorEarnings  Float
  platformFee     Float
  createdAt       DateTime      @default(now())
}

enum SubOrderStatus {
  PLACED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id               String   @id @default(cuid())
  subOrderId       String
  subOrder         SubOrder @relation(fields: [subOrderId], references: [id])
  productId        String
  product          Product  @relation(fields: [productId], references: [id])
  quantity         Int
  priceAtPurchase  Float
}

model Review {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id])
  productId        String
  product          Product  @relation(fields: [productId], references: [id])
  vendorId         String
  rating           Int
  comment          String
  sentiment        String?
  sentimentScore   Float?
  vendorReply      String?
  createdAt        DateTime @default(now())
}

model Cart {
  id     String     @id @default(cuid())
  userId String     @unique
  user   User       @relation(fields: [userId], references: [id])
  items  Json
}

model Wishlist {
  id         String   @id @default(cuid())
  userId     String   @unique
  user       User     @relation(fields: [userId], references: [id])
  productIds String[]
}

model Payout {
  id               String        @id @default(cuid())
  vendorId         String
  vendor           VendorProfile @relation(fields: [vendorId], references: [id])
  amount           Float
  status           PayoutStatus  @default(REQUESTED)
  stripeTransferId String?
  createdAt        DateTime      @default(now())
}

enum PayoutStatus {
  REQUESTED
  APPROVED
  PAID
  REJECTED
}
```

---

## API Routes

### Auth
- `POST /api/auth/register` — Customer registration
- `POST /api/auth/vendor/apply` — Vendor application
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Products
- `GET /api/products` — Marketplace listing (filters, pagination)
- `GET /api/products/:id` — Product detail
- `POST /api/vendor/products` — Create product (Vendor only)
- `PUT /api/vendor/products/:id` — Update own product (Vendor only)
- `DELETE /api/vendor/products/:id` — Delete own product (Vendor only)
- `PUT /api/admin/products/:id/status` — Approve/delist (Admin only)

### Vendors
- `GET /api/vendors` — All approved vendors (public)
- `GET /api/vendors/:slug` — Vendor store page data
- `GET /api/admin/vendors` — All vendors with status (Admin only)
- `PUT /api/admin/vendors/:id/approve` — Approve vendor
- `PUT /api/admin/vendors/:id/suspend` — Suspend vendor

### Orders & Payments
- `POST /api/checkout` — Create Stripe Connect checkout session
- `POST /api/webhooks/stripe` — Handle Stripe events
- `GET /api/orders` — Customer order history
- `GET /api/orders/:id` — Order + sub-orders detail
- `GET /api/vendor/orders` — Vendor's sub-orders
- `PUT /api/vendor/orders/:id/status` — Update sub-order status
- `POST /api/vendor/payouts` — Request payout
- `PUT /api/admin/payouts/:id/approve` — Approve payout

### AI
- `POST /api/ai/search` — Natural language search
- `POST /api/ai/recommend` — Product recommendations
- `POST /api/ai/chat` — Chatbot message
- `POST /api/ai/describe` — Generate product description
- `POST /api/ai/sentiment` — Analyze review sentiment
- `POST /api/ai/fraud-check` — Flag suspicious review or order

---

## Payment Architecture (Stripe Connect)

- Platform holds a **Stripe Connect** account
- Each vendor onboards via **Stripe Express** (guided OAuth setup)
- Customer pays the **full cart total** in one Stripe Checkout session
- On `payment_intent.succeeded` webhook:
  - One `Order` is created
  - One `SubOrder` is created per vendor in the cart
  - Platform commission is deducted (default 10%, configurable per category)
  - Stripe Transfer is created to each vendor's connected account
- Vendors see their **available balance** in their dashboard and can request a payout
- Super Admin approves payouts and triggers the Stripe payout to the vendor's bank

---

## AI Features

| Feature | Endpoint | Description |
|---|---|---|
| Natural Language Search | `/api/ai/search` | Parse plain English queries into DB filters |
| Product Recommendations | `/api/ai/recommend` | Suggest products based on history/context |
| Chatbot Assistant | `/api/ai/chat` | Answer order, product, and store questions |
| Description Generator | `/api/ai/describe` | Generate SEO-friendly product descriptions |
| Sentiment Analysis | `/api/ai/sentiment` | Tag reviews Positive / Neutral / Negative |
| Fraud Detection | `/api/ai/fraud-check` | Flag fake reviews and suspicious orders |

All AI features use **OpenAI GPT-4o**. Client is initialized in `lib/openai.ts`.

---

## Environment Variables

```env
# Database & Auth
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe Connect
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_CLIENT_ID=

# AI
OPENAI_API_KEY=

# File Upload
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
RESEND_API_KEY=
```

---

## Development Roadmap

| Phase | Focus | Duration |
|---|---|---|
| 1 | Project setup, auth, 3-role system, DB schema | Week 1 |
| 2 | Vendor onboarding, approval flow, Stripe Connect setup, store pages | Week 2 |
| 3 | Product catalog, marketplace listing, search, filters | Week 3 |
| 4 | Cart, multi-vendor checkout, Stripe payment splitting, sub-orders | Week 4–5 |
| 5 | Reviews, sentiment analysis, vendor earnings, payout flow | Week 6 |
| 6 | All 6 AI features integration | Week 7 |
| 7 | Polish, testing, deployment, README, demo video | Week 8–9 |

---

## Coding Standards

- **TypeScript** everywhere — no `any` types
- **Zod** for all API input validation
- **Prisma** for all DB queries — no raw SQL unless necessary
- **Server Components** by default — use `"use client"` only when needed
- **Conventional commits:** `feat:`, `fix:`, `chore:`, `refactor:`
- **Error handling:** every API route must return structured `{ error: string }` on failure
- **Auth checks:** every protected route must verify session role at the top using `lib/auth.ts` helpers
- **Vendor isolation:** every vendor API must filter by `vendorId === session.user.vendorId`
- **No hardcoded secrets** — always use `process.env`

---

## Key Rules for Claude Code

1. **Always check the user's role** before writing any API route logic
2. **Never let a vendor query another vendor's data** — always scope queries by `vendorId`
3. **Stripe webhook is the source of truth** for order creation — never create orders from the frontend
4. **Commission calculation:** `vendorEarnings = subtotal * (1 - commissionRate / 100)`
5. **SubOrder per vendor** — when cart has products from 3 vendors, create 3 SubOrders under one Order
6. **Prisma transactions** for order creation — all SubOrders and OrderItems must be atomic
7. **AI calls are expensive** — add loading states and never call AI on every keystroke; debounce search
8. **Images via Cloudinary** — never store base64 in DB; always store the Cloudinary URL
9. When generating new components, follow the existing pattern in `components/` for consistency
10. When stuck on Stripe Connect flow, refer to `lib/stripe.ts` and Stripe Connect Express docs