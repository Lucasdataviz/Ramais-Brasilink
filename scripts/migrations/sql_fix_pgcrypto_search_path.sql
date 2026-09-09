-- ============================================================================
-- FIX: "function crypt(text, text) does not exist"
-- ============================================================================
-- O Supabase instala a extensão pgcrypto no schema "extensions", não no
-- "public". As funções do hardening (sql_security_hardening.sql) restringem
-- o search_path só para "public" por segurança, então não enxergavam
-- crypt()/gen_salt(). Este script ajusta o search_path dessas funções para
-- incluir também "extensions".
-- ============================================================================

ALTER FUNCTION login_admin(text, text) SET search_path = public, extensions;
ALTER FUNCTION hash_senha_usuario_telefonia() SET search_path = public, extensions;

-- Reaplica o hash nas senhas que ainda estejam em texto puro (a migração
-- original só falhava dentro das funções SECURITY DEFINER; a atualização em
-- massa direta já deve ter funcionado, mas rodar de novo é seguro e
-- idempotente - não re-hasheia o que já é bcrypt).
UPDATE usuario_telefonia
SET senha = extensions.crypt(senha, extensions.gen_salt('bf'))
WHERE senha IS NOT NULL
  AND senha !~ '^\$2[aby]\$';

NOTIFY pgrst, 'reload schema';
