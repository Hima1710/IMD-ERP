# Fix Duplicate React Keys - ShoppingCart
Status: 🔄 In Progress

**Error:** `amount-100` duplicate ~line 727 (payment buttons)

**From code:**
```
{[total, total * 2, total * 5, 100].map((amount) => (
  key={`amount-${Math.ceil(amount)}`} // Duplicate when total=25 (100x4)
```

**Plan:**
```
key={`amount-btn-${Math.ceil(amount)}-${index}`}
```
Unique index prevents duplicates.

**Files:**
- components/shopping-cart.tsx
