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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUser, UserSipConfig } from '@/lib/types';
import { getAdminUsers, updateAdminUser } from '@/lib/storage';
import { toast } from 'sonner';
import { Users, Eye, Copy, User as UserIcon, Mail, Server, Network, Lock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const UsersManager = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const allUsers = getAdminUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
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
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6" />
            Usuários Administrativos
          </CardTitle>
          <CardDescription>
            Visualize e gerencie os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.last_login
                          ? new Date(user.last_login).toLocaleString('pt-BR')
                          : 'Nunca'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Dados
                        </Button>
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
    </div>
  );
};

