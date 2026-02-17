# TuLuzMagica v1.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a "Mystical Luxury" e-commerce and therapy platform with a hybrid cart (physical products + services).

**Architecture:** Next.js 15 (App Router) for the frontend/backend bridge via Server Actions. Supabase for data persistence and authentication. Zustand for client-side state management of the hybrid cart.

**Tech Stack:** Next.js 15, Supabase, Tailwind CSS, Framer Motion, Zustand, Mercado Pago SDK.

---

## User Review Required

> [!IMPORTANT]
> The "Hybrid Cart" logic will automatically toggle shipping requirements based on item types. If a cart contains both a Tarot Reading and a Physical Candle, the user WILL be asked for a shipping address.

> [!WARNING]
> Mercado Pago integration requires valid credentials. I will setup the skeleton, but you will need to provide the `MP_ACCESS_TOKEN` in the `.env.local` file later.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

**Step 1: Initialize Next.js 15 project**
Run: `npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*"`

**Step 2: Install dependencies**
Run: `npm install zustand framer-motion lucide-react @supabase/supabase-js @mercadopago/sdk-react`

**Step 3: Setup Design System**
Update `tailwind.config.ts` with the "Mystical Luxury" palette:
- Primary: `#D4AF37` (Gold)
- Background: `#0A0A0A` (Deep Black)
- Surface: `#1A1A1A` (Charcoal)

---

### Task 2: Supabase & Database Schema

**Files:**
- Create: `lib/supabase.ts`
- Create: `supabase/migrations/20260129000000_initial_schema.sql`

**Step 1: Create Tables**
Define tables: `profiles`, `products`, `bookings`, `orders`, `order_items`.
Ensure `products` has a `type` column (`physical` | `service`).

**Step 2: Enable RLS**
Add policies for public read on products and private access for bookings/profiles.

---

### Task 3: Hybrid Cart Logic (Zustand)

**Files:**
- Create: `store/useCartStore.ts`

**Step 1: Define Store State**
```typescript
interface CartItem {
  id: string;
  name: string;
  type: 'physical' | 'service';
  price: number;
  quantity: number;
  weight?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  requiresShipping: () => boolean;
}
```

**Step 2: Implement `requiresShipping`**
Logic: `items.some(item => item.type === 'physical')`.

---

### Task 4: Core Pages Development

**Files:**
- Create: `components/Navbar.tsx` (with Lunar Phase widget placeholder)
- Create: `app/products/page.tsx`
- Create: `app/services/page.tsx`
- Create: `app/checkout/page.tsx`

---

## Verification Plan

### Automated Tests
- [ ] Unit tests for `useCartStore` logic (Vitest).
- [ ] E2E tests for the "Hybrid Checkout" flow using Playwright.

### Manual Verification
- [ ] Verify that adding ONLY a service does NOT show the shipping address step.
- [ ] Verify that adding AT LEAST ONE physical product DOES show the shipping address step.
- [ ] Check mobile responsiveness for the "Mystical" UI elements.
