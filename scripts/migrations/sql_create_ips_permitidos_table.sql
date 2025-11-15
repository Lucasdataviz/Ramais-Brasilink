-- Criar tabela para armazenar IPs permitidos
CREATE TABLE IF NOT EXISTS ips_permitidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip VARCHAR(45) NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por IP
CREATE INDEX IF NOT EXISTS idx_ips_permitidos_ip ON ips_permitidos(ip);
CREATE INDEX IF NOT EXISTS idx_ips_permitidos_ativo ON ips_permitidos(ativo);

-- Inserir IPs iniciais do nginx.conf
INSERT INTO ips_permitidos (ip, descricao, ativo) VALUES
  ('168.228.178.187', 'IP Lucas', true),
  ('168.228.176.19', 'IP Centro ADM', true)
ON CONFLICT (ip) DO NOTHING;

-- Comentário na tabela
COMMENT ON TABLE ips_permitidos IS 'Tabela para armazenar IPs permitidos para acessar o sistema';
COMMENT ON COLUMN ips_permitidos.ip IS 'Endereço IP (IPv4 ou IPv6)';
COMMENT ON COLUMN ips_permitidos.descricao IS 'Descrição opcional do IP (ex: IP Lucas, IP Centro ADM)';
COMMENT ON COLUMN ips_permitidos.ativo IS 'Se o IP está ativo ou não';

