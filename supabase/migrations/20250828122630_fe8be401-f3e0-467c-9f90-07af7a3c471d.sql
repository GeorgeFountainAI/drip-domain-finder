-- Clean up orphaned records from failed signups
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.user_credits 
WHERE user_id NOT IN (SELECT id FROM auth.users);