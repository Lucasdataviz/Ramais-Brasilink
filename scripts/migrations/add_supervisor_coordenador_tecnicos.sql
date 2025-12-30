-- Adicionar colunas supervisor e coordenador à tabela numero_tecnicos
ALTER TABLE numero_tecnicos ADD COLUMN IF NOT EXISTS supervisor BOOLEAN DEFAULT FALSE;
ALTER TABLE numero_tecnicos ADD COLUMN IF NOT EXISTS coordenador BOOLEAN DEFAULT FALSE;

-- Comentários para documentação (opcional)
COMMENT ON COLUMN numero_tecnicos.supervisor IS 'Indica se o técnico é um supervisor regional';
COMMENT ON COLUMN numero_tecnicos.coordenador IS 'Indica se o técnico é um coordenador regional';
