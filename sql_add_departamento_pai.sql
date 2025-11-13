-- SQL para adicionar campo departamento_pai na tabela departamentos
-- Execute este SQL no Supabase para criar a hierarquia de departamentos

-- 1. Verificar se o campo já existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'departamentos' 
AND column_name = 'departamento_pai';

-- 2. Adicionar o campo departamento_pai (se não existir)
-- O campo será uma foreign key para a própria tabela departamentos
ALTER TABLE departamentos
ADD COLUMN IF NOT EXISTS departamento_pai UUID REFERENCES departamentos(id);

-- 3. Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_departamentos_departamento_pai 
ON departamentos(departamento_pai);

-- 4. Verificar se foi adicionado corretamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'departamentos'
AND column_name = 'departamento_pai';

-- 5. Exemplo: Criar departamento "Supervisores" e departamentos filhos
-- Primeiro, criar o departamento pai "Supervisores"
-- INSERT INTO departamentos (nome, cor, icone, ordem, ativo)
-- VALUES ('Supervisores', '#8b5cf6', '👔', 0, true)
-- RETURNING id;

-- Depois, criar os departamentos filhos (substitua o ID do pai)
-- INSERT INTO departamentos (nome, cor, icone, ordem, ativo, departamento_pai)
-- VALUES 
--   ('Supervisor do Helpdesk', '#8b5cf6', '💻', 1, true, 'ID_DO_SUPERVISORES_AQUI'),
--   ('Supervisor da Cobrança', '#f59e0b', '💰', 2, true, 'ID_DO_SUPERVISORES_AQUI');










