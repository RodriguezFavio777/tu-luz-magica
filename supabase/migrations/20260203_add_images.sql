-- Add images column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Optional: Migrate existing image_url to images array if empty
-- UPDATE products SET images = ARRAY[image_url] WHERE images IS NULL OR array_length(images, 1) IS NULL;
