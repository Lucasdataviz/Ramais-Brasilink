import { useState } from 'react';
import { useRealtimeQueues } from '@/hooks/useRealtimeData';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Layers, Phone, PhoneCall, PhoneForwarded, Info } from 'lucide-react';
import { getIconComponent } from '@/lib/icons';
import { toast } from 'sonner';

export const QueuesCard = () => {
  const { queues, loading } = useRealtimeQueues();
  const [expanded, setExpanded] = useState(true);

  if (loading) {
    return (
      <div className="mb-8 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (queues.length === 0) return null;

  // Função auxiliar para extrair o número da fila
  const getQueueNumber = (name: string, description: string | null): string => {
    const matchName = name.match(/\d+/);
    if (matchName) return matchName[0];
    const matchDesc = description?.match(/\d+/);
    if (matchDesc) return matchDesc[0];
    return '';
  };

  // Função auxiliar para limpar o nome da fila e não exibir o número duplicado
  const getCleanName = (name: string): string => {
    return name.replace(/^\d+\s*(—|-)\s*/, '').trim();
  };

  const handleCall = (e: React.MouseEvent, number: string) => {
    e.stopPropagation();
    if (!number) {
      toast.error('Número da fila não encontrado');
      return;
    }
    try {
      const sipUrl = `sip:${number}`;
      const link = document.createElement('a');
      link.href = sipUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Iniciando ligação para a fila ${number}...`);
    } catch {
      toast.error('Erro ao iniciar ligação.');
    }
  };

  const handleTransfer = (e: React.MouseEvent, number: string) => {
    e.stopPropagation();
    if (!number) {
      toast.error('Número da fila não encontrado');
      return;
    }
    try {
      // Discar *2 + número da fila no microsip para transferir
      const sipUrl = `sip:*2${number}`;
      const link = document.createElement('a');
      link.href = sipUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Transferindo ligação para a fila ${number} (*2${number})...`);
    } catch {
      toast.error('Erro ao iniciar transferência.');
    }
  };

  return (
    <div className="mb-8">
      <Card
        className="border border-gray-200/50 dark:border-gray-800/50 shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 border border-red-200/30 dark:border-red-800/30">
                <Layers className="h-5 w-5 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Filas de Atendimento
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {queues.length} {queues.length === 1 ? 'fila cadastrada' : 'filas cadastradas'} • Clique para gerenciar transferências
                </p>
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardContent>
      </Card>

      {expanded && (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-300 space-y-4">
          {/* Alerta explicativo */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-normal">
              <span className="font-semibold">📞 Como transferir uma ligação ativa:</span> Clique no botão <strong>"Transferir"</strong> ao lado da fila desejada para enviar o comando de blind transfer (<code className="bg-blue-500/15 px-1 py-0.5 rounded font-mono font-bold">*2 + número</code>) para o seu softphone (ex: MicroSIP).
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {queues.map((queue) => {
              const queueNumber = getQueueNumber(queue.name, queue.description);
              const cleanName = getCleanName(queue.name);
              const IconComponent = getIconComponent(queue.icon) || Phone;

              return (
                <Card
                  key={queue.id}
                  className="p-4 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-md flex flex-col justify-between"
                  style={{ borderTop: `4px solid ${queue.color || '#6b7280'}` }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="p-1.5 rounded-lg text-white"
                        style={{ backgroundColor: queue.color }}
                      >
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {queueNumber}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-foreground mb-1 truncate" title={cleanName}>
                      {cleanName}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mb-4" title={queue.description || ''}>
                      {queue.description || '-'}
                    </p>
                  </div>

                  <div className="flex gap-2 border-t border-gray-100 dark:border-gray-800 pt-3 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleCall(e, queueNumber)}
                      className="flex-1 text-xs h-8 px-2 border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1"
                      title={`Ligar para fila ${queueNumber}`}
                    >
                      <PhoneCall className="h-3 w-3" />
                      Ligar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleTransfer(e, queueNumber)}
                      className="flex-1 text-xs h-8 px-2 border-blue-500/20 hover:border-blue-500 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-1"
                      title={`Transferir para fila (*2${queueNumber})`}
                    >
                      <PhoneForwarded className="h-3 w-3" />
                      Transf.
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
