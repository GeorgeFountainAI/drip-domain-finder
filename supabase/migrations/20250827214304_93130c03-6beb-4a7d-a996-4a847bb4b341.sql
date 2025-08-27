
-- 1) Clean orphaned records (safe)
DELETE FROM public.user_credits uc
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = uc.user_id
);

DELETE FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = p.id
);

-- 2) Make profile provisioning idempotent (no crash on duplicates)
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (NEW.id, NEW.email, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- 3) Make credits provisioning idempotent (no crash on duplicates)
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  free_credits int;
BEGIN
  -- Read current free trial configuration (nullable-safe)
  SELECT value INTO free_credits FROM public.settings WHERE key = 'free_trial_credits';
  IF free_credits IS NULL THEN
    free_credits := 0;
  END IF;

  -- Insert credits once; do nothing if already exists
  INSERT INTO public.user_credits (user_id, current_credits, total_purchased_credits)
  VALUES (NEW.id, free_credits, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 4) Add cleanup for future user deletions (prevents new orphans)
CREATE OR REPLACE FUNCTION public.handle_deleted_user_cleanup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  DELETE FROM public.user_credits WHERE user_id = OLD.id;
  RETURN OLD;
END;
$function$;

-- 5) Recreate triggers (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted_cleanup ON auth.users;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user_profile();

CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user_credits();

CREATE TRIGGER on_auth_user_deleted_cleanup
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_deleted_user_cleanup();
