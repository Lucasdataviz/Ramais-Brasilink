-- SQL para corrigir RLS (Row Level Security) na tabela usuario_telefonia
-- O erro 406 pode ser causado por políticas RLS bloqueando o acesso

-- 1. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'usuario_telefonia';

-- 2. Desabilitar RLS temporariamente (CUIDADO: Isso remove a segurança!)
-- ALTER TABLE usuario_telefonia DISABLE ROW LEVEL SECURITY;

-- 3. Habilitar RLS e criar políticas permissivas
ALTER TABLE usuario_telefonia ENABLE ROW LEVEL SECURITY;

-- 4. Criar política para permitir SELECT (leitura) para todos
DROP POLICY IF EXISTS "Permitir leitura de usuario_telefonia" ON usuario_telefonia;
CREATE POLICY "Permitir leitura de usuario_telefonia" 
ON usuario_telefonia
FOR SELECT
USING (true);

-- 5. Criar política para permitir UPDATE (atualização) para todos
DROP POLICY IF EXISTS "Permitir atualização de usuario_telefonia" ON usuario_telefonia;
CREATE POLICY "Permitir atualização de usuario_telefonia" 
ON usuario_telefonia
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 6. Criar política para permitir INSERT (inserção) para todos
DROP POLICY IF EXISTS "Permitir inserção de usuario_telefonia" ON usuario_telefonia;
CREATE POLICY "Permitir inserção de usuario_telefonia" 
ON usuario_telefonia
FOR INSERT
WITH CHECK (true);

-- 7. Verificar as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'usuario_telefonia';

-- 8. Se preferir desabilitar RLS completamente (menos seguro, mas funciona)
-- ALTER TABLE usuario_telefonia DISABLE ROW LEVEL SECURITY;



