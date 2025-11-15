-- SQL para verificar e corrigir o problema do status sempre desativado
-- Execute este SQL no Supabase

-- 1. Verificar o tipo do campo status na tabela ramais
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'ramais' 
AND column_name = 'status';

-- 2. Se o campo status for boolean, alterá-lo para text
-- ALTER TABLE ramais
-- ALTER COLUMN status TYPE TEXT USING 
--   CASE 
--     WHEN status = true THEN 'ativo'
--     WHEN status = false THEN 'inativo'
--     ELSE 'ativo'
--   END;

-- 3. Se o campo status for text, verificar se há um valor padrão
-- ALTER TABLE ramais
-- ALTER COLUMN status DROP DEFAULT;

-- 4. Definir o valor padrão como 'ativo' (opcional)
-- ALTER TABLE ramais
-- ALTER COLUMN status SET DEFAULT 'ativo';

-- 5. Verificar se há registros com status NULL
SELECT id, nome, ramal, status 
FROM ramais 
WHERE status IS NULL;

-- 6. Atualizar registros com status NULL para 'ativo'
-- UPDATE ramais
-- SET status = 'ativo'
-- WHERE status IS NULL;

-- 7. Verificar se há registros com status diferente de 'ativo' ou 'inativo'
SELECT id, nome, ramal, status 
FROM ramais 
WHERE status NOT IN ('ativo', 'inativo');

-- 8. Atualizar registros com status inválido para 'ativo'
-- UPDATE ramais
-- SET status = 'ativo'
-- WHERE status NOT IN ('ativo', 'inativo');

-- 9. Adicionar constraint para garantir que o status seja apenas 'ativo' ou 'inativo'
-- ALTER TABLE ramais
-- ADD CONSTRAINT check_status 
-- CHECK (status IN ('ativo', 'inativo'));

-- 10. Verificar se a constraint foi adicionada
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'ramais' 
AND constraint_name = 'check_status';

