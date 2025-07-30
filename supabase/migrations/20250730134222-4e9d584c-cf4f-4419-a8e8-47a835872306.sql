-- Fix the profiles table and ensure first user gets admin
-- First, check if we have any users in auth.users and sync them to profiles
DO $$
DECLARE
    user_record RECORD;
    user_count INTEGER;
BEGIN
    -- Count existing profiles
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    -- If no profiles exist, sync from auth.users
    IF user_count = 0 THEN
        FOR user_record IN SELECT id, email, created_at FROM auth.users ORDER BY created_at ASC LOOP
            INSERT INTO public.profiles (id, email, is_admin, created_at)
            VALUES (
                user_record.id, 
                user_record.email,
                -- First user gets admin, others don't
                (SELECT COUNT(*) FROM public.profiles) = 0,
                user_record.created_at
            );
        END LOOP;
    END IF;
    
    -- If we still have no admin users but have profiles, make the first one admin
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE is_admin = true) AND 
       EXISTS (SELECT 1 FROM public.profiles) THEN
        UPDATE public.profiles 
        SET is_admin = true 
        WHERE id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1);
    END IF;
END $$;

-- Now ensure all users have proper starter credits
-- Update the trigger to handle existing users without credits
CREATE OR REPLACE FUNCTION public.ensure_user_starter_credits_migration()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    user_record RECORD;
    starter_credits int;
BEGIN
    -- Get starter_credits value from settings
    SELECT value INTO starter_credits FROM public.settings WHERE key = 'starter_credits';
    
    -- Fallback if not set
    IF starter_credits IS NULL THEN
        starter_credits := 50;
    END IF;

    -- Process all users who don't have credits or have 0 credits
    FOR user_record IN 
        SELECT p.id as user_id
        FROM public.profiles p
        LEFT JOIN public.user_credits uc ON p.id = uc.user_id
        WHERE uc.user_id IS NULL OR uc.current_credits = 0
    LOOP
        -- Insert or update user credits
        INSERT INTO public.user_credits (user_id, current_credits, total_purchased_credits)
        VALUES (user_record.user_id, starter_credits, 0)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            current_credits = GREATEST(public.user_credits.current_credits, starter_credits),
            updated_at = now();
    END LOOP;
END;
$$;

-- Run the migration function
SELECT public.ensure_user_starter_credits_migration();

-- Clean up the temporary function
DROP FUNCTION public.ensure_user_starter_credits_migration();