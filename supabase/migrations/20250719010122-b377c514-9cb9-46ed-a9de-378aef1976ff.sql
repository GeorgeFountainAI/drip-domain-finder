-- One-time backfill script to create user_credits records for existing users
-- This patches any users who existed before the automatic trigger was created
-- and ensures all users have the required user_credits record to prevent 
-- "Unable to check usage limits" errors

INSERT INTO public.user_credits (user_id, current_credits, total_purchased_credits)
SELECT 
  au.id as user_id,
  0 as current_credits,
  0 as total_purchased_credits
FROM auth.users au
LEFT JOIN public.user_credits uc ON au.id = uc.user_id
WHERE uc.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;