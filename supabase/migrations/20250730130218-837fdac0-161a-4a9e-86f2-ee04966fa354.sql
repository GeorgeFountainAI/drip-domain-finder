-- Check if trigger exists and create it if needed
-- First, let's check current trigger setup
DO $$
BEGIN
    -- Check if trigger exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
    ) THEN
        -- Create trigger to automatically grant starter credits to new users
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW 
          EXECUTE FUNCTION public.handle_new_user_credits();
          
        RAISE NOTICE 'Trigger on_auth_user_created created successfully';
    ELSE
        RAISE NOTICE 'Trigger on_auth_user_created already exists';
    END IF;
END $$;