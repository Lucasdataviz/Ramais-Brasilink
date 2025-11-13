import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { NumeroTecnico, TipoTecnico } from '@/lib/types';
import {
  getNumeroTecnicos,
  createNumeroTecnico,
  updateNumeroTecnico,
  deleteNumeroTecnico,
} from '@/lib/supabase';
import { toast } from 'sonner';
import { Wrench, Plus, Edit, Trash2, Phone } from 'lucide-react';

const TIPOS_TECNICO: TipoTecnico[] = ['Rio Verde', 'Viçosa', 'Tianguá', 'Frecheirinha', 'Infraestrutura','Araquem'];

export const TecnicosManager = () => {
  const [tecnicos, setTecnicos] = useState<NumeroTecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTecnico, setSelectedTecnico] = useState<NumeroTecnico | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    descricao: '',
    tipo: 'Rio Verde' as TipoTecnico,
  });

  useEffect(() => {
    loadTecnicos();
  }, []);

  const loadTecnicos = async () => {
    try {
      setLoading(true);
      const data = await getNumeroTecnicos();
      setTecnicos(data);
    } catch (error) {
      console.error('Error loading tecnicos:', error);
      toast.error('Erro ao carregar técnicos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      nome: '',
      telefone: '',
      descricao: '',
      tipo: 'Rio Verde',
    });
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (tecnico: NumeroTecnico) => {
    setSelectedTecnico(tecnico);
    setFormData({
      nome: tecnico.nome,
      telefone: tecnico.telefone,
      descricao: tecnico.descricao,
      tipo: tecnico.tipo,
    });
    setEditDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.nome.trim() || !formData.telefone.trim() || !formData.descricao.trim()) {
      toast.error('Nome, telefone e função são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      await createNumeroTecnico({
        nome: formData.nome,
        telefone: formData.telefone,
        descricao: formData.descricao,
        tipo: formData.tipo,
      });
      toast.success('Técnico criado com sucesso!');
      setCreateDialogOpen(false);
      loadTecnicos();
    } catch (error: any) {
      console.error('Error creating tecnico:', error);
      toast.error(error.message || 'Erro ao criar técnico');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTecnico || !formData.nome.trim() || !formData.telefone.trim() || !formData.descricao.trim()) {
      toast.error('Nome, telefone e função são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      await updateNumeroTecnico(selectedTecnico.id, {
        nome: formData.nome,
        telefone: formData.telefone,
        descricao: formData.descricao,
        tipo: formData.tipo,
      });
      toast.success('Técnico atualizado com sucesso!');
      setEditDialogOpen(false);
      loadTecnicos();
    } catch (error: any) {
      console.error('Error updating tecnico:', error);
      toast.error(error.message || 'Erro ao atualizar técnico');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o técnico "${nome}"?`)) {
      return;
    }

    try {
      await deleteNumeroTecnico(id);
      toast.success('Técnico excluído com sucesso!');
      loadTecnicos();
    } catch (error: any) {
      console.error('Error deleting tecnico:', error);
      toast.error(error.message || 'Erro ao excluir técnico');
    }
  };

  const getTipoBadgeColor = (tipo: TipoTecnico) => {
    const colors: Record<TipoTecnico, string> = {
      'Rio Verde': 'bg-green-500',
      'Viçosa': 'bg-blue-500',
      'Tianguá': 'bg-purple-500',
      'Frecheirinha': 'bg-orange-500',
      'Infraestrutura': 'bg-red-500',
      'Araquem': 'bg-red-500',
    };
    return colors[tipo] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando técnicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Wrench className="h-6 w-6" />
                Gerenciar Técnicos
              </CardTitle>
              <CardDescription>
                Adicione, edite ou remova técnicos do sistema. Os dados de status são obtidos da tabela ramais.
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Técnico
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tecnicos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum técnico cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  tecnicos.map((tecnico) => (
                    <TableRow key={tecnico.id}>
                      <TableCell className="font-medium">{tecnico.nome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{tecnico.telefone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{tecnico.descricao}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getTipoBadgeColor(tecnico.tipo)} text-white`}>
                          {tecnico.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(tecnico)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tecnico.id, tecnico.nome)}
                            title="Excluir"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para CRIAR técnico */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Técnico</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo técnico
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-nome">Nome *</Label>
                <Input
                  id="create-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Daniel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-telefone">Telefone *</Label>
                <Input
                  id="create-telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="Ex: (88) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: TipoTecnico) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger id="create-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_TECNICO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-descricao">Função *</Label>
              <Textarea
                id="create-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Instalação"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Criando...' : 'Criar Técnico'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para EDITAR técnico */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Técnico</DialogTitle>
            <DialogDescription>
              Modifique as informações do técnico
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome *</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telefone">Telefone *</Label>
                <Input
                  id="edit-telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: TipoTecnico) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger id="edit-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_TECNICO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Função *</Label>
              <Textarea
                id="edit-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
