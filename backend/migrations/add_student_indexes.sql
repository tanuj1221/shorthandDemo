-- Add indexes to improve registration performance
-- Run this on your database to fix 504 timeouts

-- Index for faster MAX(student_id) lookup by institute
CREATE INDEX IF NOT EXISTS idx_student_institute_id 
ON student14(instituteId, student_id);

-- Index for faster student lookups
CREATE INDEX IF NOT EXISTS idx_student_id 
ON student14(student_id);

-- Index for payment status queries
CREATE INDEX IF NOT EXISTS idx_student_amount 
ON student14(instituteId, amount);

-- Show indexes
SHOW INDEX FROM student14;
