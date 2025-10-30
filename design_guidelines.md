# Design Guidelines: Premium Car Dealership Website

## Design Approach
**Reference-Based Design** inspired by AutoPro and premium automotive websites (Mercedes-Benz, BMW, Porsche dealer sites). This design emphasizes luxury, visual impact, and sophisticated presentation of high-value inventory.

## Core Design Principles
- **Premium Automotive Aesthetic**: Clean, sophisticated layouts that let vehicle imagery dominate
- **Visual Hierarchy**: Large hero imagery, prominent pricing, clear calls-to-action
- **Information Density**: Rich vehicle specifications displayed elegantly without clutter
- **Trust & Credibility**: Professional presentation with statistics, ratings, and detailed specs

## Typography System
**Font Families** (via Google Fonts):
- Primary: 'Montserrat' - Bold, modern sans-serif for headings (weights: 600, 700, 800)
- Secondary: 'Open Sans' - Clean, readable for body text (weights: 400, 600)

**Hierarchy**:
- Hero Headlines: 48-72px, Montserrat 800, uppercase tracking-wide
- Section Titles: 32-40px, Montserrat 700, uppercase
- Vehicle Names: 20-24px, Montserrat 600
- Pricing: 28-32px, Montserrat 700 (featured/strikethrough for discounts)
- Body Text: 16px, Open Sans 400
- Specifications: 14px, Open Sans 600, uppercase
- Small Print: 12-14px, Open Sans 400

## Layout System
**Spacing Units**: Tailwind spacing with 4, 6, 8, 12, 16, 20, 24, 32 (p-4, gap-8, py-20, etc.)

**Container Strategy**:
- Full-width sections with inner max-w-7xl containers
- Hero section: Full viewport width and height
- Content sections: max-w-6xl for optimal readability
- Vehicle grids: max-w-7xl for 3-4 column layouts

**Grid Patterns**:
- Desktop: 3-4 columns for vehicle cards (grid-cols-3 lg:grid-cols-4)
- Tablet: 2 columns (md:grid-cols-2)
- Mobile: Single column stacked layout

## Component Library

### 1. Navigation Header
- Sticky header with logo left, navigation center, contact/CTA right
- Dropdown menus for: Vehicles (New/Used/Special Offers), Inventory, About, Contact
- Include phone number with icon prominently in header
- Search icon in navigation
- Clean horizontal layout, subtle shadow on scroll

### 2. Hero Slider Section
**Full-screen rotating slider** showcasing featured vehicles:
- Each slide: Full-bleed car image background (1920x1080px minimum)
- Overlay gradient for text readability
- Content layout per slide:
  - Small eyebrow text: "FIND YOUR DREAM CAR" (12px, uppercase)
  - Vehicle model: Large display text (60-72px)
  - Year and model details
  - Prominent pricing
  - Dual CTAs: "ORDER NOW" (primary) and "TEST DRIVE" (secondary) with blurred backgrounds
- Navigation: Dot indicators bottom-center, arrow controls on sides
- Auto-rotate every 5 seconds with smooth transitions

### 3. Vehicle Search Bar
Positioned below hero or as overlay on hero bottom:
- Horizontal filter bar with dropdowns: Make, Model, Body Type, Price Range
- "SEARCH VEHICLES" button (primary accent)
- Elevated card appearance with shadow

### 4. Vehicle Cards (Primary Component)
**Specifications**:
- Card container: Rounded corners (rounded-lg), subtle shadow, hover lift effect
- Vehicle image: Square/landscape ratio, clean white/light background
- Price badge: Top-right corner position
- Content structure:
  - Vehicle name (prominent)
  - Star rating display with count
  - Price (large, bold) with strikethrough for discounts
  - Short description (2 lines max)
  - Spec badges in grid (2x3 layout):
    - Condition (New/Used)
    - Year
    - Transmission type
    - Color
    - Top speed/Performance stat
  - "ORDER NOW" or "VIEW DETAILS" button
- Hover state: Slight elevation increase, subtle scale

### 5. Section: Special Offers
- Horizontal scrolling carousel or 3-column grid
- Featured vehicle cards with "SALE" or discount badges
- Prominent discount pricing display

### 6. Section: About/Statistics
**Layout**: 4-column stat display with centered alignment
- Large numbers (48-64px) above labels
- Icons or decorative elements above numbers
- Stats: "New Cars in Stock", "Used Cars in Stock", "Happy Clients", "Years in Business"
- Background: Subtle contrast from main sections
- Call-to-action subsection: "HAVE A QUESTION? CALL US: [phone]" with supporting image

### 7. Section: Featured Vehicles
**Tabbed interface**: "ALL CARS", "NEW CARS", "USED CARS"
- Display 3 vehicles per tab in grid layout
- "VIEW ALL" button below grid
- Clean tab design with active state indicator

### 8. Section: Recommended Vehicles
Full-width carousel with 3-4 visible cards:
- Arrow navigation (left/right)
- Cards show: Image, price, ratings, full specs list, CTA
- Infinite scroll/loop capability
- Responsive: 1 card mobile, 2 tablet, 3-4 desktop

### 9. Footer
Multi-column layout (4 columns desktop, stacked mobile):
- Column 1: Logo, dealership description, social media icons
- Column 2: Quick links (Inventory, New Cars, Used Cars, Special Offers)
- Column 3: Contact information (Address, Phone, Email, Hours)
- Column 4: Newsletter signup form
- Bottom bar: Copyright, legal links, payment icons

## Accent & Interaction Patterns
- Primary accent for CTAs, prices, sale badges, highlights
- Hover states: Buttons scale slightly (1.05), cards elevate with shadow
- Smooth transitions (300ms ease) for all interactive elements
- Focus states: Visible outline for keyboard navigation
- Loading states: Skeleton screens for vehicle grids

## Imagery Strategy

### Required Images:
**Hero Slider** (5 slides):
- High-quality, professional car photography on dramatic backgrounds
- Wide format (1920x1080), cars positioned right or center-right
- Dynamic angles showing vehicle profile/3-quarter view
- Environment: Studio, mountain roads, city skylines, modern architecture

**Vehicle Inventory** (12-15 unique vehicles):
- Clean, consistent photography style
- White or light neutral backgrounds
- Side profile or 3-quarter front views
- Square format (800x800px) for cards
- Professional lighting showing vehicle details

**About Section**:
- Dealership showroom photo or professional team image
- Landscape format, high quality

**Icons**: Use Font Awesome or Heroicons for:
- Specifications (calendar, gear, palette, speedometer)
- Contact (phone, email, location)
- Social media
- Navigation arrows

## Responsive Behavior
- **Desktop (1280px+)**: Full multi-column layouts, 3-4 vehicle cards per row
- **Tablet (768-1279px)**: 2 columns, adjusted spacing, simplified navigation
- **Mobile (<768px)**: Single column, stacked layout, hamburger menu, touch-optimized cards

## Animations (Minimal)
- Hero slider transitions: Smooth crossfade
- Scroll-triggered: Fade-in for sections (subtle, 300ms)
- Carousel: Smooth slide transitions
- **No** parallax, **no** excessive motion effects