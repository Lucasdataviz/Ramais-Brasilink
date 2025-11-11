import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUser, UserSipConfig } from '@/lib/types';
import { updateAdminUser, getCurrentUser, setCurrentUser } from '@/lib/storage';
import { toast } from 'sonner';
import { Save, Server, Lock, User, Network, Eye, EyeOff, Copy, Settings } from 'lucide-react';

interface UserSettingsProps {
  user: AdminUser;
  onUpdate: (user: AdminUser) => void;
}

export const UserSettings = ({ user, onUpdate }: UserSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserSipConfig>({
    name: user.sip_config?.name || user.full_name || '',
    server: user.sip_config?.server || '',
    username: user.sip_config?.username || '',
    domain: user.sip_config?.domain || '',
    login: user.sip_config?.login || '',
    password: user.sip_config?.password || '',
    port: user.sip_config?.port || 5060,
    protocol: user.sip_config?.protocol || 'sip',
  });

  useEffect(() => {
    // Atualizar formData quando user mudar
    setFormData({
      name: user.sip_config?.name || user.full_name || '',
      server: user.sip_config?.server || '',
      username: user.sip_config?.username || '',
      domain: user.sip_config?.domain || '',
      login: user.sip_config?.login || '',
      password: user.sip_config?.password || '',
      port: user.sip_config?.port || 5060,
      protocol: user.sip_config?.protocol || 'sip',
    });
  }, [user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = updateAdminUser(user.id, {
        sip_config: formData,
      });

      if (updatedUser) {
        // Atualizar usuário atual se for o mesmo
        const currentUser = getCurrentUser();
        if (currentUser?.id === user.id) {
          setCurrentUser(updatedUser);
        }
        
        onUpdate(updatedUser);
        toast.success('Configurações salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar configurações');
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visualização dos Dados */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados SIP
            </CardTitle>
            <CardDescription>
              Visualize e copie suas configurações SIP
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              {formData.name && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(formData.name || '')}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-base font-mono font-bold text-foreground">{formData.name}</p>
                </div>
              )}
              
              {formData.server && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Servidor SIP
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(formData.server || '')}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-base font-mono font-bold text-foreground">{formData.server}</p>
                </div>
              )}

              {formData.username && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Usuário
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(formData.username || '')}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-base font-mono font-bold text-foreground">{formData.username}</p>
                </div>
              )}

              {formData.domain && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      Domínio
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(formData.domain || '')}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-base font-mono font-bold text-foreground">{formData.domain}</p>
                </div>
              )}

              {formData.login && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Login
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(formData.login || '')}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-base font-mono font-bold text-foreground">{formData.login}</p>
                </div>
              )}

              {formData.password && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 hover:shadow-md transition-all">
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
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(formData.password || '')}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-base font-mono font-bold text-foreground">
                    {showPassword ? formData.password : '••••••••'}
                  </p>
                </div>
              )}

              {(!formData.name && !formData.server && !formData.username) && (
                <div className="p-8 text-center text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Preencha os dados ao lado para visualizá-los aqui</p>
                </div>
              )}
            </CardContent>
        </Card>

        {/* Edição dos Dados */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Editar Configurações
            </CardTitle>
            <CardDescription>
              Configure suas credenciais SIP para uso no MicroSIP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jardel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="server" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Servidor SIP
                </Label>
                <Input
                  id="server"
                  type="text"
                  placeholder="tip6.npxtech.com.br"
                  value={formData.server}
                  onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="3283000"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login">Login</Label>
                  <Input
                    id="login"
                    type="text"
                    placeholder="3283000"
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Domínio
                </Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="tip6.npxtech.com.br"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="GRRLxzTbd0"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocolo</Label>
                  <Input
                    id="protocol"
                    type="text"
                    placeholder="sip"
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Porta</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="5060"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 5060 })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
