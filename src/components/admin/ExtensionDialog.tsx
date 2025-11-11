import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Extension } from '@/lib/types';
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
  department: z.string().min(1, 'Departamento é obrigatório'),
  status: z.enum(['active', 'inactive', 'maintenance']),
});

type ExtensionFormData = z.infer<typeof extensionSchema>;

interface ExtensionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extension?: Extension;
}

export const ExtensionDialog = ({
  open,
  onOpenChange,
  extension,
}: ExtensionDialogProps) => {
  const form = useForm<ExtensionFormData>({
    resolver: zodResolver(extensionSchema),
    defaultValues: {
      number: '',
      name: '',
      department: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (extension) {
      form.reset({
        number: extension.number,
        name: extension.name,
        department: extension.department || '',
        status: extension.status,
      });
    } else {
      form.reset({
        number: '',
        name: '',
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
          department: data.department,
          status: data.status,
          metadata: extension.metadata,
        });
        toast.success('Ramal atualizado com sucesso!');
      } else {
        addExtension({
          number: data.number,
          name: data.name,
          department: data.department,
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
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Administrativo, Ouvidoria, Cobrança, Helpdesk, Upcall"
                      {...field}
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
