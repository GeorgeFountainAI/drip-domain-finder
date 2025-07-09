-- Create search_history table
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own search history" 
ON public.search_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search history" 
ON public.search_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance on user_id queries
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);

-- Create index for better performance on timestamp queries
CREATE INDEX idx_search_history_created_at ON public.search_history(created_at DESC);