-- Remove overly permissive service policies
DROP POLICY IF EXISTS "Service can insert purchases" ON public.credit_purchases;
DROP POLICY IF EXISTS "Service can update purchases" ON public.credit_purchases;

-- Create more restrictive policies for legitimate payment processing
-- Only allow inserts with valid stripe_session_id and user_id
CREATE POLICY "Legitimate payment inserts only" 
ON public.credit_purchases 
FOR INSERT 
WITH CHECK (
  auth.role() = 'service_role' AND
  stripe_session_id IS NOT NULL AND
  stripe_session_id != '' AND
  user_id IS NOT NULL AND
  credits > 0 AND
  amount > 0 AND
  status IN ('pending', 'completed', 'failed')
);

-- Only allow status updates from pending to completed/failed
CREATE POLICY "Payment status updates only" 
ON public.credit_purchases 
FOR UPDATE 
USING (
  auth.role() = 'service_role' AND
  OLD.status = 'pending' AND
  NEW.status IN ('completed', 'failed') AND
  -- Prevent modification of critical fields during status updates
  OLD.stripe_session_id = NEW.stripe_session_id AND
  OLD.user_id = NEW.user_id AND
  OLD.credits = NEW.credits AND
  OLD.amount = NEW.amount
);

-- Add a trigger to prevent direct manipulation of completed purchases
CREATE OR REPLACE FUNCTION public.prevent_completed_purchase_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent any changes to completed purchases except by specific functions
  IF OLD.status = 'completed' THEN
    RAISE EXCEPTION 'Completed purchases cannot be modified';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_completed_purchase_updates
  BEFORE UPDATE ON public.credit_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_completed_purchase_changes();