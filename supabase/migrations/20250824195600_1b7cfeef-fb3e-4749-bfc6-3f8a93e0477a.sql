
-- Ensure starter credits match the UI (50)
INSERT INTO public.settings (key, value)
VALUES ('starter_credits', 50)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Optional: align free_trial_credits for any fallback paths using this key
INSERT INTO public.settings (key, value)
VALUES ('free_trial_credits', 50)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
