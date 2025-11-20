-- Add slug column to storage_folders table
ALTER TABLE storage_folders 
ADD COLUMN slug VARCHAR(255) UNIQUE AFTER name;

-- Create index on slug for faster lookups
CREATE INDEX idx_storage_folders_slug ON storage_folders(slug);
