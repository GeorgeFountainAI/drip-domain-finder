-- Create profiles table with admin role
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by admins" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ) OR id = auth.uid()
);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = user_id),
    false
  );
$$;

-- Create function to get all users with credits (admin only)
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

-- Create function to update user credits (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_user_credits(
  target_user_id UUID,
  credit_change INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update user_credits policies to allow admin access
CREATE POLICY "Admins can view all user credits" 
ON public.user_credits 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can update all user credits" 
ON public.user_credits 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can insert user credits" 
ON public.user_credits 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Add trigger to update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    NEW.id, 
    NEW.email, 
    false
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_profile();