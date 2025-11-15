-- SQL para criar a tabela notificacoes
-- Esta tabela armazena as notificações de mudanças no sistema
-- Execute este SQL no Supabase

CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('ramal_atualizado', 'ramal_criado', 'ramal_deletado', 'departamento_criado', 'departamento_atualizado')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ativo BOOLEAN DEFAULT true
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_ativo ON notificacoes(ativo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_expires_at ON notificacoes(expires_at);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at DESC);

-- Configurar RLS (Row Level Security)
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de notificacoes"
  ON notificacoes FOR SELECT
  USING (true);

-- Política para permitir inserção (ajustar conforme necessário)
CREATE POLICY "Permitir inserção de notificacoes para autenticados"
  ON notificacoes FOR INSERT
  WITH CHECK (true);

-- Política para permitir atualização (ajustar conforme necessário)
CREATE POLICY "Permitir atualização de notificacoes para autenticados"
  ON notificacoes FOR UPDATE
  USING (true);

