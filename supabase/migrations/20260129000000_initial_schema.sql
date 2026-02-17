-- TuLuzMagica Database Schema
-- E-Commerce Holístico: Servicios + Productos Físicos
-- Migration: Initial Schema Setup

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Extends auth.users with additional user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  birth_date DATE, -- For astrological chart calculations
  phone TEXT,
  
  -- Shipping address (only required for physical products)
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'Argentina',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
-- Unified table for both physical products and services
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('physical', 'service')),
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  
  -- Physical product fields
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  shipping_weight DECIMAL(10, 2), -- in kg, for shipping calculation
  
  -- Service fields
  duration_minutes INTEGER, -- Duration of service (e.g., 60 min for tarot reading)
  
  -- Media
  image_url TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering by type
CREATE INDEX idx_products_type ON products(type) WHERE is_active = TRUE;

-- ============================================
-- BOOKINGS TABLE
-- ============================================
-- For service appointments (Tarot, Reiki, etc.)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Scheduling
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent double booking
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Index for availability queries
CREATE INDEX idx_bookings_time_range ON bookings(start_time, end_time) WHERE status != 'cancelled';
CREATE INDEX idx_bookings_user ON bookings(user_id);

-- ============================================
-- ORDERS TABLE
-- ============================================
-- Unified orders for both products and services
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Order totals
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_cost >= 0),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  
  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected', 'cancelled')),
  mercadopago_preference_id TEXT,
  mercadopago_payment_id TEXT,
  
  -- Shipping (only for orders with physical products)
  requires_shipping BOOLEAN DEFAULT FALSE,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
-- Line items for orders (can be products or services)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Item details (snapshot at time of purchase)
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('physical', 'service')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  
  -- For services, link to booking
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PRODUCTS: Public read, admin write (for now, all can read)
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = TRUE);

-- BOOKINGS: Users can only see their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- ORDERS: Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ORDER_ITEMS: Users can view items from their own orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Check booking conflicts
-- ============================================
-- Prevents double-booking of service slots
CREATE OR REPLACE FUNCTION check_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE product_id = NEW.product_id
    AND status != 'cancelled'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      (NEW.start_time >= start_time AND NEW.start_time < end_time)
      OR (NEW.end_time > start_time AND NEW.end_time <= end_time)
      OR (NEW.start_time <= start_time AND NEW.end_time >= end_time)
    )
  ) THEN
    RAISE EXCEPTION 'Booking conflict: This time slot is already reserved';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_booking_conflicts
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION check_booking_conflict();
