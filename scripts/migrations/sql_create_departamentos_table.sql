-- SQL para criar a tabela departamentos se não existir
-- Esta tabela armazena os departamentos independentemente dos ramais
-- Execute este SQL no Supabase

-- 1. Criar tabela departamentos se não existir
CREATE TABLE IF NOT EXISTS departamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  cor TEXT DEFAULT '#6b7280',
  icone TEXT DEFAULT '🏢',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  departamento_pai UUID REFERENCES departamentos(id) ON DELETE SET NULL,
  supervisor TEXT,
  coordenador TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_departamentos_nome ON departamentos(nome);
CREATE INDEX IF NOT EXISTS idx_departamentos_ativo ON departamentos(ativo);
CREATE INDEX IF NOT EXISTS idx_departamentos_departamento_pai ON departamentos(departamento_pai);
CREATE INDEX IF NOT EXISTS idx_departamentos_ordem ON departamentos(ordem);

-- 3. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_departamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_departamentos_updated_at ON departamentos;
CREATE TRIGGER trigger_update_departamentos_updated_at
  BEFORE UPDATE ON departamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_departamentos_updated_at();

-- 5. Configurar RLS (Row Level Security)
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;

-- 6. Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de departamentos"
  ON departamentos FOR SELECT
  USING (true);

-- 7. Política para permitir modificação (ajustar conforme necessário)
CREATE POLICY "Permitir modificação de departamentos para autenticados"
  ON departamentos FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ou desabilitar RLS se preferir (menos seguro, mas mais simples)
-- ALTER TABLE departamentos DISABLE ROW LEVEL SECURITY;

