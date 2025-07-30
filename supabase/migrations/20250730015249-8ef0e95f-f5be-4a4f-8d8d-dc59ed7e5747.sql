-- Add starter_credits setting to settings table
INSERT INTO public.settings (key, value) 
VALUES ('starter_credits', 20)
ON CONFLICT (key) DO NOTHING;

-- Create FAQ table
CREATE TABLE public.faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on FAQ table
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to FAQ
CREATE POLICY "Anyone can view FAQ entries" 
ON public.faq 
FOR SELECT 
USING (true);

-- Create policy to allow service role to manage FAQ entries
CREATE POLICY "Service role can manage FAQ entries" 
ON public.faq 
FOR ALL 
USING (auth.role() = 'service_role') 
WITH CHECK (auth.role() = 'service_role');

-- Update the ensure_user_starter_credits function to use the settings value
CREATE OR REPLACE FUNCTION public.ensure_user_starter_credits(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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
    starter_credits := 20;
  END IF;

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