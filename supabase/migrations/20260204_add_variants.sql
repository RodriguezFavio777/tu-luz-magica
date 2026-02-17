alter table products 
add column if not exists variants jsonb default '[]'::jsonb;
