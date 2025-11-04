import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Extension, Queue } from '@/lib/types';
import { addExtension, updateExtension } from '@/lib/storage';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const extensionSchema = z.object({
  number: z.string().min(1, 'Número é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  queue_id: z.string().nullable(),
  email: z.string().email('Email inválido').or(z.literal('')),
  department: z.string().nullable(),
  status: z.enum(['active', 'inactive', 'maintenance']),
});

type ExtensionFormData = z.infer<typeof extensionSchema>;

interface ExtensionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extension?: Extension;
  queues: Queue[];
}

export const ExtensionDialog = ({
  open,
  onOpenChange,
  extension,
  queues,
}: ExtensionDialogProps) => {
  const form = useForm<ExtensionFormData>({
    resolver: zodResolver(extensionSchema),
    defaultValues: {
      number: '',
      name: '',
      queue_id: null,
      email: '',
      department: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (extension) {
      form.reset({
        number: extension.number,
        name: extension.name,
        queue_id: extension.queue_id,
        email: extension.email || '',
        department: extension.department || '',
        status: extension.status,
      });
    } else {
      form.reset({
        number: '',
        name: '',
        queue_id: null,
        email: '',
        department: '',
        status: 'active',
      });
    }
  }, [extension, form]);

  const onSubmit = (data: ExtensionFormData) => {
    try {
      if (extension) {
        updateExtension(extension.id, {
          number: data.number,
          name: data.name,
          queue_id: data.queue_id,
          email: data.email || null,
          department: data.department || null,
          status: data.status,
          metadata: extension.metadata,
        });
        toast.success('Ramal atualizado com sucesso!');
      } else {
        addExtension({
          number: data.number,
          name: data.name,
          queue_id: data.queue_id,
          email: data.email || null,
          department: data.department || null,
          status: data.status,
          metadata: {},
        });
        toast.success('Ramal criado com sucesso!');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao salvar ramal');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {extension ? 'Editar Ramal' : 'Novo Ramal'}
          </DialogTitle>
          <DialogDescription>
            {extension
              ? 'Atualize as informações do ramal'
              : 'Preencha os dados do novo ramal'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input placeholder="1001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="queue_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fila</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma fila" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {queues.map((queue) => (
                        <SelectItem key={queue.id} value={queue.id}>
                          {queue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="joao.silva@empresa.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Vendas"
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
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
