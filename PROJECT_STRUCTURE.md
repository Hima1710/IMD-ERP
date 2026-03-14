# PaintMaster ERP - Project Structure Guide

A comprehensive guide to navigate and understand the PaintMaster ERP project structure.

## 📚 Documentation Files (Read First!)

| File | Purpose | Read Time |
|------|---------|-----------|
| **README.md** | Complete feature overview and documentation | 15 min |
| **QUICKSTART.md** | 3-step setup and common tasks | 10 min |
| **IMPLEMENTATION_SUMMARY.md** | What was built and how | 10 min |
| **PROJECT_STRUCTURE.md** | This file - navigation guide | 5 min |

### Start Here! 👈
1. Read **QUICKSTART.md** to get running (3 steps)
2. Review **README.md** for features and architecture
3. Check **IMPLEMENTATION_SUMMARY.md** for technical details

---

## 📂 Directory Structure

### Root Level Files
```
app/                       # Next.js app directory - main application
components/               # Reusable React components
config/                   # Configuration files
lib/                      # Utility functions and data
public/                   # Static assets
tailwind.config.ts        # Tailwind CSS configuration
package.json              # Dependencies and scripts
```

---

## 🎯 Key Application Files

### `app/layout.tsx` (45 lines)
**Purpose**: Root layout with RTL and internationalization setup
**Contains**:
- Arabic font import (Cairo)
- English fonts import (Geist)
- RTL direction setup (`dir="rtl"`)
- Metadata with Arabic title
- Viewport configuration
- Theme color branding (#1e3a5f)

**When to modify**: Change fonts, viewport settings, or global metadata

---

### `app/page.tsx` (96 lines) ⭐ MAIN PAGE
**Purpose**: Main POS interface and state management
**Contains**:
- 6 state variables:
  - `cartItems` - Shopping cart contents
  - `selectedCategory` - Active product category filter
  - `searchTerm` - Search input value
  - `selectedStore` - Current store location
  - `taxRate` - Tax percentage (15% default)
  - `discountPercent` - Discount percentage
- `filteredProducts` - Memoized product filtering
- Event handlers for cart and filters
- Main layout structure (flex, sidebar, header, cart, catalog)

**When to modify**: 
- Add new state management
- Modify default tax rate
- Change layout structure
- Add new features

---

### `app/globals.css` (133 lines)
**Purpose**: Global styles and theme system
**Contains**:
- 30+ CSS custom properties (variables)
- Light mode colors (light theme)
- Dark mode colors (.dark class)
- Font definitions
- RTL directives
- Base layer styles

**When to modify**:
- Change theme colors
- Update fonts
- Modify spacing defaults
- Add global animations

**Color Variables to Know**:
```css
--primary: #1e3a5f         /* Dark Blue */
--accent: #ea580c          /* Orange */
--background: #f8fafc      /* Light Slate */
--foreground: #1e293b      /* Dark Slate */
```

---

## 🧩 Component Files

### Navigation & Layout Components

#### `components/sidebar.tsx` (105 lines)
**Purpose**: Left navigation panel with store selector
**Features**:
- Store location dropdown (3 stores)
- Navigation menu (5 sections)
- User profile display
- Logout button
- Brand logo and name

**Props**:
- `selectedStore: string` - Current store ID
- `onStoreChange: (store: string) => void` - Store change handler

---

#### `components/pos-header.tsx` (71 lines)
**Purpose**: Top header with search, time, and store info
**Features**:
- Product search input
- Barcode scanner button
- Current time display
- Store selector display
- Notification bell
- User profile button

**Props**:
- `searchTerm: string` - Current search text
- `onSearchChange: (term: string) => void` - Search update handler
- `selectedStore: string` - Current store ID

---

### Product & Shopping Components

#### `components/product-catalog.tsx` (145 lines)
**Purpose**: Product browsing and filtering
**Features**:
- Category filter buttons (All, Paints, Tools, Decor)
- Product grid (responsive columns)
- Individual product cards with:
  - Product emoji
  - Bilingual name
  - 5-star rating
  - Price with discount
  - Stock indicator
  - Add to cart button
- Empty state message

**Props**:
- `products: Product[]` - Products to display
- `selectedCategory: string` - Active category
- `onCategoryChange: (category: string) => void` - Category filter
- `onAddToCart: (productId: string) => void` - Add item handler

---

#### `components/shopping-cart.tsx` (183 lines) ⭐ COMPLEX CALCULATIONS
**Purpose**: Shopping cart with live calculations
**Features**:
- Cart items list
- Quantity adjustment (+/- buttons)
- Item removal (trash icon)
- Discount percentage input
- Real-time calculations:
  - Subtotal
  - Discount amount
  - Taxable amount
  - Tax calculation
  - Total amount
- Payment and receipt buttons
- Empty state

**Props**:
- `cartItems: CartItem[]` - Items in cart
- `onUpdateQuantity: (productId, qty) => void` - Quantity update
- `taxRate: number` - Tax percentage (0-1)
- `discountPercent: number` - Discount percentage (0-100)
- `onDiscountChange: (percent) => void` - Discount update

**Calculation Flow**:
```
Subtotal = Sum of (price × quantity) for all items
DiscountAmount = Subtotal × (discountPercent / 100)
TaxableAmount = Subtotal - DiscountAmount
Tax = TaxableAmount × taxRate
Total = TaxableAmount + Tax
```

---

### Utility Components

#### `components/dashboard-stats.tsx` (52 lines)
**Purpose**: Display statistics cards
**Features**:
- Stat card grid (1-4 columns responsive)
- Icon with color coding
- Label and value display
- Trend indicator (↑↓ percentage)

**Props**:
- `stats: StatCard[]` - Array of statistics

---

#### `components/skeleton.tsx` (57 lines)
**Purpose**: Loading state placeholders
**Contains**:
- `Skeleton` - Generic skeleton
- `ProductCardSkeleton` - Product loading placeholder
- `CartItemSkeleton` - Cart item loading placeholder

---

## 💾 Data & Configuration

### `lib/mock-data.ts` (249 lines)
**Purpose**: Sample product data
**Contains**:
- `Product` TypeScript interface
- 15 sample products array (`mockProducts`)

**Product Interface**:
```typescript
interface Product {
  id: string              // Unique identifier
  name: string            // English name
  nameAr: string          // Arabic name
  description: string     // English description
  descriptionAr: string   // Arabic description
  price: number           // Price in SAR
  category: string        // Category ID
  quantity: number        // Stock quantity
  inStock: boolean        // Availability status
  discount: number        // Discount percentage (0-100)
  rating: number          // Rating (1-5)
  reviews: number         // Review count
  emoji: string           // Product emoji representation
}
```

**Sample Data Breakdown**:
- **5 Paint Products**: paint-001 to paint-005
- **5 Tool Products**: tool-001 to tool-005
- **5 Decor Products**: decor-001 to decor-005

---

### `lib/utils.ts` (35 lines)
**Purpose**: Utility and formatting functions
**Contains**:
- `cn()` - Tailwind class merging
- `formatCurrency()` - SAR formatting
- `formatNumber()` - Arabic number formatting
- `formatDate()` - Date formatting (ar-SA locale)
- `formatTime()` - Time formatting (ar-SA locale)

---

### `config/app.config.ts` (124 lines)
**Purpose**: Centralized configuration
**Sections**:
- `STORE_CONFIG` - Store locations
- `TAX_CONFIG` - Tax settings (15% VAT)
- `CURRENCY_CONFIG` - Currency (SAR)
- `PRODUCT_CATEGORIES` - Category definitions
- `THEME_CONFIG` - Color and font settings
- `UI_CONFIG` - Layout dimensions
- `FEATURE_FLAGS` - Feature toggles
- `API_CONFIG` - API endpoint settings
- `LOCALE_CONFIG` - Localization settings
- `VALIDATION_CONFIG` - Input validation rules

**Usage**:
```typescript
import { STORE_CONFIG, TAX_CONFIG } from '@/config/app.config'

const stores = STORE_CONFIG.stores
const taxRate = TAX_CONFIG.defaultRate
```

---

## 🎨 Styling System

### Design Tokens (in `app/globals.css`)

**Colors**:
- Primary: `#1e3a5f` (Dark Blue)
- Accent: `#ea580c` (Orange)
- Background: `#f8fafc` (Light Slate)
- Foreground: `#1e293b` (Dark Slate)

**Typography**:
- Sans: Cairo (Arabic), Geist (English)
- Mono: Geist Mono

**Spacing**:
- Base unit: 4px (Tailwind default)
- Sidebar width: 280px
- Cart width: 320px

**Radius**:
- Default: 8px (0.5rem)

---

## 🔄 Component Hierarchy

```
RootLayout (app/layout.tsx)
└── POSPage (app/page.tsx)
    ├── Sidebar
    │   └── NavItem (repeated)
    ├── MainContent (flex)
    │   ├── POSHeader
    │   └── ContentArea (flex)
    │       ├── ShoppingCart
    │       │   └── CartItemRow (repeated)
    │       └── ProductCatalog
    │           ├── CategoryFilter
    │           └── ProductCard (grid)
    └── DashboardStats (conditional)
```

---

## 📊 Data Flow

### Shopping Cart Flow
```
1. User clicks "إضافة" (Add) button on product
   ↓
2. handleAddToCart() called with productId
   ↓
3. cartItems state updated with new item or incremented quantity
   ↓
4. ShoppingCart component re-renders with new totals
   ↓
5. Calculations update: subtotal → discount → tax → total
```

### Product Filtering Flow
```
1. User selects category or types search term
   ↓
2. State updated (selectedCategory or searchTerm)
   ↓
3. filteredProducts useMemo recalculates
   ↓
4. ProductCatalog re-renders with filtered results
```

---

## 🚀 Development Workflow

### To Add a New Feature

1. **Identify the component**: Where does it belong?
2. **Add to component**: Implement new JSX
3. **Add state if needed**: Update app/page.tsx
4. **Styling**: Use Tailwind classes, reference `globals.css` colors
5. **Test**: pnpm dev and verify in browser
6. **Document**: Update relevant .md file

### Example: Add a "Clear Cart" button

```typescript
// 1. Add state handler in app/page.tsx
const handleClearCart = () => {
  setCartItems([])
}

// 2. Pass to component
<ShoppingCart
  cartItems={cartItems}
  onClearCart={handleClearCart}
  // ... other props
/>

// 3. Add button in shopping-cart.tsx
<button onClick={onClearCart}>
  مسح السلة (Clear Cart)
</button>
```

---

## 📱 Responsive Breakpoints

**Tailwind Breakpoints** (from `tailwind.config.ts`):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Mobile-First Approach**: Style for mobile first, enhance with breakpoints

---

## 🔗 File Dependencies

### Dependency Chart
```
app/page.tsx (main)
├── imports components/sidebar.tsx
├── imports components/pos-header.tsx
├── imports components/product-catalog.tsx
├── imports components/shopping-cart.tsx
└── imports lib/mock-data.ts

components/product-catalog.tsx
└── imports lib/mock-data.ts (Product interface)

components/shopping-cart.tsx
└── imports lib/mock-data.ts (for cart items lookup)

All components use:
├── lib/utils.ts (cn, formatCurrency, etc.)
├── lucide-react (icons)
└── @/config/app.config.ts (constants)
```

---

## 🎯 Quick Reference

### Where to Find...

| What | Where | Line # |
|------|-------|--------|
| Product data | `lib/mock-data.ts` | Top 15 items |
| Component styles | `app/globals.css` | Variables at top |
| Theme colors | `app/globals.css` | :root block |
| Store list | `components/sidebar.tsx` | Lines 11-16 |
| Cart calculations | `components/shopping-cart.tsx` | Lines 25-35 |
| Tax rate | `app/page.tsx` | Line 15 |
| Configuration | `config/app.config.ts` | Throughout |
| Fonts | `app/layout.tsx` | Lines 2-7 |

---

## ✅ Customization Checklist

Before deployment, consider customizing:

- [ ] **Colors**: Edit `app/globals.css` theme variables
- [ ] **Stores**: Update `components/sidebar.tsx` stores array
- [ ] **Tax Rate**: Change `app/page.tsx` default tax rate
- [ ] **Products**: Add/modify items in `lib/mock-data.ts`
- [ ] **Logo**: Replace `public/paintmaster-logo.jpg`
- [ ] **Company Name**: Update everywhere (sidebar, header, etc.)
- [ ] **Currency**: Update `config/app.config.ts` if not SAR
- [ ] **Language**: Add i18n if multilingual needed
- [ ] **Features**: Enable/disable in `config/app.config.ts` feature flags

---

## 📞 Getting Help

### For Questions About...

**Layout & Structure**:
- See `app/page.tsx` - main component hierarchy
- See component files for JSX structure

**Styling & Colors**:
- See `app/globals.css` - CSS variables
- See `tailwind.config.ts` - Tailwind setup

**Data & Products**:
- See `lib/mock-data.ts` - product structure
- See `config/app.config.ts` - configuration

**Calculations & Logic**:
- See `components/shopping-cart.tsx` - math logic
- See `app/page.tsx` - state management

**Customization**:
- See `QUICKSTART.md` - common customizations
- See `README.md` - configuration section

---

## 🎓 Learning Path

1. **Start**: Read QUICKSTART.md (5 min)
2. **Setup**: Run `pnpm dev` (2 min)
3. **Explore**: Open `app/page.tsx` in editor
4. **Understand**: Trace component imports
5. **Modify**: Change a color in `app/globals.css`
6. **Build**: Add new feature following examples

---

**Version**: 1.0.0
**Last Updated**: 2024
**Status**: Ready to Use & Customize

Happy building! 🚀
