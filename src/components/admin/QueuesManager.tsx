import { useState } from 'react';
import { useRealtimeQueues } from '@/hooks/useRealtimeData';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { QueueDialog } from './QueueDialog';
import { Queue } from '@/lib/types';
import { deleteQueue } from '@/lib/storage';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const QueuesManager = () => {
  const { queues, loading } = useRealtimeQueues();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (queue: Queue) => {
    setEditingQueue(queue);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (deleteQueue(id)) {
      toast.success('Fila excluída com sucesso!');
      setDeleteId(null);
    } else {
      toast.error('Erro ao excluir fila');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestão de Filas</h2>
        <Button
          onClick={() => {
            setEditingQueue(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Fila
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Ícone</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhuma fila cadastrada
                </TableCell>
              </TableRow>
            ) : (
              queues.map((queue) => (
                <TableRow key={queue.id}>
                  <TableCell className="font-semibold">{queue.name}</TableCell>
                  <TableCell>{queue.description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: queue.color }}
                      />
                      <span className="text-sm font-mono">{queue.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>{queue.icon}</TableCell>
                  <TableCell>{queue.order_index}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(queue)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(queue.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <QueueDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        queue={editingQueue}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta fila? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
