-- SQL para verificar a estrutura da tabela ramais
-- Execute este SQL para ver como está o campo departamento

-- 1. Ver estrutura da tabela ramais
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'ramais'
ORDER BY ordinal_position;

-- 2. Ver alguns dados de exemplo
SELECT id, nome, ramal, departamento, status 
FROM ramais 
LIMIT 5;

-- 3. Verificar se departamento é UUID ou VARCHAR
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'ramais' 
AND column_name = 'departamento';

-- 4. Se o campo departamento for VARCHAR (nome), precisamos alterar para UUID
-- ALTER TABLE ramais
-- ALTER COLUMN departamento TYPE UUID USING departamento::uuid;

-- 5. Ou se for UUID mas está armazenando nomes, precisamos atualizar
-- Primeiro, ver os departamentos existentes
SELECT id, nome FROM departamentos;

-- Depois, atualizar os ramais para usar o ID do departamento
-- UPDATE ramais r
-- SET departamento = d.id
-- FROM departamentos d
-- WHERE r.departamento = d.nome;



