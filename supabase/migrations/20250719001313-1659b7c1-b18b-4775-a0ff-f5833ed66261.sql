-- Create user_credits table to track user credit balances
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_credits INTEGER NOT NULL DEFAULT 0,
  total_purchased_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit_purchases table to track purchase history
CREATE TABLE public.credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL,
  amount INTEGER NOT NULL, -- amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_credits
CREATE POLICY "Users can view their own credits" 
ON public.user_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.user_credits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" 
ON public.user_credits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for credit_purchases
CREATE POLICY "Users can view their own purchases" 
ON public.credit_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert purchases" 
ON public.credit_purchases 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update purchases" 
ON public.credit_purchases 
FOR UPDATE 
USING (true);

-- Create function to complete credit purchase
CREATE OR REPLACE FUNCTION public.complete_credit_purchase(
  stripe_session_id TEXT,
  user_id UUID,
  credits INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    current_credits = user_credits.current_credits + $3,
    total_purchased_credits = user_credits.total_purchased_credits + $3,
    updated_at = now();
    
  -- Return success result
  SELECT json_build_object(
    'success', true,
    'credits_added', $3,
    'purchase_id', purchase_record.id
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_purchases_updated_at
  BEFORE UPDATE ON public.credit_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();