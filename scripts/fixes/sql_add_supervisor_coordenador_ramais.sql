-- Script para adicionar campos supervisor e coordenador na tabela ramais
-- Execute este SQL no Supabase

-- 1. Verificar se os campos já existem
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ramais' 
AND (column_name = 'supervisor' OR column_name = 'coordenador');

-- 2. Adicionar o campo supervisor (se não existir)
ALTER TABLE ramais
ADD COLUMN IF NOT EXISTS supervisor BOOLEAN DEFAULT FALSE;

-- 3. Adicionar o campo coordenador (se não existir)
ALTER TABLE ramais
ADD COLUMN IF NOT EXISTS coordenador BOOLEAN DEFAULT FALSE;

-- 4. Adicionar campos de legenda
ALTER TABLE ramais
ADD COLUMN IF NOT EXISTS legenda_supervisor TEXT;

ALTER TABLE ramais
ADD COLUMN IF NOT EXISTS legenda_coordenador TEXT;

-- 5. Verificar se foram adicionados corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'ramais'
AND (column_name = 'supervisor' OR column_name = 'coordenador');

-- 5. Exemplo: Atualizar ramal para ser supervisor
-- UPDATE ramais
-- SET supervisor = true
-- WHERE nome = 'João Silva';

-- 6. Exemplo: Atualizar ramal para ser coordenador
-- UPDATE ramais
-- SET coordenador = true
-- WHERE nome = 'Maria Santos';

