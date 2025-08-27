
-- Ensure new auth users get a profile and initial credits automatically

-- 1) Clean up any prior triggers (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;

-- 2) Create trigger to insert a profile row for each new auth user
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user_profile();

-- 3) Create trigger to insert initial credits for each new auth user
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user_credits();
