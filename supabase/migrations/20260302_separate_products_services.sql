-- Step 1: Create new tables

CREATE TABLE IF NOT EXISTS public.product_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    icon text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id uuid REFERENCES public.service_categories(id),
    name text NOT NULL,
    description text,
    price numeric NOT NULL DEFAULT 0,
    duration_minutes integer,
    service_type text,
    image_url text,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We will handle data migration in script before dropping things.

-- Step 2: Add foreign keys for orders and bookings to profiles
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Step 3: Add service_id to order_items
ALTER TABLE public.order_items
ADD COLUMN service_id uuid REFERENCES public.services(id) ON DELETE SET NULL;

-- Step 4: Add service_id to bookings (we will copy product_id to service_id then drop product_id)
ALTER TABLE public.bookings
ADD COLUMN service_id uuid REFERENCES public.services(id) ON DELETE CASCADE;

