-- Fix the testcases table schema by adding the missing expected_output column
-- This script addresses the Hibernate schema validation error

-- Add the missing expected_output column
ALTER TABLE testcases 
ADD COLUMN expected_output TEXT NOT NULL DEFAULT '';

-- Update existing records to have a default expected output
-- You may want to customize this based on your actual test case data
UPDATE testcases 
SET expected_output = 'Expected output for test case ' || id 
WHERE expected_output = '';

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'testcases' AND column_name = 'expected_output';

-- Show sample data to verify the fix
SELECT id, input, expected_output, time_limit_ms, is_public 
FROM testcases 
LIMIT 5; 