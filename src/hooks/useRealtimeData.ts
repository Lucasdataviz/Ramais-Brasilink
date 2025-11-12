import { useEffect, useState } from 'react';
import { Extension, Queue, AuditLog } from '@/lib/types';
import { getRamais } from '@/lib/supabase';
import {
  getQueues,
  getAuditLogs,
  subscribeToBroadcast,
} from '@/lib/storage';

// Hook CORRIGIDO - agora busca do Supabase
export const useRealtimeExtensions = () => {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExtensions();
  }, []);

  const loadExtensions = async () => {
    try {
      setLoading(true);
      const ramais = await getRamais();
      
      // Converter formato Ramal para Extension (apenas ativos)
      const extensionsData: Extension[] = ramais
        .filter(ramal => ramal.status === 'ativo')
        .map((ramal) => ({
          id: ramal.id,
          name: ramal.nome,
          number: ramal.ramal,
          department: ramal.departamento,
          status: 'active' as const,
          queue_id: null,
          metadata: {},
          created_at: ramal.created_at || new Date().toISOString(),
          updated_at: ramal.updated_at || new Date().toISOString(),
        }));
      
      setExtensions(extensionsData);
    } catch (error) {
      console.error('Error loading extensions:', error);
    } finally {
      setLoading(false);
    }
  };

  return { extensions, loading };
};

export const useRealtimeQueues = () => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQueues(getQueues());
    setLoading(false);

    const unsubscribe = subscribeToBroadcast((event) => {
      if (event.type === 'queues') {
        setQueues(getQueues());
      }
    });

    return unsubscribe;
  }, []);

  return { queues, loading };
};

export const useRealtimeAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLogs(getAuditLogs());
    setLoading(false);

    const unsubscribe = subscribeToBroadcast((event) => {
      if (event.type === 'audit_logs') {
        setLogs(getAuditLogs());
      }
    });

    return unsubscribe;
  }, []);

  return { logs, loading };
};