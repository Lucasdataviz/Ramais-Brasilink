import { Queue, AuditLog, AuditAction } from './types';

const STORAGE_KEYS = {
  QUEUES: 'queues',
  AUDIT_LOGS: 'audit_logs',
} as const;

// BroadcastChannel for cross-tab synchronization
const channel = typeof window !== 'undefined' ? new BroadcastChannel('extensions_sync') : null;

type StorageChangeEvent = {
  type: 'queues' | 'audit_logs';
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
  const currentUserRaw = typeof window !== 'undefined' ? localStorage.getItem('current_user') : null;
  const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

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
  // Seed queues if empty
  if (getQueues().length === 0) {
    const defaultQueues: Queue[] = [
      {
        id: generateId(),
        name: '7001 — Comercial',
        description: 'Fila Comercial',
        color: '#3b82f6',
        icon: 'phone',
        order_index: 1,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: '7002 — Ouvidoria',
        description: 'Fila Ouvidoria',
        color: '#10b981',
        icon: 'phone',
        order_index: 2,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: '7003 — SAC',
        description: 'Fila SAC',
        color: '#f59e0b',
        icon: 'phone',
        order_index: 3,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: '7004 — Corporativo',
        description: 'Fila Corporativo',
        color: '#f1364f',
        icon: 'phone',
        order_index: 4,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: '7005 — Cobrança',
        description: 'Fila Cobrança',
        color: '#6366f1',
        icon: 'phone',
        order_index: 5,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: '7006 — Oculta Técnicos',
        description: 'Fila Oculta Técnicos',
        color: '#6b7280',
        icon: 'phone',
        order_index: 6,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: '9999 — Upcall',
        description: 'Fila Upcall',
        color: '#ec4899',
        icon: 'phone',
        order_index: 7,
        created_at: now(),
        updated_at: now(),
      },
    ];
    setQueues(defaultQueues);
  }
};
