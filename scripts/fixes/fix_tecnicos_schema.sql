-- Script consolidado para corrigir a tabela numero_tecnicos
-- Execute este script no Query Editor do Supabase para garantir que todas as colunas existem

-- 1. Adicionar colunas supervisor e coordenador se não existirem
ALTER TABLE numero_tecnicos ADD COLUMN IF NOT EXISTS supervisor BOOLEAN DEFAULT FALSE;
ALTER TABLE numero_tecnicos ADD COLUMN IF NOT EXISTS coordenador BOOLEAN DEFAULT FALSE;

-- 2. Adicionar coluna areas_atuacao se não existir
ALTER TABLE numero_tecnicos ADD COLUMN IF NOT EXISTS areas_atuacao TEXT[] DEFAULT '{}';

-- 3. Adicionar comentários para documentação
COMMENT ON COLUMN numero_tecnicos.supervisor IS 'Indica se o técnico é um supervisor regional';
COMMENT ON COLUMN numero_tecnicos.coordenador IS 'Indica se o técnico é um coordenador regional';
COMMENT ON COLUMN numero_tecnicos.areas_atuacao IS 'Lista de cidades/áreas de atuação do técnico (ex: para coordenadores regionais)';

-- 4. Garantir que as permissões estão corretas (opcional, mas recomendado)
grant select, insert, update, delete on table numero_tecnicos to anon, authenticated, service_role;
