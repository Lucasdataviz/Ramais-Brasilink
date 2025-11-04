import { Extension, Queue, AdminUser, AuditLog, AuditAction } from './types';

const STORAGE_KEYS = {
  EXTENSIONS: 'extensions',
  QUEUES: 'queues',
  ADMIN_USERS: 'admin_users',
  AUDIT_LOGS: 'audit_logs',
  CURRENT_USER: 'current_user',
} as const;

// BroadcastChannel for cross-tab synchronization
const channel = typeof window !== 'undefined' ? new BroadcastChannel('extensions_sync') : null;

type StorageChangeEvent = {
  type: 'extensions' | 'queues' | 'admin_users' | 'audit_logs';
  action: 'update';
};

export const broadcastChange = (event: StorageChangeEvent) => {
  channel?.postMessage(event);
};

export const subscribeToBroadcast = (callback: (event: StorageChangeEvent) => void) => {
  if (!channel) return () => {};
  
  const handler = (event: MessageEvent<StorageChangeEvent>) => {
    callback(event.data);
  };
  
  channel.addEventListener('message', handler);
  return () => channel.removeEventListener('message', handler);
};

// Helper to generate UUID
const generateId = () => crypto.randomUUID();

// Helper to get current timestamp
const now = () => new Date().toISOString();

// Generic storage operations
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

// Extensions
export const getExtensions = (): Extension[] => {
  return getFromStorage(STORAGE_KEYS.EXTENSIONS, []);
};

export const setExtensions = (extensions: Extension[]): void => {
  setToStorage(STORAGE_KEYS.EXTENSIONS, extensions);
  broadcastChange({ type: 'extensions', action: 'update' });
};

export const addExtension = (extension: Omit<Extension, 'id' | 'created_at' | 'updated_at'>): Extension => {
  const newExtension: Extension = {
    ...extension,
    id: generateId(),
    created_at: now(),
    updated_at: now(),
  };
  
  const extensions = getExtensions();
  extensions.push(newExtension);
  setExtensions(extensions);
  
  logAudit('CREATE', 'extensions', newExtension.id, null, newExtension);
  
  return newExtension;
};

export const updateExtension = (id: string, updates: Partial<Extension>): Extension | null => {
  const extensions = getExtensions();
  const index = extensions.findIndex(e => e.id === id);
  
  if (index === -1) return null;
  
  const oldExtension = extensions[index];
  const updatedExtension = {
    ...oldExtension,
    ...updates,
    id: oldExtension.id,
    created_at: oldExtension.created_at,
    updated_at: now(),
  };
  
  extensions[index] = updatedExtension;
  setExtensions(extensions);
  
  logAudit('UPDATE', 'extensions', id, oldExtension, updatedExtension);
  
  return updatedExtension;
};

export const deleteExtension = (id: string): boolean => {
  const extensions = getExtensions();
  const extension = extensions.find(e => e.id === id);
  
  if (!extension) return false;
  
  const filtered = extensions.filter(e => e.id !== id);
  setExtensions(filtered);
  
  logAudit('DELETE', 'extensions', id, extension, null);
  
  return true;
};

// Queues
export const getQueues = (): Queue[] => {
  return getFromStorage(STORAGE_KEYS.QUEUES, []);
};

export const setQueues = (queues: Queue[]): void => {
  setToStorage(STORAGE_KEYS.QUEUES, queues);
  broadcastChange({ type: 'queues', action: 'update' });
};

export const addQueue = (queue: Omit<Queue, 'id' | 'created_at' | 'updated_at'>): Queue => {
  const newQueue: Queue = {
    ...queue,
    id: generateId(),
    created_at: now(),
    updated_at: now(),
  };
  
  const queues = getQueues();
  queues.push(newQueue);
  setQueues(queues);
  
  logAudit('CREATE', 'queues', newQueue.id, null, newQueue);
  
  return newQueue;
};

export const updateQueue = (id: string, updates: Partial<Queue>): Queue | null => {
  const queues = getQueues();
  const index = queues.findIndex(q => q.id === id);
  
  if (index === -1) return null;
  
  const oldQueue = queues[index];
  const updatedQueue = {
    ...oldQueue,
    ...updates,
    id: oldQueue.id,
    created_at: oldQueue.created_at,
    updated_at: now(),
  };
  
  queues[index] = updatedQueue;
  setQueues(queues);
  
  logAudit('UPDATE', 'queues', id, oldQueue, updatedQueue);
  
  return updatedQueue;
};

export const deleteQueue = (id: string): boolean => {
  const queues = getQueues();
  const queue = queues.find(q => q.id === id);
  
  if (!queue) return false;
  
  const filtered = queues.filter(q => q.id !== id);
  setQueues(filtered);
  
  logAudit('DELETE', 'queues', id, queue, null);
  
  return true;
};

// Admin Users
export const getAdminUsers = (): AdminUser[] => {
  return getFromStorage(STORAGE_KEYS.ADMIN_USERS, []);
};

export const setAdminUsers = (users: AdminUser[]): void => {
  setToStorage(STORAGE_KEYS.ADMIN_USERS, users);
  broadcastChange({ type: 'admin_users', action: 'update' });
};

export const getCurrentUser = (): AdminUser | null => {
  return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user: AdminUser | null): void => {
  setToStorage(STORAGE_KEYS.CURRENT_USER, user);
};

export const login = (email: string, password: string): AdminUser | null => {
  const users = getAdminUsers();
  const user = users.find(u => u.email === email);
  
  if (!user || password !== 'admin123') return null;
  
  const updatedUser = { ...user, last_login: now() };
  const index = users.findIndex(u => u.id === user.id);
  users[index] = updatedUser;
  setAdminUsers(users);
  
  setCurrentUser(updatedUser);
  return updatedUser;
};

export const logout = (): void => {
  setCurrentUser(null);
};

// Audit Logs
export const getAuditLogs = (): AuditLog[] => {
  return getFromStorage(STORAGE_KEYS.AUDIT_LOGS, []);
};

export const setAuditLogs = (logs: AuditLog[]): void => {
  setToStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
  broadcastChange({ type: 'audit_logs', action: 'update' });
};

export const logAudit = (
  action: AuditAction,
  entity_type: string,
  entity_id: string,
  old_data: any,
  new_data: any
): void => {
  const currentUser = getCurrentUser();
  
  const log: AuditLog = {
    id: generateId(),
    user_id: currentUser?.id || null,
    user_email: currentUser?.email || null,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    ip_address: null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    created_at: now(),
  };
  
  const logs = getAuditLogs();
  logs.unshift(log);
  setAuditLogs(logs.slice(0, 1000)); // Keep last 1000 logs
};

// Initialize with seed data
export const initializeSeedData = (): void => {
  if (getQueues().length === 0) {
    const queues: Queue[] = [
      {
        id: generateId(),
        name: 'Vendas',
        description: 'Equipe comercial',
        color: '#3b82f6',
        icon: 'phone',
        order_index: 0,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: 'Suporte',
        description: 'Atendimento ao cliente',
        color: '#10b981',
        icon: 'headphones',
        order_index: 1,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: 'Financeiro',
        description: 'Departamento financeiro',
        color: '#f59e0b',
        icon: 'dollar-sign',
        order_index: 2,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: 'TI',
        description: 'Tecnologia da informação',
        color: '#8b5cf6',
        icon: 'laptop',
        order_index: 3,
        created_at: now(),
        updated_at: now(),
      },
    ];
    setQueues(queues);
    
    const extensions: Extension[] = [
      {
        id: generateId(),
        number: '1001',
        name: 'João Silva',
        queue_id: queues[0].id,
        department: 'Vendas',
        status: 'active',
        metadata: {},
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        number: '1002',
        name: 'Maria Santos',
        queue_id: queues[0].id,
        department: 'Vendas',
        status: 'active',
        metadata: {},
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        number: '2001',
        name: 'Pedro Oliveira',
        queue_id: queues[1].id,
        department: 'Suporte',
        status: 'active',
        metadata: {},
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        number: '3001',
        name: 'Ana Costa',
        queue_id: queues[2].id,
        department: 'Financeiro',
        status: 'active',
        metadata: {},
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        number: '4001',
        name: 'Carlos Lima',
        queue_id: queues[3].id,
        department: 'TI',
        status: 'active',
        metadata: {},
        created_at: now(),
        updated_at: now(),
      },
    ];
    setExtensions(extensions);
    
    const adminUser: AdminUser = {
      id: generateId(),
      full_name: 'Administrador',
      email: 'admin@empresa.com',
      role: 'super_admin',
      last_login: null,
      created_at: now(),
      updated_at: now(),
    };
    setAdminUsers([adminUser]);
  }
};
