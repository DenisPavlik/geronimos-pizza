# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use Yarn for this project.

```bash
yarn install     # Install dependencies
yarn dev         # Start development server (Next.js)
yarn build       # Production build
yarn start       # Start production server
yarn lint        # Run ESLint
```

No test suite is configured.

## Tech Stack

- **Framework:** Next.js 14 App Router, React 18, TypeScript (strict mode off)
- **Styling:** Tailwind CSS; primary brand color `#f13a01` (orange); fonts via CSS variables (Roboto, Josefin Sans, Lilita One)
- **Auth:** NextAuth.js v4 — Google OAuth + Credentials (bcrypt), JWT sessions, MongoDB adapter
- **Database:** MongoDB via Mongoose (ODM) + direct MongoClient (`clientPromise`) for NextAuth adapter
- **Payments:** Stripe — checkout session creation in `/api/checkout`, webhook handling in `/api/webhook`
- **Storage:** AWS S3 for image uploads via `/api/upload`
- **State:** React Context (`AppContext.js`) for cart, persisted to `localStorage`
- **Notifications:** react-hot-toast (global `Toaster` in `providers.jsx`)
- **Other libs:** `react-flying-item` (add-to-cart animation), `uniqid` (cart item IDs), `micro` (raw body for Stripe webhook)

## Architecture

### Routing & Pages

All routes live under `src/app/`. App title: **"Geronimo's pizza"** (set in `layout.js` metadata).

Public-facing pages: home `/`, `/menu`, `/cart`, `/login`, `/register`, `/about`, `/contact`. Authenticated pages: `/profile`, `/orders`, `/orders/[id]`. Admin-only pages: `/menu-items`, `/menu-items/new`, `/menu-items/edit/[id]`, `/categories`, `/users`, `/users/[id]`.

### API Routes (`src/app/api/`)

| Route | Purpose |
|---|---|
| `auth/[...nextauth]` | NextAuth callbacks |
| `register` | Create user with bcrypt-hashed password |
| `profile` | GET/PUT user profile & address |
| `menu-items` | CRUD for menu items |
| `categories` | CRUD for categories |
| `orders` | List/create orders |
| `checkout` | Create Stripe session, save unpaid Order to MongoDB |
| `webhook` | Stripe webhook — marks `Order.paid = true` |
| `upload` | S3 `PutObjectCommand`, returns public S3 URL |
| `users` | Admin: list and update users |

### Data Models (`src/models/`)

- **User** — email, password (hashed), name, image
- **UserInfo** — extended profile (address fields, `admin` flag)
- **MenuItem** — name, description, basePrice, image, category, sizes/extras arrays
- **Category** — name
- **Order** — userEmail, cartProducts (Object), phone, streetAddress, postalCode, city, country, paid (bool), createdAt (address is stored as flat fields, not a nested object)

### Key Data Flows

**Cart:** Items stored in `CartContext` (React Context) → persisted to `localStorage` → totals calculated in `/cart` page.

**Checkout:** Cart → `POST /api/checkout` → creates unpaid `Order` doc → Stripe session with line items → redirect to Stripe → `POST /api/webhook` flips `order.paid = true`.

**Auth guards:** Client components use `useSession()`. API routes use `getServerSession(authOptions)`. Admin check via `src/libs/isAdmin.js` (looks up `UserInfo.admin`).

**Image upload:** File input → `POST /api/upload` → S3 → returns URL stored in `MenuItem.image`.

### Shared Utilities (`src/libs/`)

- `mongoConnect.js` — exports `clientPromise` (MongoClient); dev HMR-safe via global cache; used by NextAuth adapter
- `authOptions.js` — single NextAuth config imported by both the API route and server-side `getServerSession` calls
- `isAdmin.js` — reusable admin authorization check for API routes
- `datetime.js` — date formatting helpers

## Environment Variables

Required in `.env.local`:

```
MONGODB_URI
NEXTAUTH_URL
SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
STRIPE_PK          # Stripe publishable key (used client-side)
STRIPE_SK          # Stripe secret key (server-side)
STRIPE_SIGN_SECRET # Stripe webhook signing secret
MY_AWS_ACCESS_KEY
MY_AWS_SECRET_KEY
```

S3 bucket: `denys-pizza-app.s3.amazonaws.com` (whitelisted in `next.config.js` `remotePatterns`).

## Conventions

- Client components that need browser APIs or hooks start with `"use client"`.
- Path alias `@/*` maps to `src/*`.
- TypeScript strict mode is **off** — `src/` uses `.js` and `.jsx` only; no `.ts`/`.tsx` source files exist (only the auto-generated `next-env.d.ts` at root).
- Images from Google and AWS S3 are whitelisted in `next.config.js` `remotePatterns`.
- Use Yarn as the package manager for local development and verification commands. Do not run `npm install` unless explicitly asked.

## Current Goal: Portfolio Polish Pass

This project is an older pizza ordering app that should be polished for portfolio/demo use.

Main priorities:
1. ✅ Add or improve branded browser tab icon / favicon (`public/fav.png`, `src/app/icon.png`).
2. Replace the hardcoded footer year with a dynamic current year.
3. ✅ Add subtle, tasteful entrance animations to the homepage (`FadeIn.jsx` + preloader).
4. Fix the broken add-to-cart flying image animation (`react-flying-item` in `AddToCartButton.js`).
5. Improve responsive polish where needed.
6. Do safe cleanup/refactor only after visible issues are fixed.

### Key UI Components Added During Polish

- **`FadeIn.jsx`** (`src/components/layout/`) — scroll-triggered opacity+translate animation via IntersectionObserver; accepts `delay` prop; respects `prefers-reduced-motion`. Used in Hero, HomeMenu, SectionHeaders, About, Menu pages.
- **`Preloader.js`** (`src/components/`) — spinning `preloader1.png` with Tailwind `animate-spin-preloader` (10s infinite). Used as loading fallback in HomeMenu and Menu page.
- **`AuthCard.jsx`** (`src/components/layout/`) — shared card wrapper for Login and Register pages.
- Custom Tailwind animations: `spin-slow` (45s, once) and `spin-preloader` (10s, infinite).

## Working Rules for Claude

- Work one task at a time.
- Do not rewrite the whole project.
- Do not do large refactors unless explicitly asked.
- Do not upgrade Next.js, React, Tailwind, Stripe, NextAuth, MongoDB, Mongoose, or other major dependencies unless explicitly asked.
- Do not change Stripe checkout, Stripe webhook, auth, MongoDB models, admin permissions, or API contracts unless the task specifically requires it.
- Prefer small, focused changes with clear explanations.
- Before editing files, briefly explain the intended approach.
- After editing files, summarize exactly what changed and which files were modified.
- Preserve existing behavior unless the user asks for a behavior change.
- For UI polish, keep the existing orange pizza brand direction and avoid making the app look like a different product.
- Animations should be subtle, modern, smooth, and not excessive.
- Respect accessibility basics, including reduced-motion preferences when adding animations.
- Use Yarn for all install/dev/build/lint commands.
- Do not run `npm install` or modify `package-lock.json` unless explicitly asked.

## Verification

After changes, run when relevant:

```bash
yarn lint
yarn build