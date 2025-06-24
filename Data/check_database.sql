-- Check database structure and data
-- Run this script to verify the database setup

-- Check if questions table exists and has data
SELECT COUNT(*) as total_questions FROM questions;

-- Check if companyquestions table exists and has data
SELECT COUNT(*) as total_company_questions FROM companyquestions;

-- Check if difficulty column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'questions' AND column_name = 'difficulty';

-- Check sample questions with their difficulty
SELECT id, title, difficulty 
FROM questions 
LIMIT 10;

-- Check sample company questions
SELECT cq.id, cq.company_id, cq.question_id, q.title, q.difficulty
FROM companyquestions cq
JOIN questions q ON cq.question_id = q.id
LIMIT 10;

-- Check questions for company 1
SELECT cq.id, cq.company_id, cq.question_id, q.title, q.difficulty
FROM companyquestions cq
JOIN questions q ON cq.question_id = q.id
WHERE cq.company_id = 1
LIMIT 10; 