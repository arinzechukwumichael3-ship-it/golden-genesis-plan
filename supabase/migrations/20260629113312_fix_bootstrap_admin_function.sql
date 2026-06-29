-- Fix the bootstrap_admin function (remove is_admin column which doesn't exist)
CREATE OR REPLACE FUNCTION public.bootstrap_admin(email text, password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public, auth'
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if user exists
  SELECT id INTO new_user_id FROM auth.users WHERE auth.users.email = bootstrap_admin.email;
  
  IF new_user_id IS NOT NULL THEN
    -- User exists, just make sure they have admin role
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (new_user_id, 'admin')
    ON CONFLICT DO NOTHING;
    RETURN new_user_id;
  END IF;
  
  -- Create new user using auth schema (without is_admin column)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    bootstrap_admin.email,
    crypt(bootstrap_admin.password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;
  
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new_user_id, bootstrap_admin.email, 'Admin');
  
  -- Grant admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin');
  
  -- Create identities record for auth
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    new_user_id,
    bootstrap_admin.email,
    'email',
    jsonb_build_object('sub', new_user_id::text, 'email', bootstrap_admin.email),
    now(),
    now(),
    now()
  );
  
  RETURN new_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin(text, text) TO service_role;