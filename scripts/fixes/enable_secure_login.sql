-- Enable RLS on the table
ALTER TABLE usuario_telefonia ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows the function to work, or rely on SECURITY DEFINER.
-- SECURITY DEFINER functions bypass RLS, so no specific policy is needed for the function to access the table,
-- but the function itself must be granted EXECUTE permissions.

-- However, if you want to allow "select" for some reason, you can add:
-- CREATE POLICY "Allow read for everyone" ON usuario_telefonia FOR SELECT USING (true);
-- BUT this is insecure as it exposes passwords. Do NOT do this if you want security.

-- Secure Login Function
CREATE OR REPLACE FUNCTION login_admin(p_email TEXT, p_password TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (db owner), bypassing RLS
SET search_path = public -- Security best practice
AS $$
DECLARE
  v_user usuario_telefonia;
BEGIN
  -- Search for user
  SELECT * INTO v_user
  FROM usuario_telefonia
  WHERE email = p_email
  LIMIT 1;

  -- Check if found
  IF v_user IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Email ou senha inválidos');
  END IF;

  -- Check active status
  IF v_user.ativo IS FALSE THEN
    RETURN json_build_object('success', false, 'error', 'Usuário inativo');
  END IF;

  -- Check password (plaintext comparison as per current system)
  IF v_user.senha <> p_password THEN
    RETURN json_build_object('success', false, 'error', 'Email ou senha inválidos');
  END IF;

  -- Update last login
  UPDATE usuario_telefonia
  SET ultimo_login = NOW(), updated_at = NOW()
  WHERE id = v_user.id;

  -- Return success and safe user data
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_user.id,
      'nome', v_user.nome,
      'email', v_user.email,
      'role', v_user.role,
      'created_at', v_user.created_at
    )
  );
END;
$$;

-- Grant execution to public (anon) and authenticated users
GRANT EXECUTE ON FUNCTION login_admin(text, text) TO anon, authenticated, service_role;
