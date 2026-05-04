# AutoPro - Car Dealership & Escrow Platform

## Project Overview
A full-featured car dealership and escrow platform. Includes an admin backend for managing inventory and a customer-facing storefront with secure escrow services for both dealership and private vehicle sales. Built with React, TypeScript, Express, and PostgreSQL (Neon).

## Admin Access
- **URL**: `/admin/login`
- **Email**: `admin@autopro.com`
- **Password**: `admin123`

## Technology Stack
- **Frontend**: React 18, TypeScript, Wouter (routing), TanStack Query v5
- **Styling**: Tailwind CSS, Shadcn UI components
- **Build Tool**: Vite
- **Backend**: Express.js
- **Database**: PostgreSQL via Neon (neon-serverless WebSocket driver + Drizzle ORM)
- **Email**: Gmail via Replit connector SDK

## Key Routes (Customer)
- `/` — Home page with hero, featured vehicles, statistics
- `/inventory` — Full vehicle inventory with search/filter/sort
- `/vehicle/:id` — Vehicle detail page + escrow purchase dialog
- `/escrow` — Custom escrow for private vehicle sales
- `/track/:guestToken` — Buyer transaction tracking + payment proof upload
- `/seller/:token` — Seller accept/reject via one-click email link

## Key Routes (Admin)
- `/admin/login` — Admin login
- `/admin/dashboard` — Overview
- `/admin/vehicles` — Manage inventory
- `/admin/vehicles/new` — Add vehicle (FormData upload with multer)
- `/admin/vehicles/:id/edit` — Edit vehicle + manage images
- `/admin/transactions` — Manage escrow transactions (set bank/crypto payment, update status)
- `/admin/chat` — Live Chat inbox (view/reply to visitor conversations)

## Database Schema
- **users**: Admin and customer accounts
- **vehicles**: Dealership inventory (available, featured, condition, price, etc.)
- **vehicle_images**: Multiple images per vehicle (primary + gallery)
- **vehicle_offers**: Promotional pricing/discounts
- **transactions**: Escrow purchases (guest checkout, seller info, payment fields)
- **transaction_events**: Audit trail for status changes
- **chat_messages**: Live chat messages (sessionId, senderType visitor/admin, visitorName, visitorEmail, message, read)

## Escrow Process (7 Steps)
1. **Initiated** — Customer submits purchase form
2. **Awaiting Admin Approval** — Admin reviews
3. **Awaiting Payment Confirmation** — Admin sets bank/crypto info, buyer gets payment instructions email
4. **In Transit** — Vehicle shipped
5. **Inspection** — Buyer inspects (1–5 days, buyer-selected)
6. **Approved** — Buyer approves
7. **Released** — Payment released to seller

## Email Integration
Uses Gmail via Replit connector (connection ID: `conn_google-mail_01KP5JM9NKTQ18FP2T2Z6SNGM4`).
Sends base64url-encoded RFC 2822 messages via `connectors.proxy('google-mail', ...)`.

Email events:
- Transaction initiated → buyer confirmation with tracking link
- Seller notification → one-click accept/reject link (GET route, branded HTML page)
- Payment instructions → bank details or crypto address to buyer
- Buyer payment received → confirmation when proof submitted
- Status updates → various stages

## Key Technical Notes

### DB Driver
Using `drizzle-orm/neon-serverless` with `Pool` (WebSocket). **Do NOT switch back to `neon-http`** — the HTTP driver has a known bug where it misreads PostgreSQL boolean (`t`/`f`) as `false` and timestamps as `null`.

### Vehicle Image Upload
Admin vehicle form uses `FormData` (not JSON) for submission, because the route uses `multer` middleware (`upload.array('images', 10)`) for image handling. The route is at `POST /api/admin/vehicles`.

### Guest Token Model
Buyers don't need an account. They get a `guestToken` UUID after initiating a transaction, which is used to track their escrow at `/track/:guestToken`.

### Seller Token Model
Sellers get a `sellerToken` UUID in their notification email. The `/seller/:token/accept` and `/seller/:token/reject` routes (GET) show branded HTML confirmation pages — no password required.

### URL Resolution
`getBaseUrl()` in `server/email.ts` uses `process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN` for constructing email links.

### Null Safety
Several storage methods have `?? []` or `(result ?? [])[0]` guards for the Neon driver occasionally returning null instead of empty arrays.

## Project Structure
```
client/src/
  pages/
    Home.tsx              # Landing page
    Inventory.tsx         # Full vehicle browse with search/filter
    VehicleDetail.tsx     # Car detail + purchase escrow dialog
    TransactionTracking.tsx  # Buyer tracking page
    SellerAction.tsx      # Seller accept/reject (redirect to GET API)
    AdminLogin.tsx
    adminEscrow.tsx       # Custom escrow form
    admin/
      Dashboard.tsx
      Vehicles.tsx
      VehicleForm.tsx     # Add/edit vehicle (FormData submission)
      Transactions.tsx    # Admin transaction management
      Chat.tsx            # Admin live chat inbox + reply panel
  components/
    Header.tsx            # Nav: HOME, VEHICLES (/inventory), ESCROW, CONTACT
    Footer.tsx
    LiveChat.tsx          # Floating live chat widget (replaces WhatsApp)
    HeroSlider.tsx
    FeaturedVehicles.tsx  # Shows featured vehicles, "VIEW ALL" → /inventory
    VehicleCard.tsx       # Links to /vehicle/:id
    VehicleSearchBar.tsx
    SpecialOffers.tsx
    StatisticsSection.tsx
    admin/AdminLayout.tsx

server/
  routes.ts   # All API routes
  storage.ts  # PostgresStorage class (IStorage interface)
  db.ts       # Neon WebSocket Pool connection
  email.ts    # Gmail email sending
  index.ts

shared/
  schema.ts   # Drizzle schema + Zod insert schemas
```
