// ========================================
// TIPOS DE STATUS E ROLES
// ========================================

export type ExtensionStatus = 'active' | 'inactive' | 'maintenance';
export type UserRole = 'super_admin' | 'admin' | 'moderator';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type RamalStatus = 'ativo' | 'inativo';

// ========================================
// INTERFACES DE FILAS
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

// ========================================
// INTERFACES DE EXTENSÕES
// ========================================

export interface Extension {
  id: string;
  number: string;
  name: string;
  department: string;
  status: ExtensionStatus;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ========================================
// INTERFACES DE CONFIGURAÇÃO SIP
// ========================================

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

// ========================================
// INTERFACES DE RAMAIS
// ========================================

export interface Ramal {
  id: string;
  departamento: string;
  nome: string;
  ramal: string;
  servidor_sip: string;
  usuario: string;
  dominio: string;
  login: string;
  senha: string;
  status: RamalStatus;
  created_at: string;
  updated_at: string;
}

// ========================================
// INTERFACES DE USUÁRIOS ADMIN
// ========================================

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

// ========================================
// INTERFACES DE LOGS DE AUDITORIA
// ========================================

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
// TIPOS AUXILIARES
// ========================================

// Tipo para criar um novo ramal (sem id, created_at, updated_at)
export type CreateRamalInput = Omit<Ramal, 'id' | 'created_at' | 'updated_at'>;

// Tipo para atualizar um ramal (campos opcionais)
export type UpdateRamalInput = Partial<Omit<Ramal, 'id' | 'created_at' | 'updated_at'>>;

// Tipo para criar um novo usuário admin
export type CreateAdminUserInput = Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>;

// Tipo para atualizar um usuário admin
export type UpdateAdminUserInput = Partial<Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>>;

// ========================================
// INTERFACES DE DEPARTAMENTOS
// ========================================

export interface Departamento {
  id: string;
  nome: string;
  descricao?: string;
  total_ramais: number;
}

// ========================================
// INTERFACES DE ESTATÍSTICAS
// ========================================

export interface RamaisStats {
  total: number;
  ativos: number;
  inativos: number;
  por_departamento: {
    departamento: string;
    total: number;
    ativos: number;
  }[];
}