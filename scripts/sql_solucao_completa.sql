-- ========================================
-- SOLUÇÃO COMPLETA PARA CORRIGIR A TABELA
-- ========================================

-- PASSO 1: Desabilitar RLS (Row Level Security) temporariamente
-- Isso resolve o erro 406
ALTER TABLE usuario_telefonia DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Atualizar a senha para texto simples
-- Substitua 'Bslkadm1010' pela senha que você quer usar
UPDATE usuario_telefonia
SET senha = 'Bslkadm1010',  -- Senha em texto simples
    updated_at = now()
WHERE email = 'luccsilva07@gmail.com';

-- PASSO 3: Verificar se foi atualizado
SELECT id, email, senha, role, ativo, updated_at 
FROM usuario_telefonia;

-- ========================================
-- ALTERNATIVA: Se quiser manter RLS habilitado
-- ========================================

-- Habilitar RLS novamente
-- ALTER TABLE usuario_telefonia ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas
-- DROP POLICY IF EXISTS "Permitir tudo usuario_telefonia" ON usuario_telefonia;
-- CREATE POLICY "Permitir tudo usuario_telefonia" 
-- ON usuario_telefonia
-- FOR ALL
-- USING (true)
-- WITH CHECK (true);










