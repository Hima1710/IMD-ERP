# Responsive Design Update Plan

## Information Gathered:
- **Main POS Page (app/page.tsx)**: Uses fixed layout with sidebar (w-72) and cart (w-80)
- **Sidebar (components/sidebar.tsx)**: Fixed width sidebar (w-72), always visible
- **Product Catalog (components/product-catalog.tsx)**: Uses grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
- **Shopping Cart (components/shopping-cart.tsx)**: Fixed width (w-80), always visible on the left

## Plan:

### 1. Main Layout (app/page.tsx)
- Add mobile state management with useState
- Use flex-col for mobile (vertical stack) and md:flex-row for desktop
- Add hamburger menu button for mobile
- Add sidebar toggle for mobile

### 2. Sidebar (components/sidebar.tsx)
- Add responsive classes: hidden md:block for desktop-only
- Convert to overlay/drawer on mobile

### 3. Product Catalog (components/product-catalog.tsx)
- Update grid: grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6
- Add responsive text sizes: text-sm md:text-base

### 4. Shopping Cart (components/shopping-cart.tsx)
- Add responsive width: w-full md:w-80
- Add collapsible feature for mobile
- Make it a bottom sheet or slide-up panel on mobile

### 5. Add Mobile Navigation Header
- Create mobile header with hamburger menu
- Add floating action button for cart on mobile

## Implementation Steps:
1. Update app/page.tsx - Add responsive layout and mobile state
2. Update components/sidebar.tsx - Add responsive classes
3. Update components/product-catalog.tsx - Improve grid and text sizing
4. Update components/shopping-cart.tsx - Make collapsible on mobile
5. Test and verify all changes

## Followup Steps:
- Run development server to verify
- Test on mobile viewport
- Push changes to GitHub

