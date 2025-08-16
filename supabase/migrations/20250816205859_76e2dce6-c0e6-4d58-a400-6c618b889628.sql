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
  status IN ('completed', 'failed')
) WITH CHECK (
  auth.role() = 'service_role' AND
  status IN ('completed', 'failed')
);

-- Add a trigger to prevent modification of completed purchases
CREATE OR REPLACE FUNCTION public.prevent_completed_purchase_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent any changes to completed purchases
  IF OLD.status = 'completed' THEN
    RAISE EXCEPTION 'Completed purchases cannot be modified';
  END IF;
  
  -- Ensure critical fields cannot be changed during updates
  IF OLD.stripe_session_id != NEW.stripe_session_id OR
     OLD.user_id != NEW.user_id OR
     OLD.credits != NEW.credits OR
     OLD.amount != NEW.amount THEN
    RAISE EXCEPTION 'Critical purchase fields cannot be modified';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_completed_purchase_updates
  BEFORE UPDATE ON public.credit_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_completed_purchase_changes();