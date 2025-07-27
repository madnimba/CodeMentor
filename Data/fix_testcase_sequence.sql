-- Fix the testcases table sequence to avoid duplicate key errors
-- This script should be run after the initial data is loaded

-- First, find the maximum ID in the testcases table
SELECT MAX(id) FROM testcases;

-- Reset the sequence to start from the next available ID
-- Replace 'X' with the actual maximum ID found above
SELECT setval('testcases_id_seq', (SELECT MAX(id) FROM testcases));

-- Verify the sequence is set correctly
SELECT currval('testcases_id_seq'); 