-- Add DELETE policy for search_history table so users can delete their own search history
CREATE POLICY "Users can delete their own search history" 
ON public.search_history 
FOR DELETE 
USING (auth.uid() = user_id);