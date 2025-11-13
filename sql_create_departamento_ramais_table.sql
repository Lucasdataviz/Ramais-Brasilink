-- SQL para criar tabela de relacionamento entre departamentos e ramais
-- Esta tabela permite vincular múltiplos ramais a um departamento
-- Execute este SQL no Supabase

-- 1. Criar tabela de relacionamento departamento_ramais
CREATE TABLE IF NOT EXISTS departamento_ramais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departamento_id UUID REFERENCES departamentos(id) ON DELETE CASCADE,
  ramal_id UUID REFERENCES ramais(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(departamento_id, ramal_id)
);

-- 2. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_departamento_ramais_departamento ON departamento_ramais(departamento_id);
CREATE INDEX IF NOT EXISTS idx_departamento_ramais_ramal ON departamento_ramais(ramal_id);

-- 3. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_departamento_ramais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_departamento_ramais_updated_at ON departamento_ramais;
CREATE TRIGGER trigger_update_departamento_ramais_updated_at
  BEFORE UPDATE ON departamento_ramais
  FOR EACH ROW
  EXECUTE FUNCTION update_departamento_ramais_updated_at();

-- 5. Configurar RLS (Row Level Security)
ALTER TABLE departamento_ramais ENABLE ROW LEVEL SECURITY;

-- 6. Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de departamento_ramais"
  ON departamento_ramais FOR SELECT
  USING (true);

-- 7. Política para permitir modificação (ajustar conforme necessário)
CREATE POLICY "Permitir modificação de departamento_ramais para autenticados"
  ON departamento_ramais FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ou desabilitar RLS se preferir (menos seguro, mas mais simples)
-- ALTER TABLE departamento_ramais DISABLE ROW LEVEL SECURITY;

