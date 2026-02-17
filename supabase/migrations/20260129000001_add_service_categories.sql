-- Migration: Add Service Categories
-- This creates a structured taxonomy for services (Lectura, Ritual, Limpieza, etc.)

-- ============================================
-- SERVICE_CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE, -- URL-friendly version
  description TEXT,
  icon TEXT, -- Icon identifier (e.g., 'tarot-cards', 'candle', 'crystal')
  color TEXT, -- Hex color for UI theming
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering active categories
CREATE INDEX idx_service_categories_active ON service_categories(is_active, display_order);

-- ============================================
-- ADD CATEGORY TO PRODUCTS
-- ============================================
ALTER TABLE products 
ADD COLUMN category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL;

-- Index for filtering products by category
CREATE INDEX idx_products_category ON products(category_id) WHERE is_active = TRUE;

-- ============================================
-- SEED INITIAL CATEGORIES
-- ============================================
INSERT INTO service_categories (name, slug, description, icon, color, display_order) VALUES
  ('Lectura de Tarot', 'lectura-tarot', 'Consultas de tarot para orientación espiritual y autoconocimiento', 'sparkles', '#D4AF37', 1),
  ('Lectura de Runas', 'lectura-runas', 'Interpretación de runas nórdicas para guía y claridad', 'hexagon', '#C0C0C0', 2),
  ('Ritual Energético', 'ritual-energetico', 'Rituales personalizados para limpieza y protección energética', 'flame', '#FF6B6B', 3),
  ('Limpieza Energética', 'limpieza-energetica', 'Sesiones de limpieza de espacios y auras', 'wind', '#4ECDC4', 4),
  ('Coaching Espiritual', 'coaching-espiritual', 'Acompañamiento en procesos de crecimiento personal', 'heart', '#A78BFA', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- RLS POLICIES FOR SERVICE_CATEGORIES
-- ============================================
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Public can view active categories
CREATE POLICY "Anyone can view active service categories" ON service_categories
  FOR SELECT USING (is_active = TRUE);

-- ============================================
-- TRIGGER FOR AUTO-UPDATE
-- ============================================
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
