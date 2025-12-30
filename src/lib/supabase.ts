import { createClient } from '@supabase/supabase-js';
import { AdminUser, Ramal, Departamento, UsuarioTelefonia, NumeroTecnico, Notificacao, IPPermitido, UserRole } from './types';

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

export const getUsuariosTelefonia = async (): Promise<Partial<UsuarioTelefonia>[]> => {
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
// Função de login usando a tabela usuario_telefonia via RPC seguro
export const loginAdmin = async (email: string, password: string): Promise<AdminUser | null> => {
  try {
    // Chamar função RPC segura no banco de dados
    console.log('Calling login_admin RPC...');
    const { data: result, error } = await supabase.rpc('login_admin', {
      p_email: email,
      p_password: password
    });

    if (error) {
      console.error('RPC Error:', error);
      throw new Error('Erro ao conectar com o servidor');
    }

    // Verificar resposta da função
    if (!result || !result.success) {
      throw new Error(result?.error || 'Email ou senha inválidos');
    }

    const usuario = result.user;
    const now = new Date().toISOString();

    // Converter para AdminUser
    const adminUser: AdminUser = {
      id: usuario.id,
      full_name: usuario.nome || '',
      email: usuario.email,
      role: (usuario.role as UserRole) || 'admin',
      last_login: now,
      sip_config: undefined,
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
  // Use secure RPC for creation to bypass RLS limitations if present
  console.log('Calling create_ramal RPC...');
  const { data, error } = await supabase.rpc('create_ramal', {
    p_ramal: ramal
  });

  if (error) {
    console.error('RPC Error (create_ramal):', error);
    throw error;
  }
  return data;
};

export const updateRamal = async (id: string, updates: Partial<Ramal>) => {
  // Use secure RPC for update to bypass RLS limitations
  console.log('Calling update_ramal RPC...');
  const { data, error } = await supabase.rpc('update_ramal', {
    p_id: id,
    p_updates: updates
  });

  if (error) {
    console.error('RPC Error (update_ramal):', error);
    throw error;
  }
  return data;
};

export const deleteRamal = async (id: string) => {
  // Use secure RPC for deletion
  console.log('Calling delete_ramal RPC...');
  const { error } = await supabase.rpc('delete_ramal', {
    p_id: id
  });

  if (error) {
    console.error('RPC Error (delete_ramal):', error);
    throw error;
  }
};

export const toggleRamalStatus = async (id: string, currentStatus: 'ativo' | 'inativo') => {
  const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
  return updateRamal(id, { status: newStatus });
};

// Atualizar configuração de servidor/domínio para TODOS os ramais
export const updateAllRamaisConfig = async (config: { dominio?: string; servidor_sip?: string }) => {
  // Construir objeto de atualização apenas com campos definidos
  const updates: any = { updated_at: new Date().toISOString() };
  if (config.dominio && config.dominio.trim() !== '') updates.dominio = config.dominio;
  if (config.servidor_sip && config.servidor_sip.trim() !== '') updates.servidor_sip = config.servidor_sip;

  if (Object.keys(updates).length <= 1) return; // Nada para atualizar além do timestamp

  // Atualizar todos os registros da tabela 'ramais'
  // Nota: Sem cláusula .eq(), o Supabase (PostgREST) pode bloquear atualizações em massa por padrão se não tiver header específico
  // Mas vamos tentar. Se falhar, faremos loop no frontend ou usaremos uma prop 'not_null' se existir um campo comum.
  // UPDATE: Supabase client-side update usually requires a WHERE clause for safety.
  // We can use .neq('id', '00000000-0000-0000-0000-000000000000') to match all valid UUIDs.

  // Use secure RPC for bulk update
  console.log('Calling update_all_ramais_config RPC...');
  const { data, error } = await supabase.rpc('update_all_ramais_config', {
    p_updates: config
  });

  if (error) {
    console.error('RPC Error (update_all_ramais_config):', error);
    throw error;
  }
  return data;
};

// ========================================
// FUNÇÕES PARA NÚMEROS DE TÉCNICOS
// ========================================

export const getNumeroTecnicos = async (tipo?: string): Promise<NumeroTecnico[]> => {
  let query = supabase
    .from('numero_tecnicos')
    .select('id, nome, telefone, descricao, tipo, supervisor, coordenador, areas_atuacao, created_at, updated_at');

  if (tipo) {
    query = query.eq('tipo', tipo);
  }

  const { data, error } = await query.order('nome', { ascending: true });

  if (error) {
    console.error('Error fetching numero_tecnicos:', error);
    return [];
  }
  return data || [];
};

export const getNumeroTecnicoById = async (id: string): Promise<NumeroTecnico | null> => {
  const { data, error } = await supabase
    .from('numero_tecnicos')
    .select('id, nome, telefone, descricao, tipo, supervisor, coordenador, areas_atuacao, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching numero_tecnico:', error);
    return null;
  }
  return data;
};

export const createNumeroTecnico = async (tecnico: Omit<NumeroTecnico, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('numero_tecnicos')
    .insert([{
      nome: tecnico.nome,
      telefone: tecnico.telefone,
      descricao: tecnico.descricao,
      tipo: tecnico.tipo,
      supervisor: tecnico.supervisor,
      coordenador: tecnico.coordenador,
      areas_atuacao: tecnico.areas_atuacao,
    }])
    .select('id, nome, telefone, descricao, tipo, supervisor, coordenador, areas_atuacao, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
};

export const updateNumeroTecnico = async (id: string, updates: Partial<NumeroTecnico>) => {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.nome) updateData.nome = updates.nome;
  if (updates.telefone) updateData.telefone = updates.telefone;
  if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
  if (updates.tipo) updateData.tipo = updates.tipo;
  if (updates.supervisor !== undefined) updateData.supervisor = updates.supervisor;
  if (updates.coordenador !== undefined) updateData.coordenador = updates.coordenador;
  if (updates.areas_atuacao !== undefined) updateData.areas_atuacao = updates.areas_atuacao;

  const { data, error } = await supabase
    .from('numero_tecnicos')
    .update(updateData)
    .eq('id', id)
    .select('id, nome, telefone, descricao, tipo, supervisor, coordenador, areas_atuacao, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
};

export const deleteNumeroTecnico = async (id: string) => {
  const { error } = await supabase
    .from('numero_tecnicos')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ========================================
// FUNÇÕES PARA NOTIFICAÇÕES
// ========================================

export const createNotificacao = async (notificacao: Omit<Notificacao, 'id' | 'created_at'>) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // Expira em 1 dia

  const { data, error } = await supabase
    .from('notificacoes')
    .insert([{
      ...notificacao,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getNotificacoesAtivas = async (): Promise<Notificacao[]> => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('ativo', true)
    .gte('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notificacoes:', error);
    return [];
  }
  return data || [];
};

export const getAllNotificacoes = async (limit: number = 100): Promise<Notificacao[]> => {
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching all notificacoes:', error);
    return [];
  }
  return data || [];
};

export const marcarNotificacaoComoInativa = async (id: string) => {
  const { error } = await supabase
    .from('notificacoes')
    .update({ ativo: false })
    .eq('id', id);

  if (error) throw error;
};

// Função auxiliar para obter últimos 4 dígitos do ramal
const getUltimosDigitos = (ramal: string | number) => {
  // Converte para string, remove espaços e caracteres não numéricos, pega últimos 4 dígitos
  const ramalStr = String(ramal || '').trim();
  const ramalLimpo = ramalStr.replace(/\D/g, '');
  if (ramalLimpo.length >= 4) {
    return ramalLimpo.slice(-4);
  }
  return ramalLimpo || '0000';
};

// Função auxiliar para criar notificação de mudança de ramal
export const criarNotificacaoRamalAtualizado = async (ramalAntigo: Ramal, ramalNovo: Ramal) => {
  const mudancas: string[] = [];
  const ramalAntigoShort = getUltimosDigitos(ramalAntigo.ramal);
  const ramalNovoShort = getUltimosDigitos(ramalNovo.ramal);
  const nomeDisplay = ramalNovo.nome || ramalAntigo.nome || 'sem nome';

  // Verificar todas as mudanças
  if (ramalAntigo.ramal !== ramalNovo.ramal) {
    mudancas.push(`número de ${ramalAntigoShort} para ${ramalNovoShort}`);
  }
  if (ramalAntigo.nome !== ramalNovo.nome) {
    mudancas.push(`nome de "${ramalAntigo.nome || 'sem nome'}" para "${ramalNovo.nome || 'sem nome'}"`);
  }
  if (ramalAntigo.departamento !== ramalNovo.departamento) {
    const deptAntigo = ramalAntigo.departamento || 'sem departamento';
    const deptNovo = ramalNovo.departamento || 'sem departamento';
    mudancas.push(`departamento de "${deptAntigo}" para "${deptNovo}"`);
  }

  if (mudancas.length > 0) {
    // Criar mensagem incluindo TODAS as mudanças
    const mensagem = `Foi realizada uma atualização do ramal ${ramalNovoShort} (${nomeDisplay}). ${mudancas.join(', ')}.`;

    await createNotificacao({
      tipo: 'ramal_atualizado',
      titulo: 'Ramal Atualizado',
      mensagem,
      expires_at: '', // Será definido na função
      ativo: true,
    });
  }
};

// Função auxiliar para criar notificação de novo ramal
export const criarNotificacaoRamalCriado = async (ramal: Ramal) => {
  const ramalShort = getUltimosDigitos(ramal.ramal);
  const nomeDisplay = ramal.nome || 'sem nome';
  const deptDisplay = ramal.departamento ? ` no departamento "${ramal.departamento}"` : '';
  const mensagem = `Um novo ramal foi criado com o número ${ramalShort} (${nomeDisplay})${deptDisplay}.`;

  await createNotificacao({
    tipo: 'ramal_criado',
    titulo: 'Novo Ramal Criado',
    mensagem,
    expires_at: '', // Será definido na função
    ativo: true,
  });
};

// Função auxiliar para criar notificação de novo departamento
export const criarNotificacaoDepartamentoCriado = async (departamento: Departamento) => {
  const mensagem = `Um novo departamento foi criado: "${departamento.nome}".`;

  await createNotificacao({
    tipo: 'departamento_criado',
    titulo: 'Novo Departamento Criado',
    mensagem,
    expires_at: '', // Será definido na função
    ativo: true,
  });
};

// Função auxiliar para criar notificação de mudança de técnico
export const criarNotificacaoTecnicoAtualizado = async (tecnicoAntigo: NumeroTecnico, tecnicoNovo: NumeroTecnico) => {
  const mudancas: string[] = [];

  if (tecnicoAntigo.nome !== tecnicoNovo.nome) {
    mudancas.push(`nome de "${tecnicoAntigo.nome || 'sem nome'}" para "${tecnicoNovo.nome || 'sem nome'}"`);
  }
  if (tecnicoAntigo.telefone !== tecnicoNovo.telefone) {
    mudancas.push(`número de telefone de "${tecnicoAntigo.telefone}" para "${tecnicoNovo.telefone}"`);
  }
  if (tecnicoAntigo.tipo !== tecnicoNovo.tipo) {
    mudancas.push(`cidade/tipo de "${tecnicoAntigo.tipo}" para "${tecnicoNovo.tipo}"`);
  }

  if (mudancas.length > 0) {
    const nomeDisplay = tecnicoNovo.nome || tecnicoAntigo.nome || 'sem nome';
    const mensagem = `Foi realizada uma atualização do técnico ${nomeDisplay}. ${mudancas.join(', ')}.`;

    await createNotificacao({
      tipo: 'tecnico_atualizado',
      titulo: 'Técnico Atualizado',
      mensagem,
      expires_at: '', // Será definido na função
      ativo: true,
    });
  }
};

// Função auxiliar para criar notificação de novo técnico
export const criarNotificacaoTecnicoCriado = async (tecnico: NumeroTecnico) => {
  const mensagem = `Um novo técnico foi criado: ${tecnico.nome} (${tecnico.telefone}) - ${tecnico.tipo}.`;

  await createNotificacao({
    tipo: 'tecnico_criado',
    titulo: 'Novo Técnico Criado',
    mensagem,
    expires_at: '', // Será definido na função
    ativo: true,
  });
};

// Função para criar notificação consolidada de múltiplas mudanças
export const criarNotificacaoMudancasMultiplas = async (mudancas: string[]) => {
  if (mudancas.length === 0) return;

  // Se houver apenas uma mudança, usar formato mais simples
  if (mudancas.length === 1) {
    const mensagem = mudancas[0];
    await createNotificacao({
      tipo: 'mudancas_multiplas',
      titulo: 'Atualização',
      mensagem,
      expires_at: '', // Será definido na função
      ativo: true,
    });
    return;
  }

  // Múltiplas mudanças
  const mensagem = `Foram realizadas as seguintes atualizações: ${mudancas.join(', ')}.`;

  await createNotificacao({
    tipo: 'mudancas_multiplas',
    titulo: 'Múltiplas Atualizações',
    mensagem,
    expires_at: '', // Será definido na função
    ativo: true,
  });
};

// Função helper para consolidar múltiplas operações em uma única notificação
// Use esta função quando fizer várias mudanças ao mesmo tempo
export const criarNotificacaoConsolidada = async (operacoes: {
  tipo: 'ramal' | 'tecnico' | 'departamento';
  acao: 'criado' | 'atualizado' | 'deletado';
  detalhes: string;
}[]) => {
  if (operacoes.length === 0) return;

  const mudancas = operacoes.map(op => {
    switch (op.tipo) {
      case 'ramal':
        return op.acao === 'criado'
          ? `novo ramal: ${op.detalhes}`
          : op.acao === 'atualizado'
            ? `ramal atualizado: ${op.detalhes}`
            : `ramal deletado: ${op.detalhes}`;
      case 'tecnico':
        return op.acao === 'criado'
          ? `novo técnico: ${op.detalhes}`
          : op.acao === 'atualizado'
            ? `técnico atualizado: ${op.detalhes}`
            : `técnico deletado: ${op.detalhes}`;
      case 'departamento':
        return op.acao === 'criado'
          ? `novo departamento: ${op.detalhes}`
          : op.acao === 'atualizado'
            ? `departamento atualizado: ${op.detalhes}`
            : `departamento deletado: ${op.detalhes}`;
      default:
        return op.detalhes;
    }
  });

  await criarNotificacaoMudancasMultiplas(mudancas);
};

// ========================================
// FUNÇÕES PARA IPs PERMITIDOS
// ========================================

export const getIPsPermitidos = async (): Promise<IPPermitido[]> => {
  const { data, error } = await supabase
    .from('ips_permitidos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching IPs permitidos:', error);
    return [];
  }
  return data || [];
};

export const createIPPermitido = async (ipData: Omit<IPPermitido, 'id' | 'created_at' | 'updated_at'>): Promise<IPPermitido> => {
  const { data, error } = await supabase
    .from('ips_permitidos')
    .insert({
      ...ipData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateIPPermitido = async (id: string, ipData: Partial<Omit<IPPermitido, 'id' | 'created_at'>>): Promise<IPPermitido> => {
  const { data, error } = await supabase
    .from('ips_permitidos')
    .update({
      ...ipData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteIPPermitido = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ips_permitidos')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Função para chamar API de atualização do nginx (se configurada)
export const updateNginxConfig = async (): Promise<boolean> => {
  const apiUrl = import.meta.env.VITE_NGINX_UPDATE_API_URL;

  if (!apiUrl) {
    console.log('VITE_NGINX_UPDATE_API_URL não configurada. Atualização automática desabilitada.');
    return false;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Adicione autenticação se necessário
      // headers: {
      //   'Content-Type': 'application/json',
      //   'Authorization': `Bearer ${token}`,
      // },
    });

    if (response.ok) {
      return true;
    } else {
      console.error('Erro ao atualizar nginx:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Erro ao chamar API de atualização do nginx:', error);
    return false;
  }
};