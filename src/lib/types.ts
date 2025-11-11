export type ExtensionStatus = 'active' | 'inactive' | 'maintenance';
export type UserRole = 'super_admin' | 'admin' | 'moderator';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

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
  department: string;
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