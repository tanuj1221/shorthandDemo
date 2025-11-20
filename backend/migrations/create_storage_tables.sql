-- Create storage_folders table
CREATE TABLE IF NOT EXISTS storage_folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Create storage_files table
CREATE TABLE IF NOT EXISTS storage_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  folder_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES storage_folders(id) ON DELETE CASCADE,
  INDEX idx_folder (folder_id),
  INDEX idx_uploaded (uploaded_at)
);
