import { useState, useEffect } from 'react';
import { useRealtimeAuditLogs } from '@/hooks/useRealtimeData';
import { getAllNotificacoes } from '@/lib/supabase';
import { Notificacao } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type LogEntry = {
  id: string;
  type: 'log' | 'notification';
  date: string;
  user?: string;
  action: string;
  entity: string;
  message?: string;
  entityId?: string;
};

export const AuditLogsViewer = () => {
  const { logs, loading: logsLoading } = useRealtimeAuditLogs();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'logs' | 'notifications'>('all');

  useEffect(() => {
    loadNotificacoes();
  }, []);

  const loadNotificacoes = async () => {
    try {
      setLoadingNotificacoes(true);
      const data = await getAllNotificacoes(100);
      setNotificacoes(data);
    } catch (error) {
      console.error('Error loading notificacoes:', error);
    } finally {
      setLoadingNotificacoes(false);
    }
  };

  // Converter logs para formato unificado
  const logEntries: LogEntry[] = logs.map((log) => ({
    id: log.id,
    type: 'log' as const,
    date: log.created_at,
    user: log.user_email || 'Sistema',
    action: log.action,
    entity: log.entity_type,
    entityId: log.entity_id || undefined,
  }));

  // Converter notificações para formato unificado
  const notificationEntries: LogEntry[] = notificacoes.map((notif) => {
    let action = 'Notificação';
    if (notif.tipo.includes('criado')) action = 'Criar';
    else if (notif.tipo.includes('atualizado')) action = 'Editar';
    else if (notif.tipo.includes('deletado')) action = 'Excluir';

    let entity = 'Sistema';
    if (notif.tipo.includes('ramal')) entity = 'Ramal';
    else if (notif.tipo.includes('departamento')) entity = 'Departamento';
    else if (notif.tipo.includes('tecnico')) entity = 'Técnico';

    return {
      id: notif.id,
      type: 'notification' as const,
      date: notif.created_at,
      action,
      entity,
      message: notif.mensagem,
    };
  });

  // Combinar e ordenar por data
  const allEntries: LogEntry[] = [...logEntries, ...notificationEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filtrar entradas
  const filteredEntries = allEntries.filter((entry) => {
    if (activeTab === 'logs' && entry.type !== 'log') return false;
    if (activeTab === 'notifications' && entry.type !== 'notification') return false;

    const searchLower = search.toLowerCase();
    return (
      entry.user?.toLowerCase().includes(searchLower) ||
      entry.entity.toLowerCase().includes(searchLower) ||
      entry.action.toLowerCase().includes(searchLower) ||
      entry.message?.toLowerCase().includes(searchLower)
    );
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
      case 'Criar':
        return <Badge className="bg-green-500 text-white">Criar</Badge>;
      case 'UPDATE':
      case 'Editar':
        return <Badge className="bg-blue-500 text-white">Editar</Badge>;
      case 'DELETE':
      case 'Excluir':
        return <Badge variant="destructive">Excluir</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const loading = logsLoading || loadingNotificacoes;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Logs e Notificações</h2>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar logs e notificações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'logs' | 'notifications')}>
        <TabsList>
          <TabsTrigger value="all">Todos ({allEntries.length})</TabsTrigger>
          <TabsTrigger value="logs">Logs ({logEntries.length})</TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações ({notificationEntries.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={`${entry.type}-${entry.id}`}>
                    <TableCell>
                      {entry.type === 'notification' ? (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Bell className="h-3 w-3" />
                          Notificação
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Log</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(entry.date), 'dd/MM/yyyy HH:mm:ss', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.user || 'Sistema'}
                    </TableCell>
                    <TableCell>{getActionBadge(entry.action)}</TableCell>
                    <TableCell className="font-medium">{entry.entity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                      {entry.message || entry.entityId?.slice(0, 8) || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
