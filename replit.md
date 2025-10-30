# AutoPro - Car Dealership & Escrow Platform

## Project Overview
A full-featured car dealership and escrow platform similar to escrow.com. Includes an admin backend for managing inventory and a customer-facing storefront with secure escrow services for both dealership and private vehicle sales. Built with React, TypeScript, Express, and PostgreSQL.

## Features
- **Hero Slider**: Auto-rotating carousel showcasing featured vehicles
- **Vehicle Search**: Filter by make, model, and price range
- **Special Offers**: Highlighted vehicles with sale pricing
- **Featured Vehicles**: Tabbed interface for All Cars, New Cars, and Used Cars
- **Statistics Section**: Dealership metrics and call-to-action
- **Newsletter Signup**: Email subscription with validation
- **Mobile Responsive**: Optimized for all device sizes

## Technology Stack
- **Frontend**: React 18, TypeScript, Wouter (routing)
- **Styling**: Tailwind CSS, Shadcn UI components
- **Build Tool**: Vite
- **Backend**: Express.js (for development server)

## Project Structure
```
client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── HeroSlider.tsx
│   │   ├── VehicleCard.tsx
│   │   ├── VehicleSearchBar.tsx
│   │   ├── FeaturedVehicles.tsx
│   │   ├── SpecialOffers.tsx
│   │   ├── StatisticsSection.tsx
│   │   └── Footer.tsx
│   ├── data/
│   │   └── vehicles.ts   # Vehicle inventory data
│   ├── pages/
│   │   └── Home.tsx      # Main page
│   └── App.tsx
```

## Updating Vehicle Inventory

To add, edit, or remove vehicles from the website, edit the `client/src/data/vehicles.ts` file:

```typescript
export const vehicles: Vehicle[] = [
  {
    id: 1,
    name: 'Cayenne Turbo',
    make: 'Porsche',
    model: 'Cayenne',
    image: whiteSUV,  // Import your image
    price: 67200,
    originalPrice: 70000,  // Optional - for sale pricing
    rating: 4.5,
    ratingCount: 2136,
    condition: 'New',  // 'New' or 'Used'
    year: 2024,
    transmission: 'Automatic',
    color: 'White',
    topSpeed: '159 mph',
    featured: true,    // Shows in Featured Vehicles section
    special: true,     // Shows in Special Offers section
  },
  // Add more vehicles here...
];
```

### Adding Vehicle Images
1. Place your car images in `attached_assets/` folder
2. Import them at the top of `vehicles.ts`:
   ```typescript
   import myCarImage from '@assets/my-car-image.png';
   ```
3. Use the imported variable in the vehicle object

## Customization

### Updating Contact Information
Edit the following files:
- **Phone Number**: `client/src/components/Header.tsx` and `Footer.tsx`
- **Address**: `client/src/components/Footer.tsx`
- **Email**: `client/src/components/Footer.tsx`

### Changing Colors
The primary red accent color can be changed in `client/src/index.css`:
```css
--primary: 0 72% 51%;  /* HSL format: Hue Saturation% Lightness% */
```

### Updating Statistics
Edit the stats array in `client/src/components/StatisticsSection.tsx`

## Deployment to Web Hosting

### Building for Production
This website can be built as a static site and deployed to any hosting service like Namecheap, GoDaddy, or others:

1. **Build the production files**:
   ```bash
   npm run build
   ```
   This creates optimized files in the `dist/` folder.

2. **Upload to your hosting**:
   - Upload all files from the `dist/` folder to your hosting's public_html or www directory
   - Make sure the server is configured to serve the index.html file

3. **Configure your domain**:
   - Point your domain to your hosting service
   - Ensure the hosting supports Single Page Applications (SPA)
   - If needed, configure URL rewrites to redirect all requests to index.html

### Recommended Hosting Services
- **Namecheap**: Shared hosting with cPanel
- **Netlify**: Free tier with automatic deployments
- **Vercel**: Optimized for React applications
- **GitHub Pages**: Free static site hosting

## Development

### Running Locally
```bash
npm run dev
```
Access the site at http://localhost:5000

### Project Dependencies
- React, React DOM
- Tailwind CSS
- Shadcn UI Components
- Lucide React (icons)
- Wouter (routing)

## Key Features

### Customer Features
- **Browse Dealership Inventory**: View and filter available vehicles
- **Vehicle Detail Pages**: Comprehensive vehicle information with image galleries
- **Custom Escrow Transactions**: Start escrow for private vehicle sales
- **Transaction Tracking**: Track escrow status with guest tokens
- **Escrow Information Page**: Complete guide on how escrow works
- **Email Notifications**: Automated notifications for buyers and sellers

### Admin Features
- **Dashboard**: Overview of inventory and transactions
- **Vehicle Management**: Full CRUD operations for vehicle inventory
- **Image Upload**: Multi-image support with primary image selection
- **Special Offers**: Create promotional pricing
- **Transaction Management**: 7-step escrow workflow management
- **Bank Info Sharing**: Password-protected bank details for buyers

## Escrow Process (7 Steps)
1. **Initiated** - Customer submits purchase (dealership or custom)
2. **Awaiting Admin Approval** - Admin reviews and approves
3. **Awaiting Payment Confirmation** - Bank info shared, buyer pays
4. **In Transit** - Vehicle shipped to buyer's address
5. **Inspection** - Buyer inspects vehicle (1-5 days)
6. **Approved** - Buyer approves purchase
7. **Released** - Payment released to seller

## Email Integration

### Current Status
Email notifications are implemented but currently in **console log mode** for development/testing.

### Email Events
- **Transaction Initiated**: Sent to buyer with tracking token
- **Seller Notification**: Sent to private seller when escrow starts
- **Status Updates**: Sent to buyer when transaction status changes
- **Bank Info Available**: Includes password-protected bank details

### To Enable Real Emails
1. **Option A - Resend Integration** (Recommended):
   - Set up the Resend connector in Replit integrations
   - No code changes needed - integration auto-configures

2. **Option B - Manual SMTP Setup**:
   - Add credentials as secrets: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - Update `server/email.ts` to use nodemailer with SMTP
   
3. **Option C - SendGrid/Other**:
   - Add API key as secret
   - Update `server/email.ts` with appropriate SDK

For now, all emails are logged to console so you can see what would be sent.

## Admin Access
- **URL**: `/admin/login`
- **Email**: `admin@autopro.com`
- **Password**: `admin123`

## Database Schema

### Tables
- **users**: Admin and customer accounts
- **vehicles**: Dealership inventory
- **vehicle_images**: Multiple images per vehicle
- **vehicle_offers**: Special pricing/discounts
- **transactions**: Escrow purchases (dealership + private sales)
  - Supports both inventory vehicles and custom descriptions
  - Seller info fields for private sales
  - Guest checkout with tracking tokens
- **transaction_events**: Audit trail for status changes

## Recent Changes (Oct 30, 2024)
- ✅ Complete escrow platform with admin backend
- ✅ Custom escrow form for private vehicle sales
- ✅ Database schema extended for seller information
- ✅ Email notification system (console mode for development)
- ✅ Dedicated `/escrow` page with transaction tracking
- ✅ 7-step escrow workflow with admin controls
- ✅ Password-protected bank information sharing
- ✅ Guest checkout with unique tracking tokens
- ✅ Sample data: 5 vehicles with images and offers

## User Preferences
- Full-stack escrow platform similar to escrow.com
- Manual escrow process with admin approval
- Email notifications for buyers and sellers
- Shipping-only delivery (no in-person pickup)
- 1-5 day customer-selectable inspection periods
- Support for both dealership and private seller transactions
