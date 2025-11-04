import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Queue } from '@/lib/types';
import { addQueue, updateQueue } from '@/lib/storage';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const queueSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  order_index: z.number().min(0),
});

type QueueFormData = z.infer<typeof queueSchema>;

interface QueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queue?: Queue;
}

export const QueueDialog = ({ open, onOpenChange, queue }: QueueDialogProps) => {
  const form = useForm<QueueFormData>({
    resolver: zodResolver(queueSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3b82f6',
      icon: 'phone',
      order_index: 0,
    },
  });

  useEffect(() => {
    if (queue) {
      form.reset({
        name: queue.name,
        description: queue.description || '',
        color: queue.color,
        icon: queue.icon,
        order_index: queue.order_index,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: 'phone',
        order_index: 0,
      });
    }
  }, [queue, form]);

  const onSubmit = (data: QueueFormData) => {
    try {
      if (queue) {
        updateQueue(queue.id, {
          name: data.name,
          description: data.description || null,
          color: data.color,
          icon: data.icon,
          order_index: data.order_index,
        });
        toast.success('Fila atualizada com sucesso!');
      } else {
        addQueue({
          name: data.name,
          description: data.description || null,
          color: data.color,
          icon: data.icon,
          order_index: data.order_index,
        });
        toast.success('Fila criada com sucesso!');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao salvar fila');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{queue ? 'Editar Fila' : 'Nova Fila'}</DialogTitle>
          <DialogDescription>
            {queue
              ? 'Atualize as informações da fila'
              : 'Preencha os dados da nova fila'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Vendas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Equipe comercial"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" {...field} className="w-20 h-10" />
                      <Input {...field} placeholder="#3b82f6" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone (Lucide)</FormLabel>
                  <FormControl>
                    <Input placeholder="phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order_index"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
