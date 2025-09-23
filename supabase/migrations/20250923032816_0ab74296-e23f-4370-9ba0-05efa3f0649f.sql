-- Fix the ensure_user_starter_credits RPC function to handle users with 0 credits
CREATE OR REPLACE FUNCTION public.ensure_user_starter_credits(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_credits_record RECORD;
  starter_credits int;
  result JSON;
BEGIN
  -- Get starter_credits value from settings
  SELECT value INTO starter_credits FROM public.settings WHERE key = 'starter_credits';
  
  -- Fallback if not set
  IF starter_credits IS NULL THEN
    starter_credits := 10; -- Use 10 as fallback to match settings table
  END IF;

  -- Check if user already has a credits record
  SELECT * INTO user_credits_record 
  FROM public.user_credits 
  WHERE user_id = target_user_id;
  
  -- Grant starter credits if:
  -- 1. No record exists (new user)
  -- 2. User has 0 current_credits AND 0 total_purchased_credits (broken account)
  IF user_credits_record IS NULL OR 
     (user_credits_record.current_credits = 0 AND user_credits_record.total_purchased_credits = 0) THEN
    
    -- Upsert the credits record
    INSERT INTO public.user_credits (user_id, current_credits, total_purchased_credits)
    VALUES (target_user_id, starter_credits, 0)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      current_credits = starter_credits,
      updated_at = now()
    RETURNING * INTO user_credits_record;
    
    SELECT json_build_object(
      'success', true,
      'credits_granted', starter_credits,
      'new_user', true,
      'current_credits', starter_credits,
      'healed', (user_credits_record.created_at < now() - interval '1 minute') -- Detect if this was a healing operation
    ) INTO result;
  ELSE
    -- User already has credits, return current state
    SELECT json_build_object(
      'success', true,
      'credits_granted', 0,
      'new_user', false,
      'current_credits', user_credits_record.current_credits
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$function$;

-- Create admin function to heal all users with 0 credits who should have starter credits
CREATE OR REPLACE FUNCTION public.admin_heal_zero_credit_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  starter_credits int;
  healed_count int := 0;
  user_record RECORD;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Get starter_credits value from settings
  SELECT value INTO starter_credits FROM public.settings WHERE key = 'starter_credits';
  IF starter_credits IS NULL THEN
    starter_credits := 10;
  END IF;
  
  -- Find and heal users with 0 current_credits AND 0 total_purchased_credits
  FOR user_record IN 
    SELECT user_id, current_credits, total_purchased_credits
    FROM public.user_credits 
    WHERE current_credits = 0 AND total_purchased_credits = 0
  LOOP
    -- Grant starter credits to this user
    UPDATE public.user_credits 
    SET current_credits = starter_credits, updated_at = now()
    WHERE user_id = user_record.user_id;
    
    healed_count := healed_count + 1;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'healed_users_count', healed_count,
    'starter_credits_granted', starter_credits
  );
END;
$function$;