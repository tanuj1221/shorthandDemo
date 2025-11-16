-- Create notices table for landing page noticeboard
CREATE TABLE IF NOT EXISTS notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_priority (priority),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample notices
INSERT INTO notices (title, content, priority, is_active) VALUES
('Welcome to Shorthand LMS', 'We are excited to have you here! Start your stenography journey with our expert-led courses.', 'high', 1),
('New Course Available', 'English Shorthand 160 WPM course is now available. Enroll today!', 'normal', 1),
('System Maintenance', 'Scheduled maintenance on Sunday 2 AM - 4 AM IST. Services may be temporarily unavailable.', 'urgent', 1);
