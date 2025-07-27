-- Fix the questions table sequence to avoid duplicate key errors
-- This script should be run after the initial data is loaded

-- First, find the maximum ID in the questions table
SELECT MAX(id) FROM questions;

-- Reset the sequence to start from the next available ID
-- Replace 'X' with the actual maximum ID found above
SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions));

-- Verify the sequence is set correctly
SELECT currval('questions_id_seq'); 