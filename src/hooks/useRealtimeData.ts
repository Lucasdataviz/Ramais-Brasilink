import { useEffect, useState } from 'react';
import { Extension, Queue, AuditLog } from '@/lib/types';
import {
  getExtensions,
  getQueues,
  getAuditLogs,
  subscribeToBroadcast,
  initializeSeedData,
} from '@/lib/storage';

export const useRealtimeExtensions = () => {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSeedData();
    setExtensions(getExtensions());
    setLoading(false);

    const unsubscribe = subscribeToBroadcast((event) => {
      if (event.type === 'extensions') {
        setExtensions(getExtensions());
      }
    });

    return unsubscribe;
  }, []);

  return { extensions, loading };
};

export const useRealtimeQueues = () => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSeedData();
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
