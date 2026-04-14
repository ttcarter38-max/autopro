# AutoPro — Full Rebuild Specification

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
- **Brand name**: AUTOPRO (bold, all caps in header)
- **Primary color**: Red (HSL ~0 72% 51%) — used for accents, buttons, badges
- **Background**: Dark theme — black header, dark backgrounds
- **Font**: Use a bold heading font (e.g., system-ui or import a bold sans-serif)
- **Design**: Automotive/performance aesthetic — bold, high contrast

---

## Database Schema (shared/schema.ts)

### users
```
id: serial PK
email: text unique not null
password: text not null  
name: text not null
role: text default 'admin'
createdAt: timestamp defaultNow()
```
Seed one admin user: email=`admin@autopro.com`, password=`admin123` (store as bcrypt hash)

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
Seed 5-6 vehicles with Unsplash image URLs (mix of luxury cars — Tesla, Porsche, BMW, Ferrari, Lamborghini). Set `featured=true` on 3 of them.

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
vehicleDescription: text  (for custom type)
vehicleValue: decimal(10,2)
buyerName: text not null
buyerEmail: text not null
buyerPhone: text
shippingAddress: text
inspectionPeriod: integer default 3  (days: 1, 3, or 5)
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
paymentProofUrl: text  (buyer uploads screenshot/PDF)
sellerName: text  (for custom/private sales)
sellerEmail: text
sellerToken: text unique  (UUID, for seller accept/reject link)
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
- `POST /api/auth/login` — email+password → set session, return user
- `POST /api/auth/logout` — destroy session
- `GET /api/auth/me` — return session user or 401

### Vehicles (public)
- `GET /api/vehicles` — all available vehicles (available=true) with primary image
- `GET /api/vehicles/featured` — featured=true AND available=true with primary image
- `GET /api/vehicles/:id` — single vehicle + all images + active offer

### Vehicle Offers (public)
- `GET /api/vehicles/:id/offer` — get active offer for vehicle

### Admin — Vehicles (require isAdmin middleware)
- `GET /api/admin/vehicles` — all vehicles (including unavailable)
- `POST /api/admin/vehicles` — create vehicle (multer: `upload.array('images', 10)`)
- `PATCH /api/admin/vehicles/:id` — update vehicle (multer: `upload.array('images', 10)`)
- `DELETE /api/admin/vehicles/:id` — delete vehicle
- `POST /api/admin/vehicles/:vehicleId/images` — upload single image (multer: `upload.single('image')`)
- `DELETE /api/admin/vehicles/:vehicleId/images/:imageId` — delete image
- `PATCH /api/admin/vehicles/:vehicleId/images/:imageId/primary` — set primary

### Transactions
- `POST /api/transactions` — create transaction (guest, no auth required), returns guestToken
- `GET /api/transactions/track/:guestToken` — buyer tracking by token
- `GET /api/transactions/:id` — get transaction (admin only)
- `GET /api/admin/transactions` — all transactions (admin only)
- `PATCH /api/admin/transactions/:id` — update transaction status/payment info (admin only)
- `GET /api/seller/:token/accept` — seller accept (returns HTML confirmation page)
- `GET /api/seller/:token/reject` — seller reject (returns HTML confirmation page)
- `POST /api/transactions/:id/payment-proof` — buyer uploads payment proof (multer: `upload.single('proof')`)

---

## Customer Pages

### `/` — Home
- **Header**: sticky black bar, AUTOPRO logo (links to /), nav: HOME, VEHICLES (→/inventory), ESCROW (→/escrow), CONTACT (→ scroll to footer). Right side: "Browse All" button
- **Hero Slider**: 3 auto-rotating slides (5s), each with a background image + dark gradient overlay, eyebrow text, large heading, subtext, 2 CTA buttons. Left/right arrow controls + dot indicators
- **Featured Vehicles**: Grid of featured vehicles from `/api/vehicles/featured`. Each card shows image, name, price, condition badge, "VIEW DETAILS" button → `/vehicle/:id`
- **Statistics Section**: 3-4 stats (e.g., "500+ Vehicles Sold", "10+ Years Experience", "100% Secure Escrow")
- **Footer** (id="footer-contact"): Logo, nav links, contact info placeholder

### `/inventory` — Vehicle Inventory
- Search bar (filters by name/make/model)
- Condition filter dropdown (All / New / Used)
- Price filter dropdown (All / Under $50k / $50k-$100k / Over $100k)
- Sort dropdown (Newest / Price Low-High / Price High-Low)
- Active filter chips showing applied filters with X to remove
- Results count ("X vehicles found")
- Responsive grid of vehicle cards
- Each card: image (or placeholder), name, price, condition badge, mileage, color, "VIEW DETAILS" button → `/vehicle/:id`

### `/vehicle/:id` — Vehicle Detail
- Large image gallery (primary image large, thumbnails below)
- Vehicle specs: year, condition, mileage, color, transmission, top speed, description
- Price display
- "Start Escrow" button → opens dialog to initiate purchase
- Escrow purchase dialog: collect buyerName, buyerEmail, buyerPhone, shippingAddress, inspectionPeriod (1/3/5 days). On submit → POST /api/transactions → show tracking token to user

### `/escrow` — Custom Escrow (private sales)
- Explains the escrow process (7 steps)
- Form to start a custom escrow: buyerName, buyerEmail, buyerPhone, sellerName, sellerEmail, vehicleDescription, vehicleValue, shippingAddress, inspectionPeriod
- On submit → POST /api/transactions (type='custom')

### `/track/:guestToken` — Buyer Transaction Tracking
- Shows transaction status with a visual step indicator (all 7 steps)
- Shows current status, vehicle info, payment instructions (if set by admin)
- If status is `awaiting_payment` and payment method set: show bank details OR crypto address
- Payment proof upload section: file input → POST /api/transactions/:id/payment-proof
- Timeline of transaction events

### `/seller/:token` — Seller Action
- This is a redirect: the frontend should just immediately call the GET API route `/api/seller/:token/accept` or `/api/seller/:token/reject`
- The server returns a branded HTML page (not JSON) — full HTML with AutoPro styling confirming acceptance or rejection

---

## Admin Pages (all require admin session)

### `/admin/login`
- Simple email + password form
- On success → redirect to /admin/dashboard

### `/admin/dashboard`
- Stats cards: total vehicles, total transactions, transactions by status
- Recent transactions list

### `/admin/vehicles`
- Table of all vehicles: name, make/model, year, price, condition badge, available badge
- Edit button (→ /admin/vehicles/:id/edit) and Delete button (with confirmation dialog)
- "Add Vehicle" button → /admin/vehicles/new

### `/admin/vehicles/new` and `/admin/vehicles/:id/edit` — VehicleForm
- **IMPORTANT**: Use `FormData` (not JSON) for form submission — the route uses multer middleware
- Fields: name, make, model, year, condition (select), price, mileage, color, transmission (select: Automatic/Manual/CVT), topSpeed, description, featured (toggle), available (toggle)
- **Vehicle Photos section** — visible on BOTH create AND edit:
  - Click-to-upload zone (label wrapping hidden file input)
  - Multiple file selection (accept="image/*")
  - Show local previews of selected files marked as "Pending"
  - After vehicle is saved, upload pending files one-by-one to `POST /api/admin/vehicles/:vehicleId/images`
  - Show saved images as thumbnails with hover controls: set as primary (star icon), delete (X icon)
  - First image uploaded automatically becomes primary

### `/admin/transactions`
- Table/list of all transactions with status badges
- Click to expand a transaction and see full details
- Admin can:
  - Change status (dropdown through all 7 steps)
  - Set payment method: bank (bankName, bankAccount, bankRouting, bankInstructions) OR crypto (cryptoCurrency, cryptoAddress, cryptoNetwork)
  - Add admin notes
  - All changes trigger appropriate emails

---

## Escrow Workflow (7 Steps)
1. **initiated** — Customer submitted the form
2. **awaiting_approval** — Admin reviews (admin manually moves here)
3. **awaiting_payment** — Admin has set payment details, buyer gets instructions email
4. **in_transit** — Vehicle shipped
5. **inspection** — Buyer has X days to inspect
6. **approved** — Buyer approved
7. **released** — Payment released to seller

---

## Email System (Gmail via Replit connector)

Use the Google Mail Replit integration. Send emails using the connector proxy:
```typescript
await connectors.proxy('google-mail', {
  method: 'POST',
  path: '/gmail/v1/users/me/messages/send',
  body: { raw: base64urlEncodedRfc2822Message }
});
```

Build RFC 2822 messages (with From, To, Subject, MIME-Version, Content-Type headers) and encode them as base64url.

### Emails to send:
1. **Transaction initiated** → buyer: confirmation with their tracking link (`/track/[guestToken]`)
2. **Seller notification** (for custom/private sales) → seller: one-click accept link (`/api/seller/[sellerToken]/accept`) and reject link
3. **Payment instructions** (when admin sets payment and moves to awaiting_payment) → buyer: bank details OR crypto address
4. **Payment proof received** → buyer: confirmation that proof was received
5. **Status updates** → buyer email when status changes

For the seller accept/reject routes, return full styled HTML pages (not JSON redirects).

---

## Floating WhatsApp Button
Add a fixed-position green circular button at bottom-right of every page:
```tsx
import { SiWhatsapp } from 'react-icons/si';
// In App.tsx, outside Router but inside providers:
<a href="https://wa.me/YOURNUMBER?text=Hello" target="_blank"
   style={{ backgroundColor: '#25D366' }}
   className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg">
  <SiWhatsapp className="w-7 h-7 text-white" />
</a>
```

---

## Critical Technical Rules (avoid these bugs)

### 1. DB Driver — MANDATORY
```typescript
// server/db.ts — use neon-serverless (WebSocket), NOT neon-http
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```
The HTTP driver silently returns `false` for all booleans and `null` for all timestamps. This breaks everything.

### 2. apiRequest signature
The helper function signature must be `apiRequest(method: string, url: string, data?: unknown)` — method FIRST, url second. Never call it as `apiRequest(url, { method })`.

### 3. Vehicle form submission
The vehicle create/edit routes use `multer` middleware, so they expect `multipart/form-data`, NOT `application/json`. The form must use `fetch()` with a `FormData` body — never use `apiRequest()` for these routes.

### 4. Null safety on DB queries
Neon can return null instead of [] on some queries. Always add `?? []` fallback:
```typescript
const result = await db.select()...;
return result ?? [];
```

### 5. TanStack Query v5 syntax
Use object form only:
```typescript
// CORRECT:
useQuery({ queryKey: ['/api/vehicles'], queryFn: ... })
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
// Serve uploads:
app.use('/uploads', express.static('uploads'));
```

### 7. Admin auth middleware
```typescript
function isAdmin(req, res, next) {
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

### 9. Boolean parsing from FormData
When parsing boolean fields from `req.body` (FormData sends everything as strings):
```typescript
featured: req.body.featured === 'true',
available: req.body.available !== 'false',
```

---

## File Structure
```
client/src/
  App.tsx                     ← Routes + WhatsApp floating button
  pages/
    Home.tsx
    Inventory.tsx             ← Search, filter, sort, vehicle grid
    VehicleDetail.tsx         ← Vehicle detail + escrow purchase dialog
    Escrow.tsx                ← Custom escrow form + info
    TransactionTracking.tsx   ← Buyer tracking page
    SellerAction.tsx          ← Triggers seller accept/reject API
    AdminLogin.tsx
    not-found.tsx
    admin/
      Dashboard.tsx
      Vehicles.tsx            ← Vehicle list + delete confirmation
      VehicleForm.tsx         ← Create/edit vehicle + image upload
      Transactions.tsx        ← Admin transaction management
  components/
    Header.tsx
    Footer.tsx
    HeroSlider.tsx
    FeaturedVehicles.tsx
    VehicleCard.tsx
    StatisticsSection.tsx
    admin/AdminLayout.tsx     ← Sidebar nav for admin pages

server/
  index.ts                   ← Express setup, session, static files
  routes.ts                  ← All API routes
  storage.ts                 ← IStorage interface + PostgresStorage class
  db.ts                      ← Neon WebSocket pool
  email.ts                   ← Gmail email sending functions

shared/
  schema.ts                  ← Drizzle schema + Zod insert schemas
```

---

## Environment Variables Required
- `DATABASE_URL` — Neon PostgreSQL connection string
- `SESSION_SECRET` — random string for session signing
- `RESEND_API_KEY` — (optional, if using Resend instead of Gmail)

## Admin Credentials
- Email: `admin@autopro.com`
- Password: `admin123`

---

## Summary of All Features
- Browsable vehicle inventory with search, filter (condition, price), sort
- Vehicle detail pages with image gallery and escrow purchase form
- Custom escrow for private vehicle sales (no account needed)
- 7-step escrow workflow managed by admin
- Seller gets one-click accept/reject email link
- Buyer gets payment instructions via email (bank transfer OR cryptocurrency)
- Buyer uploads payment proof (screenshot/PDF)
- Admin sets all payment details and manages workflow from admin panel
- Admin CRUD for vehicle inventory with multi-image upload
- All emails sent via Gmail (or can use Resend as alternative)
- Floating WhatsApp contact button on all pages
- Mobile responsive design
- Black/red automotive theme
