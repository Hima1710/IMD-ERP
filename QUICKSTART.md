# PaintMaster ERP - Quick Start Guide

Welcome to PaintMaster ERP! This guide will help you get up and running quickly.

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Development Server
```bash
pnpm dev
```

### 3. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Interface Overview

### Left Panel (RTL = Right Side)
**Shopping Cart** - View and manage selected items
- Add/remove products
- Adjust quantities
- Apply discounts
- View real-time calculations
- Complete purchase

### Right Panel (RTL = Left Side)
**Product Catalog** - Browse and shop
- Filter by category
- Search for products
- View ratings and reviews
- Add items to cart

### Top Bar
**POS Header** - Quick access tools
- Search products by name
- Barcode scanner (for future integration)
- Current time and store info
- Notifications

### Left Sidebar (RTL = Far Right)
**Navigation & Settings**
- Select store location
- Navigate to different sections
- View logged-in user info
- Sign out

## 💡 Common Tasks

### Add Product to Cart
1. Browse products in the catalog
2. Click the **"إضافة" (Add)** button
3. Product appears in the shopping cart

### Adjust Order Quantity
1. In the shopping cart, locate the item
2. Use **-** and **+** buttons to adjust quantity
3. Price updates automatically

### Apply Discount
1. In the shopping cart, find the discount input
2. Enter percentage (0-100)
3. Total recalculates with discount applied

### Remove Item from Cart
1. Click the **trash icon** next to the item
2. Item is removed instantly

### Complete Sale
1. Review order in shopping cart
2. Click **"دفع" (Pay)** button (ready for payment integration)
3. Click **"إيصال" (Receipt)** for printable receipt

### Switch Store Location
1. Click the store selector in the sidebar
2. Choose from available stores:
   - الرياض (Riyadh)
   - جدة (Jeddah)
   - الدمام (Dammam)

### Search Products
1. Enter search term in the header search box
2. Results filter in real-time (Arabic or English)
3. Clear search to see all products

## 🎨 Key Features

✅ **Full Arabic/RTL Support** - Complete right-to-left interface
✅ **Live Calculations** - Tax and totals update instantly
✅ **Multi-Currency** - Saudi Riyal (SAR) default
✅ **Responsive Design** - Works on desktop, tablet, mobile
✅ **Professional UI** - Clean, modern interface with proper contrast
✅ **Stock Management** - Shows availability and out-of-stock items
✅ **Product Ratings** - 5-star rating system with reviews

## 🔧 Configuration

### Change Tax Rate
Edit in `app/page.tsx`:
```typescript
const [taxRate, setTaxRate] = useState<number>(0.15) // Change to 0.20 for 20%
```

### Add New Store
Edit in `components/sidebar.tsx`:
```typescript
const stores = [
  { id: 'riyadh', name: 'الرياض', nameEn: 'Riyadh', city: 'الرياض' },
  // Add new store here:
  { id: 'madinah', name: 'المدينة', nameEn: 'Medina', city: 'المدينة' },
]
```

### Customize Theme Colors
Edit in `app/globals.css`:
```css
:root {
  --primary: #1e3a5f;      /* Primary Blue */
  --accent: #ea580c;       /* Accent Orange */
  /* ... modify other colors */
}
```

### Add New Product
Edit in `lib/mock-data.ts`:
```typescript
export const mockProducts: Product[] = [
  // ... existing products
  {
    id: 'paint-006',
    name: 'Your Product Name',
    nameAr: 'اسم المنتج بالعربية',
    // ... fill in other fields
  },
]
```

## 📊 Sample Data

### Included Products (15 total)
- **Paints**: 5 products (interior, exterior, stain, primer, metallic)
- **Tools**: 5 products (rollers, brushes, ladder, drop cloth, thinner)
- **Decor**: 5 products (wall stickers, ceiling paint, door paint, color guide, glitter)

Each product includes:
- Bilingual names and descriptions
- Pricing with optional discounts
- Stock quantity tracking
- 5-star rating with review count
- Emoji representation

## 🌐 Language & Locale

- **Primary Language**: Arabic (ar-SA)
- **Secondary**: English labels available
- **Text Direction**: Right-to-Left (RTL)
- **Date Format**: 01/01/1445 ه (Islamic calendar compatible)
- **Number Format**: Arabic-Indic numerals ready
- **Currency**: Saudi Riyal (ر.س)

## 🛠️ Development

### Available Scripts
```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### Project Structure
```
app/                 # Next.js app directory
├── layout.tsx       # Root layout
├── page.tsx         # Main POS page
└── globals.css      # Global styles

components/         # React components
├── sidebar.tsx
├── pos-header.tsx
├── product-catalog.tsx
├── shopping-cart.tsx
└── ... (UI components)

lib/               # Utilities & data
├── mock-data.ts
└── utils.ts

config/            # Configuration
└── app.config.ts

public/            # Static files
└── paintmaster-logo.jpg
```

## 📝 Notes

- All prices are in Saudi Riyal (SAR)
- Tax rate is set to 15% (standard VAT)
- Mock data is used - ready for backend integration
- Payment buttons are prepared for future integration
- Receipt printing is prepared for future integration

## 🆘 Troubleshooting

**Page not loading?**
- Clear browser cache
- Restart dev server: `pnpm dev`
- Check console for errors (F12)

**Styling looks wrong?**
- Verify Tailwind CSS is working
- Check `app/globals.css` has proper theme variables
- Rebuild: `pnpm build`

**RTL layout issues?**
- Ensure `dir="rtl"` is set in HTML element
- Check browser RTL support
- Verify Tailwind RTL utilities are applied

## 🚀 Next Steps

1. **Backend Integration**: Connect to your database/API
2. **Authentication**: Add user login system
3. **Payment Gateway**: Integrate Stripe or local payment processor
4. **Inventory Management**: Build admin dashboard for stock management
5. **Analytics**: Add sales reporting and statistics
6. **Mobile App**: Extend to mobile platforms with React Native

## 📞 Support

For issues or questions, refer to:
- README.md - Full documentation
- config/app.config.ts - Configuration options
- Component files - Inline code comments

---

**Version**: 1.0.0  
**Created**: 2024  
**Status**: Ready for Development
