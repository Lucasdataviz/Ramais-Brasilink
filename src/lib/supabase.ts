import { createClient } from '@supabase/supabase-js';
import { AdminUser } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zamksbryvuuaxxwszdgc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbWtzYnJ5dnV1YXh4d3N6ZGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTA2NTUsImV4cCI6MjA2MDQ2NjY1NX0.KKcW7dlvWHBwT7dnKmeDNwTIjK2chWkgCMvGYhghOkY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções para usuários admin (usando Supabase Auth)
export const getAdminUsers = async () => {
  // Buscar usuários da tabela admin_users
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
  return data || [];
};

export const createAdminUser = async (user: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('admin_users')
    .insert([user])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateAdminUser = async (id: string, updates: Partial<AdminUser>) => {
  const { data, error } = await supabase
    .from('admin_users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteAdminUser = async (id: string) => {
  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Login usando Supabase Auth
export const loginAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Buscar dados do usuário na tabela admin_users
  if (data.user) {
    const { data: userData, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError) throw userError;
    return userData;
  }
  
  return null;
};

// SQL para criar as tabelas no Supabase:
/*
-- Tabela de usuários admin
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  last_login TIMESTAMP WITH TIME ZONE,
  sip_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ramais
CREATE TABLE extensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de auditoria
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_extensions_department ON extensions(department);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
*/

