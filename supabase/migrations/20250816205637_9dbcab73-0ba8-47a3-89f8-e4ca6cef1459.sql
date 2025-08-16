-- Remove the public access policy for feedback table
DROP POLICY IF EXISTS "Anyone can view feedback" ON public.feedback;

-- Remove the duplicate insert policy 
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;

-- Add admin policy to view all feedback
CREATE POLICY "Admins can view all feedback" 
ON public.feedback 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Ensure users can only insert feedback with their own user_id
DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
CREATE POLICY "Users can insert feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);