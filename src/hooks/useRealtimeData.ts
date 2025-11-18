import { useEffect, useState } from 'react';
import { Extension, Queue, AuditLog } from '@/lib/types';
import { getRamais } from '@/lib/supabase';
import {
  getQueues,
  getAuditLogs,
  subscribeToBroadcast,
} from '@/lib/storage';

import { supabase } from '@/lib/supabase';

// Hook CORRIGIDO - agora busca do Supabase com sincronização em tempo real
export const useRealtimeExtensions = () => {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);

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
          metadata: {
            supervisor: ramal.supervisor === true,
            coordenador: ramal.coordenador === true,
            legenda_supervisor: ramal.legenda_supervisor || null,
            legenda_coordenador: ramal.legenda_coordenador || null,
            descricao: ramal.descricao || null, // Descrição opcional
          },
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

  useEffect(() => {
    loadExtensions();

    // Inscrever-se em mudanças na tabela ramais
    const channel = supabase
      .channel('ramais-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ramais',
        },
        () => {
          // Recarregar quando houver mudanças
          loadExtensions();
        }
      )
      .subscribe();

    // Inscrever-se em mudanças na tabela departamentos
    const deptChannel = supabase
      .channel('departamentos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'departamentos',
        },
        () => {
          // Recarregar quando houver mudanças nos departamentos
          loadExtensions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(deptChannel);
    };
  }, []);

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