-- Fix database sequences to avoid duplicate key errors
-- This script should be run after the initial data is loaded

-- Fix questions table sequence
SELECT setval('questions_id_seq', (SELECT COALESCE(MAX(id), 0) FROM questions));

-- Fix testcases table sequence
SELECT setval('testcases_id_seq', (SELECT COALESCE(MAX(id), 0) FROM testcases));

-- Fix companyquestions table sequence
SELECT setval('companyquestions_id_seq', (SELECT COALESCE(MAX(id), 0) FROM companyquestions));

-- Verify all sequences are set correctly
SELECT 'questions_id_seq' as sequence_name, currval('questions_id_seq') as current_value
UNION ALL
SELECT 'testcases_id_seq' as sequence_name, currval('testcases_id_seq') as current_value
UNION ALL
SELECT 'companyquestions_id_seq' as sequence_name, currval('companyquestions_id_seq') as current_value; 