-- Update starter credits to 10 (5 searches at 2 credits each)
INSERT INTO public.settings (key, value) 
VALUES ('starter_credits', 10)
ON CONFLICT (key) 
DO UPDATE SET value = 10;

-- Keep free trial credits at same value for consistency
INSERT INTO public.settings (key, value) 
VALUES ('free_trial_credits', 10)
ON CONFLICT (key) 
DO UPDATE SET value = 10;