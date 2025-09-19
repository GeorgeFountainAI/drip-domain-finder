-- Create RPC function to get current credit balance for authenticated user
CREATE OR REPLACE FUNCTION public.get_credit_balance()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_balance integer;
  starter_credits integer;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get user's current credits
  SELECT current_credits INTO user_balance
  FROM public.user_credits
  WHERE user_id = auth.uid();
  
  -- If no record exists, ensure starter credits are granted
  IF user_balance IS NULL THEN
    -- Get starter_credits setting or use default
    SELECT value INTO starter_credits FROM public.settings WHERE key = 'starter_credits';
    IF starter_credits IS NULL THEN
      starter_credits := 20;
    END IF;
    
    -- Create user credits record with starter credits
    INSERT INTO public.user_credits (user_id, current_credits, total_purchased_credits)
    VALUES (auth.uid(), starter_credits, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Return the starter credits amount
    RETURN starter_credits;
  END IF;
  
  RETURN user_balance;
END;
$$;

-- Create RPC function to consume credits atomically
CREATE OR REPLACE FUNCTION public.consume_credits(
  required integer,
  reason text,
  meta jsonb DEFAULT '{}'::jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Validate input
  IF required <= 0 THEN
    RAISE EXCEPTION 'Required credits must be positive';
  END IF;
  
  -- Get current balance (this will create record if needed)
  SELECT public.get_credit_balance() INTO current_balance;
  
  -- Check if user has sufficient credits
  IF current_balance < required THEN
    RAISE EXCEPTION 'insufficient_credits' USING 
      DETAIL = format('Required: %s, Available: %s', required, current_balance);
  END IF;
  
  -- Atomically deduct credits
  UPDATE public.user_credits 
  SET current_credits = current_credits - required,
      updated_at = now()
  WHERE user_id = auth.uid()
  RETURNING current_credits INTO new_balance;
  
  -- Log the credit transaction (optional audit trail)
  INSERT INTO public.credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    reason, 
    metadata,
    balance_after
  ) VALUES (
    auth.uid(), 
    -required, 
    'debit', 
    reason, 
    meta,
    new_balance
  ) ON CONFLICT DO NOTHING; -- Ignore if table doesn't exist yet
  
  RETURN new_balance;
END;
$$;