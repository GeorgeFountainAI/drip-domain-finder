-- Create a function that inserts into user_credits after user signup
create or replace function public.handle_new_user_credits()
returns trigger as $$
begin
  insert into public.user_credits (user_id, current_credits, total_purchased_credits)
  values (new.id, 0, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create user_credits record on user signup
create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row execute function public.handle_new_user_credits();