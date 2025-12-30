-- Adicionar coluna areas_atuacao para permitir que coordenadores/supervisores atuem em múltiplas cidades
ALTER TABLE numero_tecnicos ADD COLUMN IF NOT EXISTS areas_atuacao TEXT[] DEFAULT '{}';

COMMENT ON COLUMN numero_tecnicos.areas_atuacao IS 'Lista de cidades/áreas de atuação do técnico (ex: para coordenadores regionais)';
