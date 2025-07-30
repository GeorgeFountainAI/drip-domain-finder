-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = user_id),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.get_all_users_with_credits()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  current_credits INTEGER,
  total_purchased_credits INTEGER,
  is_admin BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.id as user_id,
    p.email,
    COALESCE(uc.current_credits, 0) as current_credits,
    COALESCE(uc.total_purchased_credits, 0) as total_purchased_credits,
    p.is_admin,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.user_credits uc ON p.id = uc.user_id
  WHERE public.is_admin() = true
  ORDER BY p.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_user_credits(
  target_user_id UUID,
  credit_change INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSON;
  new_credits INTEGER;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Update or insert user credits
  INSERT INTO public.user_credits (user_id, current_credits, total_purchased_credits)
  VALUES (target_user_id, GREATEST(0, credit_change), 0)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    current_credits = GREATEST(0, public.user_credits.current_credits + credit_change),
    updated_at = now()
  RETURNING current_credits INTO new_credits;
  
  -- Return result
  SELECT json_build_object(
    'success', true,
    'user_id', target_user_id,
    'new_credits', new_credits,
    'credit_change', credit_change
  ) INTO result;
  
  RETURN result;
END;
$$;