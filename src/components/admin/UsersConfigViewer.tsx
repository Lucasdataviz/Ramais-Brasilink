import { useState } from 'react';
import { getAdminUsers } from '@/lib/storage';
import { AdminUser } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Eye, EyeOff, User, Server, Network, Lock, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

export const UsersConfigViewer = () => {
  const [users, setUsers] = useState<AdminUser[]>(getAdminUsers());
  const [search, setSearch] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const togglePassword = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const filteredUsers = users.filter(user => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.sip_config?.name?.toLowerCase().includes(searchLower) ||
      user.sip_config?.username?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-xl">Configurações SIP dos Usuários</CardTitle>
          <CardDescription>
            Visualize e copie as configurações SIP de cada usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredUsers.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {user.full_name}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {user.sip_config ? (
                      <>
                        {user.sip_config.name && (
                          <div className="p-3 rounded border bg-muted/50">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs font-semibold">Nome</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(user.sip_config?.name || '')}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm font-mono">{user.sip_config.name}</p>
                          </div>
                        )}

                        {user.sip_config.server && (
                          <div className="p-3 rounded border bg-muted/50">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs font-semibold flex items-center gap-1">
                                <Server className="h-3 w-3" />
                                Servidor SIP
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(user.sip_config?.server || '')}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm font-mono">{user.sip_config.server}</p>
                          </div>
                        )}

                        {user.sip_config.username && (
                          <div className="p-3 rounded border bg-muted/50">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs font-semibold">Usuário</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(user.sip_config?.username || '')}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm font-mono">{user.sip_config.username}</p>
                          </div>
                        )}

                        {user.sip_config.domain && (
                          <div className="p-3 rounded border bg-muted/50">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs font-semibold flex items-center gap-1">
                                <Network className="h-3 w-3" />
                                Domínio
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(user.sip_config?.domain || '')}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm font-mono">{user.sip_config.domain}</p>
                          </div>
                        )}

                        {user.sip_config.login && (
                          <div className="p-3 rounded border bg-muted/50">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs font-semibold">Login</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(user.sip_config?.login || '')}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm font-mono">{user.sip_config.login}</p>
                          </div>
                        )}

                        {user.sip_config.password && (
                          <div className="p-3 rounded border bg-muted/50">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs font-semibold flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Senha
                              </Label>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePassword(user.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {showPasswords[user.id] ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(user.sip_config?.password || '')}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm font-mono">
                              {showPasswords[user.id] ? user.sip_config.password : '••••••••'}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Nenhuma configuração SIP cadastrada
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

