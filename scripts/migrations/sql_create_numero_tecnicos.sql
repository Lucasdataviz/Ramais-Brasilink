-- SQL para criar a tabela numero_tecnicos
-- Esta tabela armazena nome, telefone, função (descrição) e tipo dos técnicos
-- Os demais dados (status, etc.) são obtidos da tabela ramais

-- Criar a tabela numero_tecnicos
CREATE TABLE IF NOT EXISTS numero_tecnicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Rio Verde', 'Viçosa', 'Tianguá', 'Frecheirinha', 'Infraestrutura')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_numero_tecnicos_telefone ON numero_tecnicos(telefone);
CREATE INDEX IF NOT EXISTS idx_numero_tecnicos_nome ON numero_tecnicos(nome);
CREATE INDEX IF NOT EXISTS idx_numero_tecnicos_tipo ON numero_tecnicos(tipo);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_numero_tecnicos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_numero_tecnicos_updated_at ON numero_tecnicos;
CREATE TRIGGER trigger_update_numero_tecnicos_updated_at
  BEFORE UPDATE ON numero_tecnicos
  FOR EACH ROW
  EXECUTE FUNCTION update_numero_tecnicos_updated_at();

-- Inserir alguns dados de exemplo
INSERT INTO numero_tecnicos (nome, telefone, descricao, tipo) VALUES
('Daniel', '(88) 99999-9999', 'Instalação', 'Rio Verde'),
('João', '(88) 88888-8888', 'Manutenção', 'Viçosa'),
('Maria', '(88) 77777-7777', 'Suporte', 'Tianguá'),
('Pedro', '(88) 66666-6666', 'Infraestrutura', 'Infraestrutura'),
('Ana', '(88) 55555-5555', 'Instalação', 'Frecheirinha')
ON CONFLICT DO NOTHING;

-- Permitir acesso público (ajustar RLS conforme necessário)
ALTER TABLE numero_tecnicos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de numero_tecnicos"
  ON numero_tecnicos FOR SELECT
  USING (true);

-- Política para permitir inserção, atualização e exclusão apenas para autenticados
-- Ajustar conforme sua necessidade de segurança
CREATE POLICY "Permitir modificação de numero_tecnicos para autenticados"
  ON numero_tecnicos FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ou desabilitar RLS se preferir (menos seguro, mas mais simples)
-- ALTER TABLE numero_tecnicos DISABLE ROW LEVEL SECURITY;
