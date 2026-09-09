-- ============================================================================
-- HARDENING DE SEGURANÇA - Ramais Brasilink
-- ============================================================================
-- Este script substitui e corrige os scripts antigos em scripts/fixes/
-- (enable_secure_login.sql, enable_secure_ramais_operations.sql,
--  sql_fix_rls_policies.sql, sql_fix_rls_ramais_usuario_telefonia.sql) e
-- scripts/sql_solucao_completa.sql, que desabilitavam RLS e liberavam
-- escrita para o papel "anon" sem nenhuma verificação de autenticação.
--
-- O que este script faz:
--   1. Passa a guardar senhas com hash (bcrypt via pgcrypto), nunca texto puro.
--   2. Cria uma tabela real de sessões (admin_sessions) — login gera um
--      token de sessão, que o frontend envia no header "x-session-token"
--      em toda chamada ao Supabase. Sem token válido, nenhuma escrita é aceita.
--   3. Reabilita RLS em todas as tabelas sensíveis e força toda leitura/escrita
--      administrativa a passar pela verificação de sessão (is_admin_session()).
--   4. Cria uma view pública (ramais_publico) que expõe apenas os campos
--      necessários para o dashboard público, sem os campos de credencial SIP
--      (servidor_sip, usuario, dominio, login, senha).
--
-- IMPORTANTE - execute na ordem, em um único SQL Editor do Supabase.
-- IMPORTANTE - depois de rodar isso, troque manualmente a senha do usuário
--   luccsilva07@gmail.com pelo painel Admin > Usuários. A senha antiga
--   ficou exposta em texto puro no histórico do Git público (veja
--   scripts/sql_update_senha_texto_simples.sql) e deve ser considerada
--   comprometida.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensão necessária para hash de senha (crypt/gen_salt)
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Migrar senhas em texto puro para hash bcrypt (idempotente)
-- ----------------------------------------------------------------------------
UPDATE usuario_telefonia
SET senha = extensions.crypt(senha, extensions.gen_salt('bf'))
WHERE senha IS NOT NULL
  AND senha !~ '^\$2[aby]\$';

-- Hash automático em qualquer INSERT/UPDATE futuro, mesmo vindo do app
-- (assim o app continua enviando a senha em texto puro no formulário e o
-- banco garante que ela nunca é persistida sem hash).
-- search_path inclui "extensions" porque o Supabase instala o pgcrypto
-- (crypt/gen_salt) nesse schema, não em "public".
CREATE OR REPLACE FUNCTION hash_senha_usuario_telefonia()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.senha IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.senha IS DISTINCT FROM OLD.senha)
     AND NEW.senha !~ '^\$2[aby]\$' THEN
    NEW.senha := crypt(NEW.senha, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_hash_senha_usuario_telefonia ON usuario_telefonia;
CREATE TRIGGER trigger_hash_senha_usuario_telefonia
  BEFORE INSERT OR UPDATE ON usuario_telefonia
  FOR EACH ROW
  EXECUTE FUNCTION hash_senha_usuario_telefonia();

-- ----------------------------------------------------------------------------
-- 2. Tabela de sessões de admin (login real, validado no banco)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuario_telefonia(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);

-- Ninguém acessa essa tabela diretamente via API - só as funções abaixo
-- (SECURITY DEFINER) podem ler/escrever nela.
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON admin_sessions FROM anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Funções auxiliares de sessão
-- ----------------------------------------------------------------------------

-- Lê o token enviado pelo frontend no header "x-session-token"
CREATE OR REPLACE FUNCTION session_token_header()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_header text;
BEGIN
  v_header := current_setting('request.headers', true)::json ->> 'x-session-token';
  IF v_header IS NULL OR v_header = '' THEN
    RETURN NULL;
  END IF;
  RETURN v_header::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;

-- Verdadeiro se o header enviado corresponde a uma sessão válida e não expirada.
-- Usada dentro das políticas de RLS de todas as tabelas administrativas.
CREATE OR REPLACE FUNCTION is_admin_session()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_token uuid;
  v_valid boolean;
BEGIN
  v_token := session_token_header();
  IF v_token IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM admin_sessions
    WHERE token = v_token AND expires_at > now()
  ) INTO v_valid;

  RETURN v_valid;
END;
$$;

GRANT EXECUTE ON FUNCTION session_token_header() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_admin_session() TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. Login / logout / validação de sessão
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION login_admin(p_email TEXT, p_password TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
-- "extensions" é onde o Supabase instala o pgcrypto (crypt/gen_salt)
SET search_path = public, extensions
AS $$
DECLARE
  v_user usuario_telefonia;
  v_token uuid;
BEGIN
  SELECT * INTO v_user
  FROM usuario_telefonia
  WHERE email = p_email
  LIMIT 1;

  IF v_user IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Email ou senha inválidos');
  END IF;

  IF v_user.ativo IS FALSE THEN
    RETURN json_build_object('success', false, 'error', 'Usuário inativo');
  END IF;

  IF v_user.senha IS NULL OR crypt(p_password, v_user.senha) <> v_user.senha THEN
    RETURN json_build_object('success', false, 'error', 'Email ou senha inválidos');
  END IF;

  v_token := gen_random_uuid();
  INSERT INTO admin_sessions (token, usuario_id, expires_at)
  VALUES (v_token, v_user.id, now() + interval '12 hours');

  UPDATE usuario_telefonia
  SET ultimo_login = now(), updated_at = now()
  WHERE id = v_user.id;

  RETURN json_build_object(
    'success', true,
    'session_token', v_token,
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

GRANT EXECUTE ON FUNCTION login_admin(text, text) TO anon, authenticated;

-- Invalida a sessão atual (token vindo do header)
CREATE OR REPLACE FUNCTION logout_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM admin_sessions WHERE token = session_token_header();
END;
$$;

GRANT EXECUTE ON FUNCTION logout_admin() TO anon, authenticated;

-- Usada pelo frontend ao carregar o painel, para confirmar que a sessão
-- ainda é válida no banco (não confia apenas no localStorage).
CREATE OR REPLACE FUNCTION validate_session()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session admin_sessions;
  v_user usuario_telefonia;
BEGIN
  SELECT * INTO v_session
  FROM admin_sessions
  WHERE token = session_token_header() AND expires_at > now();

  IF v_session IS NULL THEN
    RETURN json_build_object('valid', false);
  END IF;

  SELECT * INTO v_user FROM usuario_telefonia WHERE id = v_session.usuario_id;

  IF v_user IS NULL OR v_user.ativo IS FALSE THEN
    RETURN json_build_object('valid', false);
  END IF;

  RETURN json_build_object(
    'valid', true,
    'user', json_build_object(
      'id', v_user.id,
      'nome', v_user.nome,
      'email', v_user.email,
      'role', v_user.role
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION validate_session() TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. usuario_telefonia - RLS + esconder a coluna "senha" de qualquer leitura
-- ----------------------------------------------------------------------------
ALTER TABLE usuario_telefonia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de usuario_telefonia" ON usuario_telefonia;
DROP POLICY IF EXISTS "Permitir atualização de usuario_telefonia" ON usuario_telefonia;
DROP POLICY IF EXISTS "Permitir inserção de usuario_telefonia" ON usuario_telefonia;
DROP POLICY IF EXISTS "Permitir tudo usuario_telefonia" ON usuario_telefonia;
DROP POLICY IF EXISTS "admin_all_usuario_telefonia" ON usuario_telefonia;

CREATE POLICY "admin_all_usuario_telefonia" ON usuario_telefonia
  FOR ALL
  USING (is_admin_session())
  WITH CHECK (is_admin_session());

-- Column-level: mesmo uma sessão de admin nunca lê a coluna "senha" via API
-- REST direta - mitigação extra caso algum código futuro use select('*').
REVOKE ALL ON usuario_telefonia FROM anon, authenticated;
GRANT SELECT (id, nome, email, role, departamento, ativo, ultimo_login, created_at, updated_at)
  ON usuario_telefonia TO anon, authenticated;
GRANT INSERT (nome, email, senha, role, departamento, ativo)
  ON usuario_telefonia TO anon, authenticated;
GRANT UPDATE (nome, email, senha, role, departamento, ativo, ultimo_login, updated_at)
  ON usuario_telefonia TO anon, authenticated;
GRANT DELETE ON usuario_telefonia TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. ramais - trava a tabela real; dashboard público usa a view abaixo
-- ----------------------------------------------------------------------------
ALTER TABLE ramais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de ramais" ON ramais;
DROP POLICY IF EXISTS "Permitir tudo ramais" ON ramais;
DROP POLICY IF EXISTS "admin_all_ramais" ON ramais;

CREATE POLICY "admin_all_ramais" ON ramais
  FOR ALL
  USING (is_admin_session())
  WITH CHECK (is_admin_session());

-- View pública: só os campos necessários para o dashboard, nunca as
-- credenciais SIP (servidor_sip, usuario, dominio, login, senha).
-- Views são executadas com o privilégio do dono (postgres), por isso
-- continuam visíveis mesmo com RLS travando a tabela base para "anon".
CREATE OR REPLACE VIEW ramais_publico AS
SELECT
  id, nome, ramal, departamento, descricao, status,
  supervisor, coordenador, legenda_supervisor, legenda_coordenador,
  created_at, updated_at
FROM ramais;

GRANT SELECT ON ramais_publico TO anon, authenticated;

-- Leitura completa (com credenciais SIP) só para sessão de admin válida.
CREATE OR REPLACE FUNCTION admin_get_ramais()
RETURNS SETOF ramais
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin_session() THEN
    RAISE EXCEPTION 'Sessão inválida ou expirada';
  END IF;
  RETURN QUERY SELECT * FROM ramais ORDER BY ramal;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_get_ramais() TO anon, authenticated;

-- RPCs de escrita já existentes: agora exigem sessão de admin válida.
CREATE OR REPLACE FUNCTION create_ramal(
  p_ramal jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_ramal jsonb;
BEGIN
  IF NOT is_admin_session() THEN
    RAISE EXCEPTION 'Sessão inválida ou expirada';
  END IF;

  INSERT INTO ramais (
    nome, ramal, departamento, descricao, servidor_sip, usuario, dominio,
    login, senha, status, supervisor, coordenador,
    legenda_supervisor, legenda_coordenador
  ) VALUES (
    (p_ramal->>'nome'),
    (p_ramal->>'ramal'),
    (p_ramal->>'departamento'),
    (p_ramal->>'descricao'),
    (p_ramal->>'servidor_sip'),
    (p_ramal->>'usuario'),
    (p_ramal->>'dominio'),
    (p_ramal->>'login'),
    (p_ramal->>'senha'),
    (p_ramal->>'status'),
    COALESCE((p_ramal->>'supervisor')::boolean, false),
    COALESCE((p_ramal->>'coordenador')::boolean, false),
    (p_ramal->>'legenda_supervisor'),
    (p_ramal->>'legenda_coordenador')
  )
  RETURNING to_jsonb(ramais.*) INTO v_new_ramal;

  RETURN v_new_ramal;
END;
$$;

CREATE OR REPLACE FUNCTION update_ramal(
  p_id uuid,
  p_updates jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_ramal jsonb;
BEGIN
  IF NOT is_admin_session() THEN
    RAISE EXCEPTION 'Sessão inválida ou expirada';
  END IF;

  UPDATE ramais
  SET
    nome = COALESCE((p_updates->>'nome'), nome),
    ramal = COALESCE((p_updates->>'ramal'), ramal),
    departamento = COALESCE((p_updates->>'departamento'), departamento),
    descricao = COALESCE((p_updates->>'descricao'), descricao),
    servidor_sip = COALESCE((p_updates->>'servidor_sip'), servidor_sip),
    usuario = COALESCE((p_updates->>'usuario'), usuario),
    dominio = COALESCE((p_updates->>'dominio'), dominio),
    login = COALESCE((p_updates->>'login'), login),
    senha = COALESCE((p_updates->>'senha'), senha),
    status = COALESCE((p_updates->>'status'), status),
    supervisor = COALESCE((p_updates->>'supervisor')::boolean, supervisor),
    coordenador = COALESCE((p_updates->>'coordenador')::boolean, coordenador),
    legenda_supervisor = COALESCE((p_updates->>'legenda_supervisor'), legenda_supervisor),
    legenda_coordenador = COALESCE((p_updates->>'legenda_coordenador'), legenda_coordenador),
    updated_at = NOW()
  WHERE id = p_id
  RETURNING to_jsonb(ramais.*) INTO v_updated_ramal;

  IF v_updated_ramal IS NULL THEN
     RAISE EXCEPTION 'Ramal not found or update failed';
  END IF;

  RETURN v_updated_ramal;
END;
$$;

CREATE OR REPLACE FUNCTION delete_ramal(
  p_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin_session() THEN
    RAISE EXCEPTION 'Sessão inválida ou expirada';
  END IF;

  DELETE FROM ramais WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_all_ramais_config(
  p_updates jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin_session() THEN
    RAISE EXCEPTION 'Sessão inválida ou expirada';
  END IF;

  UPDATE ramais
  SET
    dominio = COALESCE((p_updates->>'dominio'), dominio),
    servidor_sip = COALESCE((p_updates->>'servidor_sip'), servidor_sip),
    updated_at = NOW()
  WHERE id IS NOT NULL;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION create_ramal(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_ramal(uuid, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_ramal(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_all_ramais_config(jsonb) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 7. departamentos - leitura pública, escrita só para admin
-- ----------------------------------------------------------------------------
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de departamentos" ON departamentos;
DROP POLICY IF EXISTS "Permitir modificação de departamentos para autenticados" ON departamentos;
DROP POLICY IF EXISTS "public_select_departamentos" ON departamentos;
DROP POLICY IF EXISTS "admin_write_departamentos" ON departamentos;

CREATE POLICY "public_select_departamentos" ON departamentos
  FOR SELECT USING (true);

CREATE POLICY "admin_write_departamentos" ON departamentos
  FOR ALL
  USING (is_admin_session())
  WITH CHECK (is_admin_session());

-- ----------------------------------------------------------------------------
-- 8. numero_tecnicos - leitura pública, escrita só para admin
-- ----------------------------------------------------------------------------
ALTER TABLE numero_tecnicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de numero_tecnicos" ON numero_tecnicos;
DROP POLICY IF EXISTS "Permitir modificação de numero_tecnicos para autenticados" ON numero_tecnicos;
DROP POLICY IF EXISTS "public_select_numero_tecnicos" ON numero_tecnicos;
DROP POLICY IF EXISTS "admin_write_numero_tecnicos" ON numero_tecnicos;

CREATE POLICY "public_select_numero_tecnicos" ON numero_tecnicos
  FOR SELECT USING (true);

CREATE POLICY "admin_write_numero_tecnicos" ON numero_tecnicos
  FOR ALL
  USING (is_admin_session())
  WITH CHECK (is_admin_session());

-- ----------------------------------------------------------------------------
-- 9. notificacoes - leitura pública (ticker), escrita só para admin
-- ----------------------------------------------------------------------------
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de notificacoes" ON notificacoes;
DROP POLICY IF EXISTS "Permitir inserção de notificacoes para autenticados" ON notificacoes;
DROP POLICY IF EXISTS "Permitir atualização de notificacoes para autenticados" ON notificacoes;
DROP POLICY IF EXISTS "public_select_notificacoes" ON notificacoes;
DROP POLICY IF EXISTS "admin_write_notificacoes" ON notificacoes;

CREATE POLICY "public_select_notificacoes" ON notificacoes
  FOR SELECT USING (true);

CREATE POLICY "admin_write_notificacoes" ON notificacoes
  FOR ALL
  USING (is_admin_session())
  WITH CHECK (is_admin_session());

-- ----------------------------------------------------------------------------
-- 10. ips_permitidos - 100% administrativo (nunca público)
-- ----------------------------------------------------------------------------
ALTER TABLE ips_permitidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_ips_permitidos" ON ips_permitidos;

CREATE POLICY "admin_all_ips_permitidos" ON ips_permitidos
  FOR ALL
  USING (is_admin_session())
  WITH CHECK (is_admin_session());

-- Validação de formato também no banco (defesa em profundidade -
-- a validação de IP no frontend pode ser contornada por quem chama a API
-- diretamente). Aceita IPv4 simples ou IPv4/CIDR.
ALTER TABLE ips_permitidos DROP CONSTRAINT IF EXISTS ips_permitidos_ip_formato;
ALTER TABLE ips_permitidos
  ADD CONSTRAINT ips_permitidos_ip_formato
  CHECK (ip ~ '^(\d{1,3}\.){3}\d{1,3}(/\d{1,2})?$');

-- Automação de servidor (update_nginx_ips.py / update_traefik_ips.py) deve
-- usar a SERVICE ROLE KEY (nunca a anon key) para ler esta tabela - ver
-- scripts/server/README.md.

-- ============================================================================
-- FIM. Depois de rodar este script:
--   1. Troque a senha do usuário luccsilva07@gmail.com pelo painel Admin.
--   2. Atualize os scripts de servidor (update_nginx_ips.py /
--      update_traefik_ips.py) para usar SUPABASE_SERVICE_ROLE_KEY.
--   3. Considere reescrever o histórico do Git (ou tornar o repositório
--      privado) para remover a senha antiga exposta nos commits antigos.
-- ============================================================================
