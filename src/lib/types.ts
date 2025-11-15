export type ExtensionStatus = 'active' | 'inactive' | 'maintenance';
export type UserRole = 'super_admin' | 'admin' | 'moderator';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

// ========================================
// Interface para Departamentos
// ========================================
export interface Departamento {
  id: string;
  nome: string;
  cor: string;
  icone?: string;
  ordem: number;
  ativo: boolean;
  departamento_pai?: string | null; // ID do departamento pai (para hierarquia)
  supervisor?: string | null; // Nome do supervisor (ex: Maria)
  coordenador?: string | null; // Nome do coordenador (ex: Floriano)
  created_at: string;
  updated_at: string;
}

// ========================================
// Interface para Ramais
// ========================================
export interface Ramal {
  id: string;
  nome: string;
  ramal: string;
  departamento: string;
  servidor_sip: string;
  usuario: string;
  dominio: string;
  login: string;
  senha: string;
  status: 'ativo' | 'inativo';
  created_at?: string;
  updated_at?: string;
}

// ========================================
// Interfaces Existentes
// ========================================
export interface Queue {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Extension {
  id: string;
  number: string;
  name: string;
  queue_id: string | null;
  department: string | null;
  status: ExtensionStatus;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserSipConfig {
  name?: string;
  server?: string;
  username?: string;
  domain?: string;
  login?: string;
  password?: string;
  port?: number;
  protocol?: string;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  last_login: string | null;
  sip_config?: UserSipConfig;
  created_at: string;
  updated_at: string;
}

// Interface para a tabela usuario_telefonia
export interface UsuarioTelefonia {
  id: string;
  nome: string;
  email: string;
  senha: string; // Hash bcrypt
  role?: UserRole;
  departamento?: string; // ID do departamento
  ativo?: boolean;
  ultimo_login?: string | null; // Campo real na tabela
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Para campos adicionais que possam existir
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ========================================
// Interface para Número de Técnicos
// ========================================
export type TipoTecnico = 'Rio Verde' | 'Viçosa' | 'Tianguá' | 'Frecheirinha' | 'Infraestrutura' | 'Araquém' | 'Tecno' | string; // Permite cidade customizada

export interface NumeroTecnico {
  id: string;
  nome: string;
  telefone: string; // Número de telefone do técnico
  descricao: string; // Função do técnico (ex: Instalação, Manutenção)
  tipo: TipoTecnico; // Cidade: Rio Verde, Viçosa, Tianguá, Frecheirinha, Infraestrutura, Araquém ou cidade customizada
  created_at: string;
  updated_at: string;
}

// ========================================
// Interface para Notificações
// ========================================
export interface Notificacao {
  id: string;
  tipo: 'ramal_atualizado' | 'ramal_criado' | 'ramal_deletado' | 'departamento_criado' | 'departamento_atualizado' | 'tecnico_atualizado' | 'tecnico_criado' | 'mudancas_multiplas';
  titulo: string;
  mensagem: string;
  created_at: string;
  expires_at: string; // Data de expiração (1 dia após criação)
  ativo: boolean;
}

// ========================================
// Interface para IPs Permitidos
// ========================================
export interface IPPermitido {
  id: string;
  ip: string;
  descricao?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}