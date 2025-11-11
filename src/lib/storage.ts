import { Extension, Queue, AdminUser, AuditLog, AuditAction, ExtensionStatus } from './types';

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

// Admin Users - Update function
export const updateAdminUser = (id: string, updates: Partial<AdminUser>): AdminUser | null => {
  const users = getAdminUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return null;
  
  const oldUser = users[index];
  const updatedUser = {
    ...oldUser,
    ...updates,
    id: oldUser.id,
    created_at: oldUser.created_at,
    updated_at: now(),
  };
  
  users[index] = updatedUser;
  setAdminUsers(users);
  
  logAudit('UPDATE', 'admin_users', id, oldUser, updatedUser);
  
  return updatedUser;
};

// Initialize with seed data
export const initializeSeedData = (): void => {
  if (getExtensions().length === 0) {
    const extensionsData = [
      { department: 'Administrativo', name: 'Nailly', number: '3283000' },
      { department: 'Administrativo', name: 'Claudia', number: '3283001' },
      { department: 'Administrativo', name: 'Marcileia', number: '3283002' },
      { department: 'Administrativo', name: 'Sup Maria', number: '3284002' },
      { department: 'Administrativo', name: 'Sup Josevanio', number: '3285000' },
      { department: 'Administrativo', name: 'Lucas Silva', number: '3285001' },
      { department: 'Administrativo', name: 'Pedro Vitor', number: '3285002' },
      { department: 'Administrativo', name: 'Ednalda', number: '3285003' },
      { department: 'Administrativo', name: 'Izabella', number: '3285004' },
      { department: 'Administrativo', name: 'Thiago', number: '3285006' },
      { department: 'Administrativo', name: 'Patrícia Miranda', number: '3285007' },
      { department: 'Administrativo', name: 'Rhanya', number: '3285008' },
      { department: 'Administrativo', name: 'Bruno', number: '3285009' },
      { department: 'Administrativo', name: 'Sup Daiane', number: '3285010' },
      { department: 'Administrativo', name: 'Sup Jardel', number: '3285011' },
      { department: 'Administrativo', name: 'Sup Roney Fernando', number: '3285012' },
      { department: 'Administrativo', name: 'Anna Julia', number: '3285013' },
      { department: 'Administrativo', name: 'Geirla', number: '3285014' },
      { department: 'Administrativo', name: 'Faturamento', number: '3285015' },
      { department: 'Administrativo', name: 'Geniffer', number: '3285018' },
      { department: 'Administrativo', name: 'Camilla', number: '3285020' },
      { department: 'Administrativo', name: 'Manuel Silva', number: '3285021' },
      { department: 'Administrativo', name: 'Gabriel', number: '3285022' },
      { department: 'Administrativo', name: 'Floriano', number: '3285023' },
      { department: 'Administrativo', name: 'LAIANE', number: '3285024' },
      { department: 'Administrativo', name: 'William', number: '3285025' },
      { department: 'Administrativo', name: 'Sup Jarquiel', number: '3285026' },
      { department: 'Administrativo', name: 'Rodolfo', number: '3285027' },
      { department: 'Administrativo', name: 'Dani', number: '3286000' },
      { department: 'Administrativo', name: 'Caixa Viçosa', number: '3286001' },
      { department: 'Ouvidoria', name: 'Glauciane', number: '3284000' },
      { department: 'Ouvidoria', name: 'Byanca', number: '3284001' },
      { department: 'Ouvidoria', name: 'Lady Daiane', number: '3284003' },
      { department: 'Cobrança', name: 'Lucielia', number: '3282000' },
      { department: 'Cobrança', name: 'Paloma', number: '3282001' },
      { department: 'Cobrança', name: 'Jessya', number: '3282002' },
      { department: 'Cobrança', name: 'Laynara', number: '3282003' },
      { department: 'Helpdesk', name: 'Lya Castro', number: '3281002' },
      { department: 'Helpdesk', name: 'Josue', number: '3281005' },
      { department: 'Helpdesk', name: 'Victor Hugo', number: '3281008' },
      { department: 'Helpdesk', name: 'TASSYANE', number: '3281009' },
      { department: 'Helpdesk', name: 'Elane', number: '3281011' },
      { department: 'Helpdesk', name: 'Hidaiara', number: '3281012' },
      { department: 'Helpdesk', name: 'Patrício Gabriel', number: '3281013' },
      { department: 'Upcall', name: 'UPKLL', number: '3281006' },
      { department: 'Upcall', name: 'upcall 2', number: '3281007' },
    ];
    
    const extensions: Extension[] = extensionsData.map((ext) => ({
      id: generateId(),
      number: ext.number,
      name: ext.name,
      department: ext.department,
      status: 'active' as ExtensionStatus,
      metadata: {},
      created_at: now(),
      updated_at: now(),
    }));
    
    setExtensions(extensions);
    
    const adminUser: AdminUser = {
      id: generateId(),
      full_name: 'Administrador',
      email: 'admin@empresa.com',
      role: 'super_admin',
      last_login: null,
      sip_config: {
        name: 'Jardel',
        server: 'tip6.npxtech.com.br',
        username: '3283000',
        domain: 'tip6.npxtech.com.br',
        login: '3283000',
        password: 'GRRLxzTbd0',
      },
      created_at: now(),
      updated_at: now(),
    };
    setAdminUsers([adminUser]);
  }
};
