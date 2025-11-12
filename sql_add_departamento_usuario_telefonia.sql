-- SQL para adicionar campo departamento na tabela usuario_telefonia
-- Execute este SQL no Supabase se o campo departamento não existir

-- 1. Verificar se o campo já existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuario_telefonia' 
AND column_name = 'departamento';

-- 2. Adicionar o campo departamento (se não existir)
-- O campo será uma foreign key para a tabela departamentos
ALTER TABLE usuario_telefonia
ADD COLUMN IF NOT EXISTS departamento UUID REFERENCES departamentos(id);

-- 3. Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_usuario_telefonia_departamento 
ON usuario_telefonia(departamento);

-- 4. Verificar se foi adicionado corretamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'usuario_telefonia'
AND column_name = 'departamento';



