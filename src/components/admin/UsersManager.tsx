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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUser, UserSipConfig, UserRole, Departamento } from '@/lib/types';
import { 
  getUsuariosTelefonia, 
  createUsuarioTelefonia, 
  updateUsuarioTelefonia,
  getAllDepartamentos,
  toggleUsuarioTelefoniaStatus
} from '@/lib/supabase';
import { toast } from 'sonner';
import { Users, Eye, Copy, User as UserIcon, Mail, Server, Network, Lock, Plus, Edit, Building2, Power, PowerOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const UsersManager = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'admin' as UserRole,
    departamento: '',
    ativo: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usuariosTelefonia, departamentosData] = await Promise.all([
        getUsuariosTelefonia(),
        getAllDepartamentos()
      ]);
      
      // Filtrar apenas departamentos ativos
      const departamentosAtivos = departamentosData.filter(d => d.ativo);
      setDepartamentos(departamentosAtivos);
      
      // Converter UsuarioTelefonia para AdminUser
      const adminUsers: AdminUser[] = usuariosTelefonia.map((usuario) => ({
        id: usuario.id,
        full_name: usuario.nome || '',
        email: usuario.email,
        role: (usuario.role as UserRole) || 'admin',
        last_login: usuario.ultimo_login || null,
        sip_config: undefined, // Não existe na tabela
        created_at: usuario.created_at || new Date().toISOString(),
        updated_at: usuario.updated_at || new Date().toISOString(),
        // Adicionar departamento e ativo como metadata temporário
        metadata: { 
          departamento: usuario.departamento || null,
          ativo: usuario.ativo !== false 
        } as any,
      }));
      setUsers(adminUsers);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getDepartamentoNome = (departamentoId: string | undefined) => {
    if (!departamentoId) return 'Sem departamento';
    const dept = departamentos.find(d => d.id === departamentoId);
    return dept?.nome || 'Departamento não encontrado';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      role: 'admin',
      departamento: departamentos.length > 0 ? departamentos[0].nome : 'none',
      ativo: true,
    });
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = async (user: AdminUser) => {
    setSelectedUser(user);
    // Buscar dados completos do usuário
    const usuarios = await getUsuariosTelefonia();
    const usuarioCompleto = usuarios.find(u => u.id === user.id);
    
    // Usar o departamento do usuário ou 'none' se não houver
    const departamentoUsuario = (user.metadata as any)?.departamento || usuarioCompleto?.departamento || null;
    const departamentoValue = departamentoUsuario ? departamentoUsuario : 'none';
    
    setFormData({
      nome: user.full_name,
      email: user.email,
      senha: '',
      role: user.role,
      departamento: departamentoValue,
      ativo: usuarioCompleto?.ativo !== false,
    });
    setEditDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.nome.trim() || !formData.email.trim() || !formData.senha.trim()) {
      toast.error('Nome, email e senha são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      await createUsuarioTelefonia({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        role: formData.role,
        departamento: formData.departamento === 'none' ? null : (formData.departamento || null),
        ativo: formData.ativo,
      });
      toast.success('Usuário criado com sucesso!');
      setCreateDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser || !formData.nome.trim() || !formData.email.trim()) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      const updates: any = {
        nome: formData.nome,
        email: formData.email,
        role: formData.role,
        departamento: formData.departamento === 'none' ? null : (formData.departamento || null),
        ativo: formData.ativo,
      };
      
      if (formData.senha.trim()) {
        updates.senha = formData.senha;
      }
      
      await updateUsuarioTelefonia(selectedUser.id, updates);
      toast.success('Usuário atualizado com sucesso!');
      setEditDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const usuario = await getUsuariosTelefonia();
      const usuarioAtual = usuario.find(u => u.id === user.id);
      if (!usuarioAtual) {
        toast.error('Usuário não encontrado');
        return;
      }
      
      await toggleUsuarioTelefoniaStatus(user.id, usuarioAtual.ativo !== false);
      toast.success(`Usuário ${usuarioAtual.ativo === false ? 'ativado' : 'inativado'} com sucesso!`);
      loadData();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error(error.message || 'Erro ao alterar status do usuário');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-red-500 text-white">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500 text-white">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-green-500 text-white">Moderador</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (loading) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6" />
                Usuários Administrativos
              </CardTitle>
              <CardDescription>
                Visualize e gerencie os usuários do sistema
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {getDepartamentoNome((user.metadata as any)?.departamento)}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.last_login
                          ? new Date(user.last_login).toLocaleString('pt-BR')
                          : 'Nunca'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            title={user.metadata?.ativo === false ? 'Ativar' : 'Inativar'}
                          >
                            {user.metadata?.ativo === false ? (
                              <Power className="h-4 w-4" />
                            ) : (
                              <PowerOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            title="Ver Dados"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(user)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
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

      {/* Dialog para visualizar dados do usuário */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <UserIcon className="h-6 w-6" />
              Dados do Usuário: {selectedUser?.full_name}
            </DialogTitle>
            <DialogDescription>
              Visualize e copie as configurações SIP do usuário
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedUser && (
              <div className="space-y-6">
                {/* Informações do Usuário */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Informações do Usuário</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <Label className="font-semibold">Nome:</Label>
                      </div>
                      <span className="font-medium">{selectedUser.full_name}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Label className="font-semibold">Email:</Label>
                      </div>
                      <span className="font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <Label className="font-semibold">Função:</Label>
                      <div>{getRoleBadge(selectedUser.role)}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <Label className="font-semibold">Departamento:</Label>
                      </div>
                      <span className="font-medium">
                        {getDepartamentoNome((selectedUser.metadata as any)?.departamento)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações SIP */}
                {selectedUser.sip_config ? (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Configurações SIP</CardTitle>
                      <CardDescription>
                        Clique no ícone de copiar para copiar cada campo
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedUser.sip_config.name && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-bold flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              Nome
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedUser.sip_config?.name || '')}
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-base font-mono font-semibold text-foreground">
                            {selectedUser.sip_config.name}
                          </p>
                        </div>
                      )}

                      {selectedUser.sip_config.server && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-bold flex items-center gap-2">
                              <Server className="h-4 w-4" />
                              Servidor SIP
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedUser.sip_config?.server || '')}
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-base font-mono font-semibold text-foreground">
                            {selectedUser.sip_config.server}
                          </p>
                        </div>
                      )}

                      {selectedUser.sip_config.username && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-bold flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              Usuário
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedUser.sip_config?.username || '')}
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-base font-mono font-semibold text-foreground">
                            {selectedUser.sip_config.username}
                          </p>
                        </div>
                      )}

                      {selectedUser.sip_config.domain && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-bold flex items-center gap-2">
                              <Network className="h-4 w-4" />
                              Domínio
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedUser.sip_config?.domain || '')}
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-base font-mono font-semibold text-foreground">
                            {selectedUser.sip_config.domain}
                          </p>
                        </div>
                      )}

                      {selectedUser.sip_config.login && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-bold flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              Login
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedUser.sip_config?.login || '')}
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-base font-mono font-semibold text-foreground">
                            {selectedUser.sip_config.login}
                          </p>
                        </div>
                      )}

                      {selectedUser.sip_config.password && (
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
                                onClick={() => copyToClipboard(selectedUser.sip_config?.password || '')}
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-base font-mono font-semibold text-foreground">
                            {showPassword ? selectedUser.sip_config.password : '••••••••'}
                          </p>
                        </div>
                      )}

                      {selectedUser.sip_config.port && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-bold">Porta</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedUser.sip_config?.port?.toString() || '')}
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-base font-mono font-semibold text-foreground">
                            {selectedUser.sip_config.port}
                          </p>
                        </div>
                      )}

                      {selectedUser.sip_config.protocol && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-bold">Protocolo</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedUser.sip_config?.protocol || '')}
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-base font-mono font-semibold text-foreground">
                            {selectedUser.sip_config.protocol}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2">
                    <CardContent className="p-8 text-center">
                      <UserIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        Este usuário ainda não possui configurações SIP cadastradas
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog para CRIAR usuário */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo usuário
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
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: joao@empresa.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-senha">Senha *</Label>
                <Input
                  id="create-senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role">Função</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="create-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-departamento">Departamento</Label>
              <Select
                value={formData.departamento}
                onValueChange={(value) => setFormData({ ...formData, departamento: value })}
              >
                <SelectTrigger id="create-departamento">
                  <SelectValue placeholder="Selecione um departamento..." />
                </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="none">Sem departamento</SelectItem>
                  {departamentos.filter(d => d.ativo).map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para EDITAR usuário */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Modifique as informações do usuário
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
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-senha">Nova Senha (deixe em branco para não alterar)</Label>
                <Input
                  id="edit-senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Função</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-departamento">Departamento</Label>
              <Select
                value={formData.departamento}
                onValueChange={(value) => setFormData({ ...formData, departamento: value })}
              >
                <SelectTrigger id="edit-departamento">
                  <SelectValue placeholder="Selecione um departamento..." />
                </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="none">Sem departamento</SelectItem>
                  {departamentos.filter(d => d.ativo).map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
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
              <Label htmlFor="edit-ativo">Status</Label>
              <Select
                value={formData.ativo ? 'ativo' : 'inativo'}
                onValueChange={(value) => setFormData({ ...formData, ativo: value === 'ativo' })}
              >
                <SelectTrigger id="edit-ativo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
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

