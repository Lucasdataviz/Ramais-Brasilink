-- SQL para adicionar campos supervisor e coordenador na tabela departamentos
-- Execute este SQL no Supabase

-- 1. Verificar se os campos já existem
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'departamentos' 
AND (column_name = 'supervisor' OR column_name = 'coordenador');

-- 2. Adicionar o campo supervisor (se não existir)
ALTER TABLE departamentos
ADD COLUMN IF NOT EXISTS supervisor TEXT;

-- 3. Adicionar o campo coordenador (se não existir)
ALTER TABLE departamentos
ADD COLUMN IF NOT EXISTS coordenador TEXT;

-- 4. Verificar se foram adicionados corretamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'departamentos'
AND (column_name = 'supervisor' OR column_name = 'coordenador');

-- 5. Exemplo: Atualizar departamento com supervisor e coordenador
-- UPDATE departamentos
-- SET supervisor = 'Maria', coordenador = 'Floriano'
-- WHERE nome = 'SAC';

