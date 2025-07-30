-- First, let's create a function to ensure new users get starter credits
CREATE OR REPLACE FUNCTION public.ensure_user_starter_credits(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_credits_record RECORD;
  starter_credits int := 20;
  result JSON;
BEGIN
  -- Check if user already has a credits record
  SELECT * INTO user_credits_record 
  FROM public.user_credits 
  WHERE user_id = target_user_id;
  
  -- If no record exists, create one with starter credits
  IF user_credits_record IS NULL THEN
    INSERT INTO public.user_credits (user_id, current_credits, total_purchased_credits)
    VALUES (target_user_id, starter_credits, 0)
    RETURNING * INTO user_credits_record;
    
    SELECT json_build_object(
      'success', true,
      'credits_granted', starter_credits,
      'new_user', true,
      'current_credits', starter_credits
    ) INTO result;
  ELSE
    -- User already exists, return current credits without changing them
    SELECT json_build_object(
      'success', true,
      'credits_granted', 0,
      'new_user', false,
      'current_credits', user_credits_record.current_credits
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$function$