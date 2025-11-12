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
import { Departamento } from '@/lib/types';
import {
  getAllDepartamentos,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
  toggleDepartamentoStatus,
} from '@/lib/supabase';
import { toast } from 'sonner';
import { Building2, Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react';

export const DepartamentosManager = () => {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cor: '#6b7280',
    icone: '🏢',
    ordem: 0,
    ativo: true,
    departamento_pai: '',
  });

  useEffect(() => {
    loadDepartamentos();
  }, []);

  const loadDepartamentos = async () => {
    try {
      setLoading(true);
      const data = await getAllDepartamentos();
      setDepartamentos(data);
    } catch (error) {
      console.error('Error loading departamentos:', error);
      toast.error('Erro ao carregar departamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      nome: '',
      cor: '#6b7280',
      icone: '🏢',
      ordem: departamentos.length,
      ativo: true,
      departamento_pai: '',
    });
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (departamento: Departamento) => {
    setSelectedDepartamento(departamento);
    setFormData({
      nome: departamento.nome,
      cor: departamento.cor,
      icone: departamento.icone || '🏢',
      ordem: departamento.ordem,
      ativo: departamento.ativo,
      departamento_pai: departamento.departamento_pai || '',
    });
    setEditDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome do departamento é obrigatório');
      return;
    }

    try {
      setSaving(true);
      await createDepartamento({
        nome: formData.nome,
        cor: formData.cor,
        icone: formData.icone,
        ordem: formData.ordem,
        ativo: formData.ativo,
        departamento_pai: formData.departamento_pai === 'none' ? null : (formData.departamento_pai || null),
      });
      toast.success('Departamento criado com sucesso!');
      setCreateDialogOpen(false);
      loadDepartamentos();
    } catch (error: any) {
      console.error('Error creating departamento:', error);
      toast.error(error.message || 'Erro ao criar departamento');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDepartamento || !formData.nome.trim()) {
      toast.error('Nome do departamento é obrigatório');
      return;
    }

    try {
      setSaving(true);
      await updateDepartamento(selectedDepartamento.id, {
        nome: formData.nome,
        cor: formData.cor,
        icone: formData.icone,
        ordem: formData.ordem,
        ativo: formData.ativo,
        departamento_pai: formData.departamento_pai === 'none' ? null : (formData.departamento_pai || null),
      });
      toast.success('Departamento atualizado com sucesso!');
      setEditDialogOpen(false);
      loadDepartamentos();
    } catch (error: any) {
      console.error('Error updating departamento:', error);
      toast.error(error.message || 'Erro ao atualizar departamento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o departamento "${nome}"?`)) {
      return;
    }

    try {
      await deleteDepartamento(id);
      toast.success('Departamento excluído com sucesso!');
      loadDepartamentos();
    } catch (error: any) {
      console.error('Error deleting departamento:', error);
      toast.error(error.message || 'Erro ao excluir departamento');
    }
  };

  const handleToggleStatus = async (departamento: Departamento) => {
    try {
      await toggleDepartamentoStatus(departamento.id, departamento.ativo);
      toast.success(`Departamento ${departamento.ativo ? 'desativado' : 'ativado'} com sucesso!`);
      loadDepartamentos();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error('Erro ao alterar status do departamento');
    }
  };

  const iconesPredefinidos = [
    { nome: 'Edifício', valor: '🏢' },
    { nome: 'Telefone', valor: '📞' },
    { nome: 'Suporte', valor: '💼' },
    { nome: 'Vendas', valor: '💰' },
    { nome: 'TI', valor: '💻' },
    { nome: 'Recursos Humanos', valor: '👥' },
    { nome: 'Marketing', valor: '📢' },
    { nome: 'Financeiro', valor: '💵' },
    { nome: 'Atendimento', valor: '🎧' },
    { nome: 'Produção', valor: '🏭' },
    { nome: 'Logística', valor: '🚚' },
    { nome: 'Segurança', valor: '🔒' },
    { nome: 'Qualidade', valor: '⭐' },
    { nome: 'Pesquisa', valor: '🔬' },
    { nome: 'Jurídico', valor: '⚖️' },
  ];

  const coresPredefinidas = [
    { nome: 'Cinza', valor: '#6b7280' },
    { nome: 'Azul', valor: '#3b82f6' },
    { nome: 'Verde', valor: '#10b981' },
    { nome: 'Amarelo', valor: '#f59e0b' },
    { nome: 'Vermelho', valor: '#ef4444' },
    { nome: 'Roxo', valor: '#8b5cf6' },
    { nome: 'Rosa', valor: '#ec4899' },
    { nome: 'Laranja', valor: '#f97316' },
    { nome: 'Ciano', valor: '#06b6d4' },
    { nome: 'Verde Limão', valor: '#84cc16' },
    { nome: 'Azul Marinho', valor: '#1e40af' },
    { nome: 'Vermelho Escuro', valor: '#dc2626' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando departamentos...</p>
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
                <Building2 className="h-6 w-6" />
                Gerenciar Departamentos
              </CardTitle>
              <CardDescription>
                Adicione, edite ou remova departamentos do sistema
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Departamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ícone</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum departamento cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  departamentos.map((departamento) => (
                    <TableRow key={departamento.id}>
                      <TableCell className="font-medium">{departamento.nome}</TableCell>
                      <TableCell>
                        <span className="text-2xl">{departamento.icone || '🏢'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: departamento.cor }}
                          ></div>
                          <span className="text-sm text-muted-foreground">{departamento.cor}</span>
                        </div>
                      </TableCell>
                      <TableCell>{departamento.ordem}</TableCell>
                      <TableCell>
                        {departamento.ativo ? (
                          <Badge className="bg-green-500 text-white">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(departamento)}
                            title={departamento.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {departamento.ativo ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(departamento)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(departamento.id, departamento.nome)}
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

      {/* Dialog para CRIAR departamento */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Departamento</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo departamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-nome">Nome *</Label>
              <Input
                id="create-nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Administrativo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-icone">Ícone</Label>
                <Select
                  value={formData.icone}
                  onValueChange={(value) => setFormData({ ...formData, icone: value })}
                >
                  <SelectTrigger id="create-icone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconesPredefinidos.map((icone) => (
                      <SelectItem key={icone.valor} value={icone.valor}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{icone.valor}</span>
                          <span>{icone.nome}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-cor">Cor</Label>
                <Select
                  value={formData.cor}
                  onValueChange={(value) => setFormData({ ...formData, cor: value })}
                >
                  <SelectTrigger id="create-cor">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coresPredefinidas.map((cor) => (
                      <SelectItem key={cor.valor} value={cor.valor}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: cor.valor }}
                          ></div>
                          {cor.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-ordem">Ordem</Label>
                <Input
                  id="create-ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-status">Status</Label>
                <Select
                  value={formData.ativo ? 'ativo' : 'inativo'}
                  onValueChange={(value) => setFormData({ ...formData, ativo: value === 'ativo' })}
                >
                  <SelectTrigger id="create-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-departamento-pai">Departamento Pai (opcional)</Label>
              <Select
                value={formData.departamento_pai}
                onValueChange={(value) => setFormData({ ...formData, departamento_pai: value })}
              >
                <SelectTrigger id="create-departamento-pai">
                  <SelectValue placeholder="Nenhum (departamento principal)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (departamento principal)</SelectItem>
                  {departamentos.filter(d => !d.departamento_pai).map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.icone} {dept.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Criando...' : 'Criar Departamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para EDITAR departamento */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Departamento</DialogTitle>
            <DialogDescription>
              Modifique as informações do departamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome *</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-icone">Ícone</Label>
                <Select
                  value={formData.icone}
                  onValueChange={(value) => setFormData({ ...formData, icone: value })}
                >
                  <SelectTrigger id="edit-icone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconesPredefinidos.map((icone) => (
                      <SelectItem key={icone.valor} value={icone.valor}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{icone.valor}</span>
                          <span>{icone.nome}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cor">Cor</Label>
                <Select
                  value={formData.cor}
                  onValueChange={(value) => setFormData({ ...formData, cor: value })}
                >
                  <SelectTrigger id="edit-cor">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coresPredefinidas.map((cor) => (
                      <SelectItem key={cor.valor} value={cor.valor}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: cor.valor }}
                          ></div>
                          {cor.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ordem">Ordem</Label>
                <Input
                  id="edit-ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.ativo ? 'ativo' : 'inativo'}
                  onValueChange={(value) => setFormData({ ...formData, ativo: value === 'ativo' })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-departamento-pai">Departamento Pai (opcional)</Label>
              <Select
                value={formData.departamento_pai}
                onValueChange={(value) => setFormData({ ...formData, departamento_pai: value })}
              >
                <SelectTrigger id="edit-departamento-pai">
                  <SelectValue placeholder="Nenhum (departamento principal)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (departamento principal)</SelectItem>
                  {departamentos.filter(d => !d.departamento_pai && d.id !== selectedDepartamento?.id).map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.icone} {dept.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
