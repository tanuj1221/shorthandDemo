-- Migration: Add is_logged_in column to student14 table
-- This prevents multiple simultaneous logins with the same credentials

-- Add the is_logged_in column if it doesn't exist
ALTER TABLE student14 
ADD COLUMN IF NOT EXISTS is_logged_in TINYINT(1) DEFAULT 0;

-- Set all existing students to logged out state
UPDATE student14 SET is_logged_in = 0;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_is_logged_in ON student14(is_logged_in);
