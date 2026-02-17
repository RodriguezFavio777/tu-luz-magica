-- Force Refresh Schema Cache (Trigger reload)
NOTIFY pgrst, 'reload config';

-- Ensure Column Exists
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES service_categories(id);

-- Optional: Re-Grant Permissions (sometimes needed after alter)
GRANT ALL ON TABLE service_categories TO anon, authenticated, service_role;
