-- Script para adicionar campo descricao na tabela ramais
-- Execute este SQL no Supabase

-- 1. Verificar se o campo já existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ramais' 
AND column_name = 'descricao';

-- 2. Adicionar o campo descricao (se não existir)
ALTER TABLE ramais
ADD COLUMN IF NOT EXISTS descricao TEXT;

-- 3. Verificar se foi adicionado corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'ramais'
AND column_name = 'descricao';

