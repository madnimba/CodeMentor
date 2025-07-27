-- Check if questions table exists and has is_approved column
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'questions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- If is_approved column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' 
        AND column_name = 'is_approved' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE questions ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Check if articles table has is_approved column
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'articles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- If articles.is_approved column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'is_approved' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE articles ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
    END IF;
END $$; 