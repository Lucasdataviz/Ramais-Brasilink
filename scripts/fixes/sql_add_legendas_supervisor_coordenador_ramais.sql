-- Script para adicionar campos de legenda para supervisor e coordenador na tabela ramais
-- Execute este SQL no Supabase

-- 1. Verificar se os campos já existem
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ramais' 
AND (column_name = 'legenda_supervisor' OR column_name = 'legenda_coordenador');

-- 2. Adicionar o campo legenda_supervisor (se não existir)
ALTER TABLE ramais
ADD COLUMN IF NOT EXISTS legenda_supervisor TEXT;

-- 3. Adicionar o campo legenda_coordenador (se não existir)
ALTER TABLE ramais
ADD COLUMN IF NOT EXISTS legenda_coordenador TEXT;

-- 4. Verificar se foram adicionados corretamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ramais'
AND (column_name = 'legenda_supervisor' OR column_name = 'legenda_coordenador');

-- 5. Exemplo: Atualizar ramal com legenda de supervisor
-- UPDATE ramais
-- SET legenda_supervisor = 'Supervisor do Comercial'
-- WHERE nome = 'João Silva' AND supervisor = true;

-- 6. Exemplo: Atualizar ramal com legenda de coordenador
-- UPDATE ramais
-- SET legenda_coordenador = 'Coordenador do SAC'
-- WHERE nome = 'Maria Santos' AND coordenador = true;

