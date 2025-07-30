-- Ensure all users have at least 50 starter credits
UPDATE public.user_credits 
SET current_credits = GREATEST(current_credits, 50)
WHERE current_credits < 50;