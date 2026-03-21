# PaintMaster ERP Dashboard

Professional Point-of-Sale (POS) and Inventory Management System for Paint & Hardware Stores with full Arabic (RTL) support.

## Features

### 🎯 Core Features
- **Professional POS Interface**: Streamlined checkout experience with shopping cart
- **Product Catalog**: Browse and search paint, tools, and decorative products
- **Shopping Cart**: Real-time cart calculations with tax and discount support
- **Multi-Store Support**: Switch between different store locations (Riyadh, Jeddah, Dammam)
- **Category Filtering**: Filter products by category (Paints, Tools, Decor)
- **Search Functionality**: Find products by name in Arabic or English

### 🌍 Internationalization
- **Full RTL Support**: Complete right-to-left layout and text direction
- **Bilingual Interface**: Arabic and English product names and descriptions
- **Arabic Fonts**: Cairo font for optimal Arabic typography
- **Date & Time Formatting**: Localized date/time display (ar-SA locale)
- **Currency Formatting**: Saudi Riyal (SAR) currency display

### 💰 Business Features
- **Tax Calculation**: Automatic 15% VAT calculation (configurable)
- **Discounts**: Apply percentage-based discounts to orders
- **Live Calculations**: Real-time subtotal, tax, and total updates
- **Product Ratings**: 5-star rating system with review counts
- **Stock Management**: Track available inventory and out-of-stock items
- **Promotional Badges**: Display discount percentages on products

### 🎨 Design System
- **Professional Theme**: Slate gray, primary blue (#1e3a5f), and accent orange (#ea580c)
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Full dark theme implementation
- **Component Library**: Built with shadcn/ui and Tailwind CSS
- **Icon System**: Lucide React icons throughout the interface

## Architecture

### File Structure
```
app/
├── layout.tsx           # Root layout with RTL setup and fonts
├── globals.css          # Global styles and theme variables
└── page.tsx             # Main POS page

components/
├── sidebar.tsx          # Navigation sidebar with store selector
├── pos-header.tsx       # Header with search and store info
├── product-catalog.tsx  # Product grid with category filter
├── shopping-cart.tsx    # Cart with calculations
├── dashboard-stats.tsx  # Statistics cards component
└── skeleton.tsx         # Loading skeletons

lib/
├── mock-data.ts         # Sample products database
└── utils.ts             # Utility functions (formatting, etc.)
```

### Components

#### Sidebar Component
- Navigation menu with store selector
- User information display
- Quick access to main sections
- Professional branding

#### POS Header
- Real-time search with Arabic support
- Barcode scanner button
- Store selector display
- Current time and notifications

#### Product Catalog
- Category filter buttons
- Product grid layout
- Product cards with:
  - Product emoji/image
  - Name (Arabic & English)
  - Rating with review count
  - Price with discount calculation
  - Stock availability
  - Add to cart button

#### Shopping Cart
- Cart items list with quantity controls
- Real-time price calculations
- Discount percentage input
- Tax calculation display
- Payment and receipt buttons
- Empty state message

## Data Structure

### Product Model
```typescript
interface Product {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  price: number
  category: 'paint' | 'tools' | 'decor'
  quantity: number
  inStock: boolean
  discount: number (0-100)
  rating: number (1-5)
  reviews: number
  emoji: string
}
```

### Categories
- **Paint**: Interior/exterior paints, stains, primers, specialty finishes
- **Tools**: Rollers, brushes, ladders, drop cloths, thinners
- **Decor**: Wall stickers, ceiling paint, door/window paint, glitter paint

## Getting Started

### Prerequisites
- Node.js 16+ 
- pnpm (or npm/yarn)

### Installation
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Key Technologies

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + PostCSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Fonts**: Cairo (Arabic), Geist (English)
- **State Management**: React Hooks (useState, useMemo)

## Customization

### Theme Colors
Edit CSS variables in `app/globals.css`:
```css
:root {
  --primary: #1e3a5f;      /* Dark Blue */
  --accent: #ea580c;       /* Orange */
  --background: #f8fafc;   /* Slate 50 */
  /* ... other colors */
}
```

### Tax Rate
Modify in `app/page.tsx`:
```typescript
const [taxRate, setTaxRate] = useState<number>(0.15) // 15% VAT
```

### Store Locations
Update the stores array in `components/sidebar.tsx`:
```typescript
const stores = [
  { id: 'riyadh', name: 'الرياض', nameEn: 'Riyadh' },
  // Add more stores here
]
```

### Product Data
Add products to `lib/mock-data.ts` following the Product interface.

## Usage

### Adding a Product to Cart
1. Browse products in the catalog
2. Click "إضافة" (Add) button on any product
3. Product appears in shopping cart on the right

### Adjusting Quantities
- Use +/- buttons in cart to change quantity
- Remove items with trash icon

### Applying Discounts
- Enter discount percentage in the cart
- Calculations update automatically

### Completing a Sale
1. Review order in shopping cart
2. Click "دفع" (Pay) button
3. Click "إيصال" (Receipt) for printable receipt

## Performance Optimizations

- **useMemo**: Product filtering cached based on category and search
- **Component Splitting**: Lazy-loaded components for better performance
- **CSS Optimization**: Tailwind purges unused styles in production
- **RTL Optimization**: Hardware-accelerated RTL rendering with CSS Grid/Flexbox

## Future Enhancements

- Barcode scanning integration
- Payment gateway integration
- Receipt printing system
- Inventory management dashboard
- Sales analytics and reporting
- Customer loyalty program
- Multi-user authentication
- Offline support with service workers

## License

Private - For PaintMaster use only

## Support

For issues or feature requests, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Environment**: Production Ready
