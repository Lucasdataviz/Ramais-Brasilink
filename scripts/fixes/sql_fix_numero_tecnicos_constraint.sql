-- Script para atualizar o constraint check da tabela numero_tecnicos
-- Adiciona 'Araquém' e 'Tecno' às opções permitidas

-- Primeiro, remover o constraint antigo
ALTER TABLE numero_tecnicos 
DROP CONSTRAINT IF EXISTS numero_tecnicos_tipo_check;

-- Criar novo constraint com todas as cidades permitidas
ALTER TABLE numero_tecnicos 
ADD CONSTRAINT numero_tecnicos_tipo_check 
CHECK (tipo IN ('Rio Verde', 'Viçosa', 'Tianguá', 'Frecheirinha', 'Infraestrutura', 'Araquém', 'Tecno'));

-- Verificar se o constraint foi aplicado corretamente
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'numero_tecnicos'::regclass
AND conname = 'numero_tecnicos_tipo_check';
