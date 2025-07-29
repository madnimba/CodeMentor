-- Fix the submissions table schema by adding missing columns
-- This script addresses the Hibernate schema validation error

-- Check current submissions table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'submissions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add error_message column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'error_message' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE submissions ADD COLUMN error_message TEXT;
    END IF;

    -- Add test_cases_passed column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'test_cases_passed' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE submissions ADD COLUMN test_cases_passed INTEGER;
    END IF;

    -- Add total_test_cases column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'total_test_cases' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE submissions ADD COLUMN total_test_cases INTEGER;
    END IF;
END $$;

-- Verify the columns were added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'submissions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data to verify the fix
SELECT id, user_id, question_id, status, error_message, test_cases_passed, total_test_cases
FROM submissions 
LIMIT 5; 