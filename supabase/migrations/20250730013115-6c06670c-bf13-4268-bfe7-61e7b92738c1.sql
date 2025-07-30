-- Fix security definer functions by setting search path
CREATE OR REPLACE FUNCTION public.complete_credit_purchase(stripe_session_id text, user_id uuid, credits integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  purchase_record RECORD;
  result JSON;
BEGIN
  -- Update the purchase record to completed
  UPDATE public.credit_purchases 
  SET status = 'completed', updated_at = now()
  WHERE stripe_session_id = $1 AND user_id = $2
  RETURNING * INTO purchase_record;
  
  IF purchase_record IS NULL THEN
    RAISE EXCEPTION 'Purchase record not found for session % and user %', $1, $2;
  END IF;
  
  -- Update or insert user credits
  INSERT INTO public.user_credits (user_id, current_credits, total_purchased_credits)
  VALUES ($2, $3, $3)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    current_credits = public.user_credits.current_credits + $3,
    total_purchased_credits = public.user_credits.total_purchased_credits + $3,
    updated_at = now();
    
  -- Return success result
  SELECT json_build_object(
    'success', true,
    'credits_added', $3,
    'purchase_id', purchase_record.id
  ) INTO result;
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
declare
  free_credits int;
begin
  -- Get free_trial_credits value from settings
  select value into free_credits from public.settings where key = 'free_trial_credits';

  -- Fallback if not set
  if free_credits is null then
    free_credits := 0;
  end if;

  -- Insert into user_credits
  insert into public.user_credits (user_id, current_credits, total_purchased_credits)
  values (new.id, free_credits, 0);

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.ensure_user_starter_credits(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$