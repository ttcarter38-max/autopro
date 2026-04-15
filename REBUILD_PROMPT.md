# AutoPro — Full Rebuild Specification (Current State)

## What to Build
A full-stack car dealership and escrow platform called **AutoPro**. It has two sides:
- A **customer-facing storefront** (browsable vehicle inventory + escrow transactions for buying/selling cars)
- An **admin backend** (manage inventory, handle transactions, set payment info)

No customer accounts required — buyers and sellers use guest tokens received by email.

---

## Tech Stack (use exactly this)

- **Frontend**: React 18 + TypeScript, Wouter (routing), TanStack Query v5, Shadcn UI, Tailwind CSS, Lucide React (icons), react-icons (for WhatsApp icon)
- **Backend**: Express.js (TypeScript), Multer (file uploads), Express-session
- **Database**: PostgreSQL via Neon — use `drizzle-orm/neon-serverless` with `Pool` (WebSocket). **NEVER use `neon-http`** — it misreads boolean and timestamp columns.
- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation
- **Email**: Gmail via Replit connector SDK (google-mail integration)
- **File uploads**: Multer storing to `uploads/` folder, served as `/uploads/` static files
- **Build**: Vite (frontend) + tsx (backend dev server), same port 5000

---

## Color Theme & Branding

- **Brand name**: AUTOPRO (bold, all caps in header — links to `/`)
- **Primary color**: Red (`hsl(0 72% 51%)`) — used for buttons, badges, accents, eyebrow text
- **Background**: Near-black/dark background with light text in dark mode; white/light in light mode
- **Header**: Sticky black bar (`bg-black text-white`), no phone number in header
- **Font**: Bold heading font — use a tall, wide, extrabold sans-serif for hero headings
- **Design**: Automotive/performance aesthetic — bold, high contrast, clean

### index.css color variables (HSL, space-separated, no hsl() wrapper):
```css
--primary: 0 72% 51%;        /* red */
--primary-foreground: 0 0% 100%;
--background: 0 0% 100%;
--foreground: 0 0% 9%;
--muted: 0 0% 96%;
--muted-foreground: 0 0% 45%;
--card: 0 0% 100%;
--border: 0 0% 89%;
```

---

## Database Schema (`shared/schema.ts`)

### users
```
id: serial PK
email: text unique not null
password: text not null
name: text not null
role: text default 'admin'
createdAt: timestamp defaultNow()
```
Seed one admin: `admin@autopro.com` / `admin123` (bcrypt hashed)

### vehicles
```
id: serial PK
name: text not null
make: text not null
model: text not null
year: integer not null
condition: text not null  ('new' or 'used')
price: decimal(10,2) not null
mileage: integer default 0
color: text not null
transmission: text not null
topSpeed: text
description: text
featured: boolean default false
available: boolean default true
createdAt: timestamp defaultNow()
updatedAt: timestamp defaultNow()
```
Seed 6 vehicles (mix of Tesla, Porsche, BMW, Ferrari, Lamborghini, Mercedes). Set `featured=true` on 3. Use Unsplash image URLs for seed data.

### vehicle_images
```
id: serial PK
vehicleId: integer FK → vehicles.id (cascade delete)
imageUrl: text not null
isPrimary: boolean default false
displayOrder: integer default 0
```

### vehicle_offers
```
id: serial PK
vehicleId: integer FK → vehicles.id (cascade delete)
originalPrice: decimal(10,2)
salePrice: decimal(10,2)
label: text
active: boolean default true
expiresAt: timestamp
```

### transactions
```
id: serial PK
guestToken: text unique not null (UUID)
type: text not null  ('dealership' or 'custom')
vehicleId: integer FK → vehicles.id (nullable, for dealership type)
vehicleDescription: text  (for custom type — stored as customVehicleDescription in POST body but mapped to vehicleDescription)
vehicleValue: decimal(10,2)  (stored as `amount` in POST body, mapped to vehicleValue)
buyerName: text not null
buyerEmail: text not null
buyerPhone: text
shippingAddress: text
inspectionPeriod: integer default 3  (days)
status: text default 'initiated'
  (values: initiated → awaiting_approval → awaiting_payment → in_transit → inspection → approved → released)
paymentMethod: text  ('bank' or 'crypto')
bankName: text
bankAccount: text
bankRouting: text
bankInstructions: text
cryptoCurrency: text
cryptoAddress: text
cryptoNetwork: text
paymentProofUrl: text
sellerName: text
sellerEmail: text
sellerToken: text unique  (UUID)
sellerAccepted: boolean
adminNotes: text
createdAt: timestamp defaultNow()
updatedAt: timestamp defaultNow()
```

### transaction_events
```
id: serial PK
transactionId: integer FK → transactions.id
eventType: text not null
description: text
createdAt: timestamp defaultNow()
```

---

## API Routes

### Auth
- `POST /api/auth/login` — email+password → set `req.session.userId`, return user object
- `POST /api/auth/logout` — destroy session
- `GET /api/auth/me` — return session user or 401

### Vehicles (public)
- `GET /api/vehicles` — all vehicles where `available=true`, include primary image URL
- `GET /api/vehicles/featured` — vehicles where `featured=true AND available=true`, include primary image URL
- `GET /api/vehicles/:id` — single vehicle + all images + active offer

### Vehicle Offers (public)
- `GET /api/vehicles/:id/offer` — active offer for vehicle

### Admin — Vehicles (require `isAdmin` middleware)
- `GET /api/admin/vehicles` — all vehicles including unavailable
- `POST /api/admin/vehicles` — create vehicle (`upload.array('images', 10)` multer)
- `PATCH /api/admin/vehicles/:id` — update vehicle (`upload.array('images', 10)` multer)
- `DELETE /api/admin/vehicles/:id` — delete vehicle
- `POST /api/admin/vehicles/:vehicleId/images` — upload single image (`upload.single('image')`)
- `DELETE /api/admin/vehicles/:vehicleId/images/:imageId` — delete image record + file
- `PATCH /api/admin/vehicles/:vehicleId/images/:imageId/primary` — set as primary (unsets others)

### Transactions
- `POST /api/transactions/custom` — create custom escrow (guest, no auth). Body: `{ customVehicleDescription, amount, buyerName, buyerEmail, buyerPhone, shippingAddress, inspectionDays, sellerEmail?, sellerName? }`. Returns `{ id, guestToken }`.
- `POST /api/transactions` — create dealership escrow. Body: `{ vehicleId, buyerName, buyerEmail, buyerPhone, shippingAddress, inspectionPeriod }`. Returns `{ id, guestToken }`.
- `GET /api/transactions/track/:guestToken` — buyer tracking by token
- `GET /api/admin/transactions` — all transactions (admin only)
- `PATCH /api/admin/transactions/:id` — update status/payment/notes (admin only)
- `GET /api/seller/:token/accept` — seller accepts; returns full HTML page
- `GET /api/seller/:token/reject` — seller rejects; returns full HTML page
- `POST /api/transactions/:id/payment-proof` — buyer uploads payment proof (`upload.single('proof')`)

---

## Customer Pages

### `/` — Home
**Header** (`components/Header.tsx`):
- Sticky, `bg-black text-white`
- Left: "AUTOPRO" bold text logo (links to `/`)
- Center nav: HOME → `/`, VEHICLES → `/inventory`, ESCROW → `/escrow`, CONTACT → `#footer-contact` (scroll anchor)
- Right: "Browse All" red button → `/inventory`
- No phone number anywhere in the header

**Hero Slider** (`components/HeroSlider.tsx`):
- 3 slides, auto-rotate every 5 seconds
- Left/right arrow controls (semi-transparent, backdrop-blur, rounded-full)
- Dot indicators at bottom (active dot stretches wider with red color)
- **CRITICAL**: All slides render simultaneously as `absolute inset-0` with opacity transitions. Inactive slides MUST have `pointer-events-none` — otherwise their invisible buttons block clicks on the active slide.

Slide 1 — Truck/Transport:
- Background: uploaded car carrier truck PNG (`@assets/8872a0c0-1aeb-4ad3-a144-7f94de3ad2d5_1776239408426.png`)
- Gradient: `linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)`
- Eyebrow: "NATIONWIDE VEHICLE TRANSPORT" (red, bold, tracked)
- Heading: "YOUR CAR. DELIVERED." (white, 5xl-7xl, extrabold)
- Sub: "Secure door-to-door auto transport across the country"
- CTA 1: "START ESCROW" → `/escrow` (red button)
- CTA 2: "BROWSE VEHICLES" → `/inventory` (outline, semi-transparent)

Slide 2 — Dealership/Escrow:
- Background: uploaded dealership PNG (`@assets/be14b73b-d8b1-4252-8d28-cacc0d9b235e_1776239412239.png`)
- Gradient: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55))`
- Eyebrow: "TRUSTED ESCROW SERVICE"
- Heading: "BUY & SELL WITH CONFIDENCE"
- Sub: "Our escrow protects both buyer and seller every step of the way"
- CTA 1: "HOW IT WORKS" → `/escrow` (red button)
- CTA 2: "BROWSE VEHICLES" → `/inventory`

Slide 3 — Luxury Car:
- Background: `https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80`
- Gradient: `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.65) 100%)`
- Eyebrow: "PREMIUM INVENTORY"
- Heading: "FIND YOUR DREAM CAR"
- Sub: "Browse our curated selection of luxury and performance vehicles"
- CTA 1: "VIEW INVENTORY" → `/inventory`
- CTA 2: "BROWSE VEHICLES" → `/inventory`

**Featured Vehicles** (`components/FeaturedVehicles.tsx`):
- Section heading: "Featured Vehicles" with red accent line
- Fetches from `/api/vehicles/featured`
- Grid of vehicle cards (VehicleCard component)
- Each card: primary image, vehicle name, price, condition badge, "VIEW DETAILS" button → `/vehicle/:id`

**Statistics Section** (`components/StatisticsSection.tsx`):
- Dark background section
- 3-4 stat blocks: e.g., "500+ Vehicles Sold", "10+ Years Experience", "100% Secure Escrow", "24/7 Support"

**Footer** (`components/Footer.tsx`):
- `id="footer-contact"` on the footer element (for CONTACT nav link anchor)
- Logo, nav links, contact placeholder info

---

### `/inventory` — Vehicle Inventory
- Search bar: filters name/make/model (client-side)
- Condition filter: All / New / Used
- Price filter: All / Under $50k / $50k–$100k / Over $100k
- Sort: Newest / Price Low–High / Price High–Low
- Active filter chips with X to remove each
- Results count ("X vehicles found")
- Responsive card grid — uses VehicleCard component

---

### `/vehicle/:id` — Vehicle Detail
- Large image gallery: primary image large, thumbnails clickable below
- Full vehicle specs: year, condition, mileage, color, transmission, topSpeed, description
- Price with sale price if active offer exists
- "Start Escrow" button opens a dialog
- Dialog form: buyerName, buyerEmail, buyerPhone, shippingAddress, inspectionPeriod (select: 1/3/5 days)
- On submit → `POST /api/transactions` → redirect to `/track/[guestToken]`

---

### `/escrow` — Escrow Services Page

**Section order (top to bottom):**
1. **Hero** — Shield icon, "Secure Vehicle Escrow Services", two CTA buttons
2. **How Escrow Works** — Tabs: "For Buyers" (8-step grid cards) + "For Sellers" (4-step list)
3. **Start a Custom Escrow Transaction** — form (bg-muted background)
4. **Track Your Transaction** — token/ID input → navigate to `/track/:token`
5. **Why Choose Our Escrow Service?** — 3 feature cards (bg-muted)

**Custom Escrow Form fields:**
- Vehicle Description (textarea, min 10 chars)
- Purchase Price ($)
- Buyer: Full Name, Email, Phone
- Seller (optional): Name, Email
- Shipping Address (textarea)
- Inspection Period (select: 1/2/3/4/5 days, default 3)
- Submit → `POST /api/transactions/custom` → redirect to `/track/[guestToken]`

---

### `/track/:guestToken` — Buyer Transaction Tracking
- Visual 7-step status bar (initiated → awaiting_approval → awaiting_payment → in_transit → inspection → approved → released)
- Current step highlighted
- Vehicle/transaction details
- If status = `awaiting_payment` and payment method set: show bank details OR crypto address
- Payment proof upload (only shown when appropriate status): file input → `POST /api/transactions/:id/payment-proof`
- Timeline of transaction_events

---

### `/seller/:token` — Seller Action Page
- This page immediately calls the backend API based on path
- Accept path: the server route `GET /api/seller/:token/accept` returns a full branded HTML page (not JSON)
- Reject path: the server route `GET /api/seller/:token/reject` returns a full branded HTML page

---

## Admin Pages (all protected by session — redirect to `/admin/login` if not authenticated)

### `/admin/login`
- Simple card: email + password form
- On success → redirect to `/admin/dashboard`

### `/admin/dashboard`
- Stats cards: total vehicles, total transactions, counts by status
- Recent transactions list with status badges

### `/admin/vehicles` — Vehicle List
- Table: name, make/model, year, price, condition badge, available badge
- Edit button → `/admin/vehicles/:id/edit`
- Delete button → confirmation dialog → `DELETE /api/admin/vehicles/:id`
- "Add Vehicle" button → `/admin/vehicles/new`

### `/admin/vehicles/new` and `/admin/vehicles/:id/edit` — VehicleForm

**IMPORTANT**: These routes use multer — form must submit as `multipart/form-data` using raw `fetch()` with a `FormData` object. Never use `apiRequest()` for these routes.

**Form fields:**
- name, make, model, year, condition (select: new/used), price, mileage, color
- transmission (select: Automatic/Manual/CVT)
- topSpeed, description
- featured (boolean toggle/switch)
- available (boolean toggle/switch)

**Vehicle Photos section** — visible on BOTH create AND edit:
- Click-to-upload zone (styled label wrapping hidden `<input type="file" multiple accept="image/*">`)
- Shows local file previews marked "Pending" before upload
- After vehicle save, uploads pending files one-by-one to `POST /api/admin/vehicles/:vehicleId/images`
- Shows saved images as thumbnails with hover controls:
  - Star icon → set as primary (`PATCH .../images/:imageId/primary`)
  - X icon → delete image (`DELETE .../images/:imageId`)
- Primary image marked with star indicator

### `/admin/transactions` — Transaction Management
- List of all transactions with status badges
- Expandable/clickable rows to see full details
- Admin controls per transaction:
  - Status dropdown (all 7 statuses)
  - Payment method: bank (bankName, bankAccount, bankRouting, bankInstructions) OR crypto (cryptoCurrency, cryptoAddress, cryptoNetwork)
  - Admin notes textarea
  - Save button → `PATCH /api/admin/transactions/:id`
  - Status changes trigger appropriate emails

---

## Admin Layout (`components/admin/AdminLayout.tsx`)
- Sidebar navigation with links: Dashboard, Vehicles, Transactions
- AUTOPRO logo/branding in sidebar header
- Logout button
- Wraps all admin pages

---

## Escrow Workflow (7 Statuses)
1. **initiated** — Customer submitted the form; buyer gets confirmation email
2. **awaiting_approval** — Admin reviewing
3. **awaiting_payment** — Admin set payment details; buyer gets payment instructions email
4. **in_transit** — Vehicle shipped
5. **inspection** — Buyer inspecting vehicle for X days
6. **approved** — Buyer approved
7. **released** — Payment released to seller

---

## Email System (Gmail via Replit connector)

```typescript
// server/email.ts
import { connectors } from '@replit/agent-sdk';  // or equivalent Replit connector import

async function sendEmail(to: string, subject: string, htmlBody: string) {
  const message = [
    `From: AutoPro <noreply@autopro.com>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    htmlBody,
  ].join('\r\n');

  const encoded = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await connectors.proxy('google-mail', {
    method: 'POST',
    path: '/gmail/v1/users/me/messages/send',
    body: { raw: encoded },
  });
}
```

### Emails sent:
1. **Transaction initiated** → buyer: "Your escrow transaction #[id] has been initiated. Track it at [URL]/track/[guestToken]"
2. **Seller notification** (custom escrow with sellerEmail) → seller: one-click accept link `/api/seller/[sellerToken]/accept` and reject link `/api/seller/[sellerToken]/reject`
3. **Payment instructions** (status → awaiting_payment) → buyer: full bank details OR crypto address
4. **Payment proof received** → buyer: "We've received your payment proof"
5. **Status updates** → buyer: email when status changes at each step

Seller accept/reject routes return full styled HTML pages (not JSON).

---

## Floating WhatsApp Button (in `App.tsx`, always visible)

```tsx
import { SiWhatsapp } from 'react-icons/si';

const WHATSAPP_NUMBER = '1234567890'; // replace with real number

// Outside <Router>, inside providers:
<a
  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%2C%20I%27m%20interested%20in%20a%20vehicle`}
  target="_blank"
  rel="noopener noreferrer"
  data-testid="button-whatsapp"
  style={{ backgroundColor: '#25D366' }}
  className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
>
  <SiWhatsapp className="w-7 h-7 text-white" />
</a>
```

---

## Critical Technical Rules (avoid these bugs)

### 1. DB Driver — MANDATORY
```typescript
// server/db.ts — ALWAYS use neon-serverless (WebSocket Pool), NEVER neon-http
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```
The HTTP driver silently returns `false` for ALL booleans and `null` for ALL timestamps.

### 2. apiRequest signature
```typescript
// CORRECT — method first, URL second:
apiRequest('DELETE', `/api/admin/vehicles/${id}`)
apiRequest('POST', '/api/transactions', data)
// WRONG:
apiRequest(`/api/admin/vehicles/${id}`, { method: 'DELETE' })
```

### 3. Vehicle form must use FormData + fetch
```typescript
// CORRECT — multer expects multipart/form-data:
const formData = new FormData();
formData.append('name', values.name);
// ... append all fields ...
await fetch('/api/admin/vehicles', { method: 'POST', body: formData });

// WRONG — sends JSON, multer can't parse it:
await apiRequest('POST', '/api/admin/vehicles', values);
```

### 4. Null safety on DB queries
```typescript
const result = await db.select().from(vehicles).where(...);
return result ?? [];  // Always add ?? [] fallback
```

### 5. TanStack Query v5 — object form only
```typescript
// CORRECT:
useQuery({ queryKey: ['/api/vehicles'], queryFn: async () => ... })
// WRONG:
useQuery(['/api/vehicles'], fetchFn)
```

### 6. Multer setup
```typescript
import multer from 'multer';
import path from 'path';
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
app.use('/uploads', express.static('uploads'));
```

### 7. Admin auth middleware
```typescript
function isAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}
```

### 8. Session setup
```typescript
import session from 'express-session';
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));
```

### 9. Boolean parsing from FormData (strings from multipart)
```typescript
// FormData sends booleans as strings — parse explicitly:
featured: req.body.featured === 'true',
available: req.body.available !== 'false',
```

### 10. Hero slider pointer events
```tsx
// Inactive slides MUST have pointer-events-none — otherwise invisible slides block clicks:
className={`absolute inset-0 transition-opacity duration-700 ${
  index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
}`}
```

### 11. getBaseUrl for email links
```typescript
function getBaseUrl(): string {
  const domain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
  return domain ? `https://${domain.split(',')[0]}` : 'http://localhost:5000';
}
```

### 12. Featured vehicles route ordering
Register `GET /api/vehicles/featured` BEFORE `GET /api/vehicles/:id`, otherwise `:id` matches the string "featured".

---

## File Structure
```
client/src/
  App.tsx                        ← Routes + WhatsApp floating button
  pages/
    Home.tsx                     ← Hero, featured vehicles, stats, footer
    Inventory.tsx                ← Search, filter, sort, vehicle grid
    VehicleDetail.tsx            ← Vehicle detail + escrow purchase dialog
    Escrow.tsx                   ← Custom escrow page (How It Works first, form second)
    TransactionTracking.tsx      ← Buyer tracking page
    SellerAction.tsx             ← Triggers seller accept/reject API
    AdminLogin.tsx               ← Admin login page
    not-found.tsx
    admin/
      Dashboard.tsx
      Vehicles.tsx               ← Vehicle list + delete confirmation dialog
      VehicleForm.tsx            ← Create/edit vehicle + image upload
      Transactions.tsx           ← Admin transaction management
  components/
    Header.tsx                   ← Sticky black header, no phone number
    Footer.tsx                   ← id="footer-contact", contact info
    HeroSlider.tsx               ← 3-slide auto-rotating hero
    FeaturedVehicles.tsx         ← Featured vehicle cards grid
    VehicleCard.tsx              ← Reusable vehicle card
    StatisticsSection.tsx        ← Stats in dark section
    SpecialOffers.tsx
    VehicleSearchBar.tsx
    admin/AdminLayout.tsx        ← Sidebar nav for all admin pages

server/
  index.ts                       ← Express setup, session, static files, multer
  routes.ts                      ← All API routes
  storage.ts                     ← IStorage interface + PostgresStorage class
  db.ts                          ← Neon WebSocket pool (NEVER http)
  email.ts                       ← Gmail email sending via Replit connector
  auth.ts                        ← bcrypt password utilities
  seed.ts                        ← Admin user + vehicle seed data

shared/
  schema.ts                      ← Drizzle schema + Zod insert schemas + types
```

---

## Environment Variables
- `DATABASE_URL` — Neon PostgreSQL connection string (already configured)
- `SESSION_SECRET` — random string for session signing (already configured)
- `RESEND_API_KEY` — not used (Gmail connector used instead)

## Admin Credentials
- URL: `/admin/login`
- Email: `admin@autopro.com`
- Password: `admin123`

---

## Feature Summary
- Browsable vehicle inventory with search, filter (condition, price), sort
- Vehicle detail pages with image gallery and inline escrow purchase dialog
- Custom escrow page for private vehicle sales (no account required)
- 7-step escrow workflow managed entirely by admin
- Seller gets one-click accept/reject link via email
- Buyer gets payment instructions via email (bank transfer OR cryptocurrency)
- Buyer uploads payment proof (screenshot or PDF)
- Admin manages all transaction steps and payment details from admin panel
- Admin CRUD for vehicle inventory with multi-image upload, primary image selection
- All transactional emails sent via Gmail (Replit google-mail connector)
- Floating WhatsApp contact button fixed at bottom-right on all pages
- Mobile-responsive design
- Black/red automotive theme (dark header, red primary, bold typography)
- No customer accounts — guest token system for tracking
