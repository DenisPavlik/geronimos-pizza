# Geronimo's Pizza

A full-stack pizza ordering web application built with Next.js 14, featuring real Stripe payments, Google OAuth, a complete admin panel, and AWS S3 image storage.

---

## Live Demo

> [https://geronimos-pizza.vercel.app](https://geronimos-pizza.vercel.app)

---

## Features

**Customer-facing**
- Browse the full menu with categories, sizes, and extra toppings
- Add items to a persistent cart (survives page refresh via `localStorage`)
- Checkout via Stripe with real payment processing
- View order history and order status
- Register / login with email + password or Google OAuth
- Manage delivery address in profile

**Admin panel** (admin-flagged accounts only)
- Create, edit, and delete menu items with image upload (AWS S3)
- Manage menu categories
- View and manage user accounts
- Assign or revoke admin privileges

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS |
| Auth | NextAuth.js v4 — Google OAuth + bcrypt credentials |
| Database | MongoDB + Mongoose ODM |
| Payments | Stripe Checkout + Webhooks |
| Storage | AWS S3 |
| State | React Context + `localStorage` |
| Notifications | react-hot-toast |
| Animations | CSS keyframes + custom `FadeIn` component |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # REST endpoints (auth, orders, checkout, webhook…)
│   ├── menu/               # Public menu page
│   ├── cart/               # Cart & checkout page
│   ├── orders/             # Order confirmation & history
│   ├── profile/            # User profile & address
│   ├── menu-items/         # Admin: manage menu items
│   ├── categories/         # Admin: manage categories
│   └── users/              # Admin: manage users
├── components/
│   ├── layout/             # Header, Hero, Footer, forms, shared UI
│   └── menu/               # MenuItem tiles, cart product, add-to-cart button
├── libs/                   # mongoConnect, authOptions, isAdmin, datetime
└── models/                 # Mongoose schemas (User, UserInfo, MenuItem, Category, Order)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- MongoDB database (Atlas or local)
- Stripe account
- Google OAuth credentials
- AWS S3 bucket

### Installation

```bash
git clone https://github.com/DenisPavlik/pizza-app
cd pizza-app
yarn install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string

NEXTAUTH_URL=http://localhost:3000/
SECRET=your_nextauth_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

STRIPE_SK=your_stripe_secret_key

MY_AWS_ACCESS_KEY=your_aws_access_key
MY_AWS_SECRET_KEY=your_aws_secret_key
```

### Development

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Stripe Webhook (local)

To test payment webhooks locally, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

---

## Key Flows

**Checkout**
1. User adds items to cart → cart persisted in `localStorage`
2. `POST /api/checkout` creates an unpaid `Order` document in MongoDB and a Stripe Checkout session
3. User completes payment on Stripe-hosted page
4. Stripe fires a `checkout.session.completed` webhook → `POST /api/webhook` marks the order as `paid: true`
5. User is redirected to the order confirmation page

**Auth**
- Sessions managed by NextAuth.js using JWT strategy
- Admin status stored in a separate `UserInfo` document, checked via `src/libs/isAdmin.js`

**Image Upload**
- Admin uploads a file → `POST /api/upload` → `PutObjectCommand` to S3 → returns a public S3 URL stored on the `MenuItem`

---

## Scripts

```bash
yarn dev      # Start development server
yarn build    # Production build
yarn start    # Start production server
yarn lint     # Run ESLint
```

---

## License

MIT
