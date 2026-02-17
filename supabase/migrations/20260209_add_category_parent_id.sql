-- Add parent_id to service_categories for hierarchy
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES service_categories(id) ON DELETE SET NULL;

-- Enable searching by parent_id
CREATE INDEX IF NOT EXISTS idx_service_categories_parent ON service_categories(parent_id);
