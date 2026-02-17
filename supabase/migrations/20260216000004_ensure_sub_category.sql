
-- Setup safe column addition
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'sub_category') THEN 
        ALTER TABLE "public"."transactions" ADD COLUMN "sub_category" text; 
    END IF; 
END $$;
