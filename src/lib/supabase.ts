import { createClient } from '@supabase/supabase-js';
import { AdminUser, Ramal, Departamento, UsuarioTelefonia } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zamksbryvuuaxxwszdgc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbWtzYnJ5dnV1YXh4d3N6ZGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTA2NTUsImV4cCI6MjA2MDQ2NjY1NX0.KKcW7dlvWHBwT7dnKmeDNwTIjK2chWkgCMvGYhghOkY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========================================
// FUNÇÕES PARA DEPARTAMENTOS
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

// ========================================
// FUNÇÕES PARA USUÁRIOS TELEFONIA
// ========================================

export const getUsuariosTelefonia = async (): Promise<UsuarioTelefonia[]> => {
  const { data, error } = await supabase
    .from('usuario_telefonia')
    .select('id, nome, email, role, departamento, ativo, ultimo_login, created_at, updated_at')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching usuarios telefonia:', error);
    return [];
  }
  return data || [];
};

export const getUsuarioTelefoniaByEmail = async (email: string): Promise<UsuarioTelefonia | null> => {
  const { data, error } = await supabase
    .from('usuario_telefonia')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching usuario telefonia:', error);
    return null;
  }
  return data;
};

export const createUsuarioTelefonia = async (usuario: Omit<UsuarioTelefonia, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('usuario_telefonia')
    .insert([usuario])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUsuarioTelefonia = async (id: string, updates: Partial<UsuarioTelefonia>) => {
  const { data, error } = await supabase
    .from('usuario_telefonia')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteUsuarioTelefonia = async (id: string) => {
  const { error } = await supabase
    .from('usuario_telefonia')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const toggleUsuarioTelefoniaStatus = async (id: string, currentStatus: boolean) => {
  const { data, error } = await supabase
    .from('usuario_telefonia')
    .update({ ativo: !currentStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Função de login usando a tabela usuario_telefonia
export const loginAdmin = async (email: string, password: string): Promise<AdminUser | null> => {
  try {
    // Buscar usuário na tabela usuario_telefonia usando email
    const { data: usuario, error } = await supabase
      .from('usuario_telefonia')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !usuario) {
      throw new Error('Email ou senha inválidos');
    }
    
    // Verificar se o usuário está ativo
    if (usuario.ativo === false) {
      throw new Error('Usuário inativo');
    }
    
    // Comparar senha em texto simples
    if (usuario.senha !== password) {
      throw new Error('Email ou senha inválidos');
    }
    
    // Atualizar ultimo_login
    const now = new Date().toISOString();
    await supabase
      .from('usuario_telefonia')
      .update({ ultimo_login: now, updated_at: now })
      .eq('id', usuario.id);
    
    // Converter UsuarioTelefonia para AdminUser
    const adminUser: AdminUser = {
      id: usuario.id,
      full_name: usuario.nome || '',
      email: usuario.email,
      role: (usuario.role as UserRole) || 'admin',
      last_login: now,
      sip_config: undefined, // Não existe na tabela
      created_at: usuario.created_at || now,
      updated_at: now,
    };
    
    return adminUser;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
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

// Buscar departamentos únicos da tabela ramais
export const getDepartamentosFromRamais = async (): Promise<Departamento[]> => {
  const { data: ramais, error } = await supabase
    .from('ramais')
    .select('departamento, status')
    .order('departamento', { ascending: true });
  
  if (error) {
    console.error('Error fetching departamentos from ramais:', error);
    return [];
  }
  
  // Obter valores únicos de departamento
  const departamentosUnicos = Array.from(new Set(ramais?.map(r => r.departamento).filter(Boolean) || []));
  
  // Criar objetos Departamento a partir dos nomes únicos
  const departamentos: Departamento[] = departamentosUnicos.map((nome, index) => {
    // Verificar se há pelo menos um ramal ativo neste departamento
    const ramaisDoDepartamento = ramais?.filter(r => r.departamento === nome) || [];
    const temRamalAtivo = ramaisDoDepartamento.some(r => r.status === 'ativo');
    
    return {
      id: nome, // Usar nome como ID temporário
      nome: nome,
      cor: '#6b7280', // Cor padrão
      icone: '🏢',
      ordem: index,
      ativo: temRamalAtivo,
      departamento_pai: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
  
  return departamentos;
};

// Criar ramal com novo departamento
export const createRamalWithDepartamento = async (ramalData: Omit<Ramal, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('ramais')
    .insert([ramalData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Atualizar todos os ramais de um departamento
export const updateRamaisByDepartamento = async (oldDepartamento: string, newDepartamento: string) => {
  const { data, error } = await supabase
    .from('ramais')
    .update({ 
      departamento: newDepartamento,
      updated_at: new Date().toISOString()
    })
    .eq('departamento', oldDepartamento)
    .select();
  
  if (error) throw error;
  return data;
};

// Deletar todos os ramais de um departamento
export const deleteRamaisByDepartamento = async (departamento: string) => {
  const { error } = await supabase
    .from('ramais')
    .delete()
    .eq('departamento', departamento);
  
  if (error) throw error;
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