-- Add parent_id column to storage_folders table for nested folders
ALTER TABLE storage_folders 
ADD COLUMN parent_id INT NULL AFTER id,
ADD FOREIGN KEY (parent_id) REFERENCES storage_folders(id) ON DELETE CASCADE;

-- Add index for faster lookups
CREATE INDEX idx_storage_folders_parent_id ON storage_folders(parent_id);
