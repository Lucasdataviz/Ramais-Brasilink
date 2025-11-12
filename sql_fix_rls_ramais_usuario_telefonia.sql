-- SQL para corrigir RLS (Row Level Security) nas tabelas
-- Execute este SQL para resolver o erro 406

-- 1. Desabilitar RLS na tabela ramais
ALTER TABLE ramais DISABLE ROW LEVEL SECURITY;

-- 2. Desabilitar RLS na tabela usuario_telefonia (se ainda não estiver desabilitado)
ALTER TABLE usuario_telefonia DISABLE ROW LEVEL SECURITY;

-- 3. Desabilitar RLS na tabela departamentos
ALTER TABLE departamentos DISABLE ROW LEVEL SECURITY;

-- 4. Verificar status do RLS
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('ramais', 'usuario_telefonia', 'departamentos');



