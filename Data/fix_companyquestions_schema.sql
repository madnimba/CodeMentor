-- Fix companyquestions table schema
-- Add missing columns to companyquestions table

-- Check if year column exists in companyquestions table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'companyquestions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add year column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companyquestions' 
        AND column_name = 'year' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE companyquestions ADD COLUMN "year" INTEGER;
        RAISE NOTICE 'Added year column to companyquestions table';
    ELSE
        RAISE NOTICE 'year column already exists in companyquestions table';
    END IF;
END $$;

-- Add position column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companyquestions' 
        AND column_name = 'position' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE companyquestions ADD COLUMN position VARCHAR(255);
        RAISE NOTICE 'Added position column to companyquestions table';
    ELSE
        RAISE NOTICE 'position column already exists in companyquestions table';
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'companyquestions' AND table_schema = 'public'
ORDER BY ordinal_position; 