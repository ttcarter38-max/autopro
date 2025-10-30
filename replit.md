# AutoPro - Car Dealership Website

## Project Overview
A professional car dealership presentation website designed to showcase vehicle inventory with a premium automotive design. Built with React, TypeScript, and Tailwind CSS.

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

## Recent Changes (Oct 30, 2024)
- Implemented complete car dealership presentation website
- Added centralized vehicle data management
- Implemented functional search filters with cascading dropdowns
- Added newsletter subscription with toast notifications
- Created fully responsive mobile design
- All interactive features tested and verified

## User Preferences
- Presentation website (not a full CRUD app)
- Designed for self-hosting on services like Namecheap
- Professional automotive design inspired by AutoPro
- Red accent color scheme
