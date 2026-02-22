
-- Fix search_path on existing function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'visualizacao');
  return new;
end;
$$;
