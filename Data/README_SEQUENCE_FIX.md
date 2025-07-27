# Database Sequence Fix

## Issue
When trying to create new questions, you may encounter a duplicate key error:
```
ERROR: duplicate key value violates unique constraint "questions_pkey"   
Detail: Key (id)=(1) already exists.
```

This happens because the database sequences are not synchronized with the existing data that was inserted with explicit IDs.

## Solution
Run the following SQL script to fix the sequences:

```sql
-- Connect to your database and run:
\i Data/fix_sequences.sql
```

Or manually run these commands:

```sql
-- Fix questions table sequence
SELECT setval('questions_id_seq', (SELECT COALESCE(MAX(id), 0) FROM questions));

-- Fix testcases table sequence  
SELECT setval('testcases_id_seq', (SELECT COALESCE(MAX(id), 0) FROM testcases));

-- Fix companyquestions table sequence
SELECT setval('companyquestions_id_seq', (SELECT COALESCE(MAX(id), 0) FROM companyquestions));
```

## What this does
- Finds the maximum ID in each table
- Sets the auto-increment sequence to start from the next available ID
- Prevents duplicate key errors when creating new records

## When to run this
- After initial data loading
- After any manual data insertion with explicit IDs
- When you encounter duplicate key errors 