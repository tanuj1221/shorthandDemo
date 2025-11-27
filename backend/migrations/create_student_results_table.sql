-- Create student_results table to store test results
CREATE TABLE IF NOT EXISTS student_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  institute_id INT NOT NULL,
  passage_name VARCHAR(255) NOT NULL,
  marks DECIMAL(5,2) NOT NULL,
  total_mistakes INT DEFAULT 0,
  grammar_mistakes INT DEFAULT 0,
  spelling_mistakes INT DEFAULT 0,
  added_words INT DEFAULT 0,
  missed_words INT DEFAULT 0,
  test_date DATE NOT NULL,
  test_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_id (student_id),
  INDEX idx_institute_id (institute_id),
  INDEX idx_test_date (test_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
