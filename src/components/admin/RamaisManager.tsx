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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { Ramal, Departamento } from '@/lib/types';
import { getRamais, deleteRamal, updateRamal, createRamal, getDepartamentos } from '@/lib/supabase';
import { toast } from 'sonner';
import { Phone, Eye, Copy, User, Server, Network, Lock, Edit, Trash2, Settings, Plus } from 'lucide-react';

export const RamaisManager = () => {
  const [ramais, setRamais] = useState<Ramal[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [filteredRamais, setFilteredRamais] = useState<Ramal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRamal, setSelectedRamal] = useState<Ramal | null>(null);
  const [configSheetOpen, setConfigSheetOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editForm, setEditForm] = useState<Ramal | null>(null);
  const [createForm, setCreateForm] = useState({
    nome: '',
    ramal: '',
    departamento: '',
    servidor_sip: '',
    usuario: '',
    dominio: '',
    login: '',
    senha: '',
    status: 'ativo' as 'ativo' | 'inativo',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredRamais(ramais);
    } else {
      const filtered = ramais.filter(
        (ramal) =>
          ramal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ramal.ramal.includes(searchTerm) ||
          ramal.departamento.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRamais(filtered);
    }
  }, [searchTerm, ramais]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ramaisData, deptData] = await Promise.all([
        getRamais(),
        getDepartamentos()
      ]);
      setRamais(ramaisData);
      setFilteredRamais(ramaisData);
      setDepartamentos(deptData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const handleViewConfig = (ramal: Ramal) => {
    setSelectedRamal(ramal);
    setShowPassword(false);
    setConfigSheetOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setCreateForm({
      nome: '',
      ramal: '',
      departamento: departamentos.length > 0 ? departamentos[0].nome : '',
      servidor_sip: '',
      usuario: '',
      dominio: '',
      login: '',
      senha: '',
      status: 'ativo',
    });
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.nome.trim() || !createForm.ramal.trim()) {
      toast.error('Nome e ramal são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      await createRamal(createForm);
      toast.success('Ramal criado com sucesso!');
      setCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating ramal:', error);
      toast.error('Erro ao criar ramal');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ramal: Ramal) => {
    setEditForm({ ...ramal });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      setSaving(true);
      await updateRamal(editForm.id, {
        nome: editForm.nome,
        ramal: editForm.ramal,
        departamento: editForm.departamento,
        servidor_sip: editForm.servidor_sip,
        usuario: editForm.usuario,
        dominio: editForm.dominio,
        login: editForm.login,
        senha: editForm.senha,
        status: editForm.status,
      });
      
      toast.success('Ramal atualizado com sucesso!');
      setEditDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error updating ramal:', error);
      toast.error('Erro ao atualizar ramal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o ramal de ${nome}?`)) {
      return;
    }

    try {
      await deleteRamal(id);
      toast.success('Ramal excluído com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error deleting ramal:', error);
      toast.error('Erro ao excluir ramal');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ativo') {
      return <Badge className="bg-green-500 text-white">Ativo</Badge>;
    }
    return <Badge variant="secondary">Inativo</Badge>;
  };

  const getDepartmentColor = (deptName: string) => {
    const dept = departamentos.find(d => d.nome === deptName);
    return dept?.cor || '#6b7280';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando ramais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Phone className="h-6 w-6" />
            Gerenciar Ramais
          </CardTitle>
          <CardDescription>
            Adicione, edite ou remova ramais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <Input
              placeholder="Buscar ramais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
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
                {filteredRamais.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {searchTerm ? 'Nenhum ramal encontrado' : 'Nenhum ramal cadastrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRamais.map((ramal) => (
                    <TableRow key={ramal.id}>
                      <TableCell className="font-medium">{ramal.ramal}</TableCell>
                      <TableCell>{ramal.nome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getDepartmentColor(ramal.departamento) }}
                          ></div>
                          {ramal.departamento}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ramal.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewConfig(ramal)}
                            title="Ver Configurações SIP"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(ramal)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ramal.id, ramal.nome)}
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

      {/* Dialog para CRIAR ramal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Ramal</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo ramal
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-nome">Nome *</Label>
                <Input
                  id="create-nome"
                  value={createForm.nome}
                  onChange={(e) => setCreateForm({ ...createForm, nome: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-ramal">Ramal *</Label>
                <Input
                  id="create-ramal"
                  value={createForm.ramal}
                  onChange={(e) => setCreateForm({ ...createForm, ramal: e.target.value })}
                  placeholder="Ex: 3281002"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-departamento">Departamento *</Label>
                <Select
                  value={createForm.departamento}
                  onValueChange={(value) => setCreateForm({ ...createForm, departamento: value })}
                >
                  <SelectTrigger id="create-departamento">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((dept) => (
                      <SelectItem key={dept.id} value={dept.nome}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: dept.cor }}
                          ></div>
                          {dept.icone} {dept.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-status">Status</Label>
                <Select
                  value={createForm.status}
                  onValueChange={(value: 'ativo' | 'inativo') => setCreateForm({ ...createForm, status: value })}
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
              <Label htmlFor="create-servidor">Servidor SIP</Label>
              <Input
                id="create-servidor"
                value={createForm.servidor_sip}
                onChange={(e) => setCreateForm({ ...createForm, servidor_sip: e.target.value })}
                placeholder="Ex: sip.exemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-usuario">Usuário</Label>
                <Input
                  id="create-usuario"
                  value={createForm.usuario}
                  onChange={(e) => setCreateForm({ ...createForm, usuario: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-dominio">Domínio</Label>
                <Input
                  id="create-dominio"
                  value={createForm.dominio}
                  onChange={(e) => setCreateForm({ ...createForm, dominio: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-login">Login</Label>
                <Input
                  id="create-login"
                  value={createForm.login}
                  onChange={(e) => setCreateForm({ ...createForm, login: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-senha">Senha</Label>
                <Input
                  id="create-senha"
                  type="password"
                  value={createForm.senha}
                  onChange={(e) => setCreateForm({ ...createForm, senha: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Criando...' : 'Criar Ramal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para EDITAR ramal */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Ramal</DialogTitle>
            <DialogDescription>
              Modifique as informações do ramal abaixo
            </DialogDescription>
          </DialogHeader>
          
          {editForm && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome">Nome</Label>
                  <Input
                    id="edit-nome"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ramal">Ramal</Label>
                  <Input
                    id="edit-ramal"
                    value={editForm.ramal}
                    onChange={(e) => setEditForm({ ...editForm, ramal: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-departamento">Departamento</Label>
                  <Select
                    value={editForm.departamento}
                    onValueChange={(value) => setEditForm({ ...editForm, departamento: value })}
                  >
                    <SelectTrigger id="edit-departamento">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((dept) => (
                        <SelectItem key={dept.id} value={dept.nome}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: dept.cor }}
                            ></div>
                            {dept.icone} {dept.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value: 'ativo' | 'inativo') => 
                      setEditForm({ ...editForm, status: value })
                    }
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
                <Label htmlFor="edit-servidor">Servidor SIP</Label>
                <Input
                  id="edit-servidor"
                  value={editForm.servidor_sip}
                  onChange={(e) => setEditForm({ ...editForm, servidor_sip: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-usuario">Usuário</Label>
                  <Input
                    id="edit-usuario"
                    value={editForm.usuario}
                    onChange={(e) => setEditForm({ ...editForm, usuario: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dominio">Domínio</Label>
                  <Input
                    id="edit-dominio"
                    value={editForm.dominio}
                    onChange={(e) => setEditForm({ ...editForm, dominio: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-login">Login</Label>
                  <Input
                    id="edit-login"
                    value={editForm.login}
                    onChange={(e) => setEditForm({ ...editForm, login: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-senha">Senha</Label>
                  <Input
                    id="edit-senha"
                    type="password"
                    value={editForm.senha}
                    onChange={(e) => setEditForm({ ...editForm, senha: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet para VER CONFIGURAÇÕES */}
      <Sheet open={configSheetOpen} onOpenChange={setConfigSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl flex items-center gap-2">
              <Phone className="h-6 w-6" />
              Configurações do Ramal
            </SheetTitle>
            <SheetDescription>
              Visualize e copie as configurações SIP para configurar o softphone
            </SheetDescription>
          </SheetHeader>

          {selectedRamal && (
            <div className="space-y-6 mt-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Informações do Ramal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-semibold">Ramal:</Label>
                    </div>
                    <span className="font-medium">{selectedRamal.ramal}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-semibold">Nome:</Label>
                    </div>
                    <span className="font-medium">{selectedRamal.nome}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <Label className="font-semibold">Departamento:</Label>
                    <span className="font-medium">{selectedRamal.departamento}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <Label className="font-semibold">Status:</Label>
                    <div>{getStatusBadge(selectedRamal.status)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Configurações SIP</CardTitle>
                  <CardDescription>
                    Clique no ícone de copiar para copiar cada campo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Servidor SIP', value: selectedRamal.servidor_sip, icon: Server },
                    { label: 'Usuário', value: selectedRamal.usuario, icon: User },
                    { label: 'Domínio', value: selectedRamal.dominio, icon: Network },
                    { label: 'Login', value: selectedRamal.login, icon: User },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-bold flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.value, item.label)}
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-base font-mono font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  ))}

                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-bold flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Senha
                      </Label>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedRamal.senha, 'Senha')}
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-base font-mono font-semibold text-foreground">
                      {showPassword ? selectedRamal.senha : '••••••••••'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 bg-blue-50 dark:bg-blue-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Como Configurar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>1. Abra seu softphone (Zoiper, Linphone, etc)</p>
                  <p>2. Clique nos ícones de copiar acima</p>
                  <p>3. Cole os valores nos campos do softphone</p>
                  <p className="mt-3 text-muted-foreground italic">
                    Após configurar, teste fazendo uma ligação.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};