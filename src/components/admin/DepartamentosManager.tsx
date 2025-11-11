import { createClient } from '@supabase/supabase-js';
import { AdminUser, Ramal, Departamento } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zamksbryvuuaxxwszdgc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbWtzYnJ5dnV1YXh4d3N6ZGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTA2NTUsImV4cCI6MjA2MDQ2NjY1NX0.KKcW7dlvWHBwT7dnKmeDNwTIjK2chWkgCMvGYhghOkY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========================================
// FUNÇÕES PARA DEPARTAMENTOS (NOVO!)
// ========================================

export const getDepartamentos = async (): Promise<Departamento[]> => {
  const { data, error } = await supabase
    .from('departamentos')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true });
  
  if (error) {
    console.error('Error fetching departamentos:', error);
    return [];
  }
  return data || [];
};

export const getAllDepartamentos = async (): Promise<Departamento[]> => {
  const { data, error } = await supabase
    .from('departamentos')
    .select('*')
    .order('ordem', { ascending: true });
  
  if (error) {
    console.error('Error fetching all departamentos:', error);
    return [];
  }
  return data || [];
};

export const getDepartamentoById = async (id: string): Promise<Departamento | null> => {
  const { data, error } = await supabase
    .from('departamentos')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching departamento:', error);
    return null;
  }
  return data;
};

export const createDepartamento = async (departamento: Omit<Departamento, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('departamentos')
    .insert([departamento])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateDepartamento = async (id: string, updates: Partial<Departamento>) => {
  const { data, error } = await supabase
    .from('departamentos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteDepartamento = async (id: string) => {
  // Verificar se existem ramais nesse departamento
  const { data: ramais } = await supabase
    .from('ramais')
    .select('id')
    .eq('departamento', id);
  
  if (ramais && ramais.length > 0) {
    throw new Error('Não é possível deletar um departamento que possui ramais associados');
  }
  
  const { error } = await supabase
    .from('departamentos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const toggleDepartamentoStatus = async (id: string, currentStatus: boolean) => {
  return updateDepartamento(id, { ativo: !currentStatus });
};

// ========================================
// FUNÇÕES PARA USUÁRIOS ADMIN
// ========================================

export const getAdminUsers = async (): Promise<AdminUser[]> => {
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

export const loginAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
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

// ========================================
// FUNÇÕES PARA RAMAIS
// ========================================

export const getRamais = async (): Promise<Ramal[]> => {
  const { data, error } = await supabase
    .from('ramais')
    .select('*')
    .order('ramal', { ascending: true });
  
  if (error) {
    console.error('Error fetching ramais:', error);
    return [];
  }
  return data || [];
};

export const getRamalByNumber = async (ramal: string): Promise<Ramal | null> => {
  const { data, error } = await supabase
    .from('ramais')
    .select('*')
    .eq('ramal', ramal)
    .single();
  
  if (error) {
    console.error('Error fetching ramal:', error);
    return null;
  }
  return data;
};

export const getRamalsByDepartamento = async (departamento: string): Promise<Ramal[]> => {
  const { data, error } = await supabase
    .from('ramais')
    .select('*')
    .eq('departamento', departamento)
    .order('ramal', { ascending: true });
  
  if (error) {
    console.error('Error fetching ramais by department:', error);
    return [];
  }
  return data || [];
};

export const createRamal = async (ramal: Omit<Ramal, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('ramais')
    .insert([ramal])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateRamal = async (id: string, updates: Partial<Ramal>) => {
  const { data, error } = await supabase
    .from('ramais')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteRamal = async (id: string) => {
  const { error } = await supabase
    .from('ramais')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const toggleRamalStatus = async (id: string, currentStatus: 'ativo' | 'inativo') => {
  const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
  return updateRamal(id, { status: newStatus });
};