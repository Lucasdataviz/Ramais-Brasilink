import { useState } from 'react';
import { useRealtimeExtensions } from '@/hooks/useRealtimeData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { ExtensionDialog } from './ExtensionDialog';
import { Extension } from '@/lib/types';
import { deleteExtension } from '@/lib/storage';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

export const ExtensionsManager = () => {
  const { extensions, loading } = useRealtimeExtensions();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExtension, setEditingExtension] = useState<Extension | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredExtensions = extensions.filter((ext) => {
    const searchLower = search.toLowerCase();
    return (
      ext.name.toLowerCase().includes(searchLower) ||
      ext.number.includes(searchLower) ||
      ext.department?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (extension: Extension) => {
    setEditingExtension(extension);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (deleteExtension(id)) {
      toast.success('Ramal excluído com sucesso!');
      setDeleteId(null);
    } else {
      toast.error('Erro ao excluir ramal');
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'maintenance':
        return <Badge className="bg-warning text-warning-foreground">Manutenção</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ramais..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            setEditingExtension(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Ramal
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExtensions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum ramal encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredExtensions.map((extension) => (
                <TableRow key={extension.id}>
                  <TableCell className="font-mono font-semibold">
                    {extension.number}
                  </TableCell>
                  <TableCell>{extension.name}</TableCell>
                  <TableCell>{extension.department || '-'}</TableCell>
                  <TableCell>{getStatusBadge(extension.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(extension)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(extension.id)}
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

      <ExtensionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        extension={editingExtension}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este ramal? Esta ação não pode ser desfeita.
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
