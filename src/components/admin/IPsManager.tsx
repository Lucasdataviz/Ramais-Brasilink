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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IPPermitido } from '@/lib/types';
import {
  getIPsPermitidos,
  createIPPermitido,
  updateIPPermitido,
  deleteIPPermitido,
  updateNginxConfig,
} from '@/lib/supabase';
import { toast } from 'sonner';
import { Network, Plus, Edit, Trash2, Power, PowerOff, AlertCircle, Copy, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export const IPsManager = () => {
  const [ips, setIPs] = useState<IPPermitido[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedIP, setSelectedIP] = useState<IPPermitido | null>(null);
  const [saving, setSaving] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [nginxConfig, setNginxConfig] = useState('');
  const [configCopied, setConfigCopied] = useState(false);
  const [formData, setFormData] = useState({
    ip: '',
    descricao: '',
    ativo: true,
  });

  useEffect(() => {
    loadIPs();
    // Tentar importar IPs iniciais se a tabela estiver vazia
    checkAndImportInitialIPs();
  }, []);

  const checkAndImportInitialIPs = async () => {
    try {
      const currentIPs = await getIPsPermitidos();
      if (currentIPs.length === 0) {
        // IPs padrão do nginx.conf
        const defaultIPs = [
          { ip: '168.228.178.187', descricao: 'IP Lucas' },
          { ip: '168.228.176.19', descricao: 'IP Centro ADM' },
        ];

        for (const ipData of defaultIPs) {
          try {
            await createIPPermitido({
              ip: ipData.ip,
              descricao: ipData.descricao,
              ativo: true,
            });
          } catch (error) {
            // Ignorar se já existir
            console.log(`IP ${ipData.ip} já existe ou erro ao criar:`, error);
          }
        }
        
        // Recarregar após importar
        loadIPs();
      }
    } catch (error) {
      console.error('Error checking/importing initial IPs:', error);
    }
  };

  const loadIPs = async () => {
    try {
      setLoading(true);
      const data = await getIPsPermitidos();
      setIPs(data);
    } catch (error) {
      console.error('Error loading IPs:', error);
      toast.error('Erro ao carregar IPs permitidos');
    } finally {
      setLoading(false);
    }
  };

  const validateIP = (ip: string): boolean => {
    // Validação básica de IP (IPv4)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      ip: '',
      descricao: '',
      ativo: true,
    });
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (ip: IPPermitido) => {
    setSelectedIP(ip);
    setFormData({
      ip: ip.ip,
      descricao: ip.descricao || '',
      ativo: ip.ativo,
    });
    setEditDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.ip.trim()) {
      toast.error('IP é obrigatório');
      return;
    }

    if (!validateIP(formData.ip)) {
      toast.error('IP inválido. Use o formato: xxx.xxx.xxx.xxx');
      return;
    }

    // Verificar se o IP já existe
    if (ips.some(ip => ip.ip === formData.ip)) {
      toast.error('Este IP já está cadastrado');
      return;
    }

    try {
      setSaving(true);
      await createIPPermitido({
        ip: formData.ip,
        descricao: formData.descricao || null,
        ativo: formData.ativo,
      });
      
      toast.success('IP adicionado com sucesso!');
      setCreateDialogOpen(false);
      const updatedIPs = await getIPsPermitidos();
      setIPs(updatedIPs);
      
      // Tentar atualizar Traefik automaticamente
      const nginxUpdated = await updateNginxConfig();
      if (nginxUpdated) {
        toast.success('Traefik atualizado automaticamente!');
      } else {
        // Se não tiver API configurada, mostrar dialog com config
        setTimeout(() => {
          const ipsAtivos = updatedIPs.filter(ip => ip.ativo);
          if (ipsAtivos.length > 0) {
            const configLines = ipsAtivos.map(ip => `    allow ${ip.ip};${ip.descricao ? `       # ${ip.descricao}` : ''}`).join('\n');
            const fullConfig = `# WHITELIST DE IPS - Permitir apenas IPs específicos\n${configLines}\n    deny all;                     # Bloquear todos os outros`;
            setNginxConfig(fullConfig);
            setConfigDialogOpen(true);
            setConfigCopied(false);
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Error creating IP:', error);
      toast.error(error.message || 'Erro ao adicionar IP');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedIP || !formData.ip.trim()) {
      toast.error('IP é obrigatório');
      return;
    }

    if (!validateIP(formData.ip)) {
      toast.error('IP inválido. Use o formato: xxx.xxx.xxx.xxx');
      return;
    }

    // Verificar se o IP já existe (exceto o atual)
    if (ips.some(ip => ip.ip === formData.ip && ip.id !== selectedIP.id)) {
      toast.error('Este IP já está cadastrado');
      return;
    }

    try {
      setSaving(true);
      await updateIPPermitido(selectedIP.id, {
        ip: formData.ip,
        descricao: formData.descricao || null,
        ativo: formData.ativo,
      });
      
      toast.success('IP atualizado com sucesso!');
      setEditDialogOpen(false);
      const updatedIPs = await getIPsPermitidos();
      setIPs(updatedIPs);
      
      // Tentar atualizar Traefik automaticamente
      const nginxUpdated = await updateNginxConfig();
      if (nginxUpdated) {
        toast.success('Traefik atualizado automaticamente!');
      } else {
        // Se não tiver API configurada, mostrar dialog com config
        setTimeout(() => {
          const ipsAtivos = updatedIPs.filter(ip => ip.ativo);
          if (ipsAtivos.length > 0) {
            const configLines = ipsAtivos.map(ip => `    allow ${ip.ip};${ip.descricao ? `       # ${ip.descricao}` : ''}`).join('\n');
            const fullConfig = `# WHITELIST DE IPS - Permitir apenas IPs específicos\n${configLines}\n    deny all;                     # Bloquear todos os outros`;
            setNginxConfig(fullConfig);
            setConfigDialogOpen(true);
            setConfigCopied(false);
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Error updating IP:', error);
      toast.error(error.message || 'Erro ao atualizar IP');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, ip: string) => {
    if (!confirm(`Tem certeza que deseja excluir o IP "${ip}"?`)) {
      return;
    }

    try {
      await deleteIPPermitido(id);
      toast.success('IP excluído com sucesso!');
      const updatedIPs = await getIPsPermitidos();
      setIPs(updatedIPs);
      
      // Tentar atualizar Traefik automaticamente
      const nginxUpdated = await updateNginxConfig();
      if (nginxUpdated) {
        toast.success('Traefik atualizado automaticamente!');
      } else {
        // Se não tiver API configurada, mostrar dialog com config
        setTimeout(() => {
          const ipsAtivos = updatedIPs.filter(ip => ip.ativo);
          if (ipsAtivos.length > 0) {
            const configLines = ipsAtivos.map(ip => `    allow ${ip.ip};${ip.descricao ? `       # ${ip.descricao}` : ''}`).join('\n');
            const fullConfig = `# WHITELIST DE IPS - Permitir apenas IPs específicos\n${configLines}\n    deny all;                     # Bloquear todos os outros`;
            setNginxConfig(fullConfig);
            setConfigDialogOpen(true);
            setConfigCopied(false);
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Error deleting IP:', error);
      toast.error(error.message || 'Erro ao excluir IP');
    }
  };

  const handleToggleStatus = async (ip: IPPermitido) => {
    try {
      await updateIPPermitido(ip.id, { ativo: !ip.ativo });
      toast.success(`IP ${ip.ativo ? 'desativado' : 'ativado'} com sucesso!`);
      loadIPs();
    } catch (error: any) {
      console.error('Error toggling IP status:', error);
      toast.error(error.message || 'Erro ao alterar status do IP');
    }
  };

  const generateNginxConfig = (showDialog = false) => {
    const ipsAtivos = ips.filter(ip => ip.ativo);
    if (ipsAtivos.length === 0) {
      toast.warning('Nenhum IP ativo para gerar configuração');
      return '';
    }

    // Gerar configuração para Traefik (Coolify usa Traefik)
    const ipsList = ipsAtivos.map(ip => ip.ip).join(',');
    const traefikLabels = `# Labels para Traefik (Coolify)
# Adicione estas labels no Coolify em "Docker Labels" ou "Environment"

traefik.http.middlewares.ipwhitelist.ipwhitelist.sourcerange=${ipsList}
traefik.http.routers.ramais-brasilink.middlewares=ipwhitelist

# Ou se preferir usar arquivo YAML:
# /etc/traefik/dynamic/ipwhitelist.yml
http:
  middlewares:
    ipwhitelist:
      ipWhiteList:
        sourceRange:
${ipsAtivos.map(ip => `          - ${ip.ip}${ip.descricao ? `  # ${ip.descricao}` : ''}`).join('\n')}

# Configuração Nginx (se usar Nginx diretamente):
# WHITELIST DE IPS - Permitir apenas IPs específicos
${ipsAtivos.map(ip => `    allow ${ip.ip};${ip.descricao ? `       # ${ip.descricao}` : ''}`).join('\n')}
    deny all;                     # Bloquear todos os outros`;

    if (showDialog) {
      setNginxConfig(traefikLabels);
      setConfigDialogOpen(true);
      setConfigCopied(false);
    }

    return traefikLabels;
  };

  const copyConfigToClipboard = () => {
    navigator.clipboard.writeText(nginxConfig).then(() => {
      setConfigCopied(true);
      toast.success('Configuração copiada para a área de transferência!');
      setTimeout(() => setConfigCopied(false), 2000);
    }).catch(() => {
      toast.error('Erro ao copiar para a área de transferência');
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando IPs permitidos...</p>
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
                <Network className="h-6 w-6" />
                Gerenciar IPs Permitidos
              </CardTitle>
              <CardDescription>
                Gerencie os IPs que podem acessar o sistema. O Coolify usa Traefik como proxy. Veja TRAEFIK_SETUP.md para configurar.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => generateNginxConfig(true)}>
                <Network className="mr-2 h-4 w-4" />
                Ver Config Traefik
              </Button>
              <Button onClick={handleOpenCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Novo IP
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="text-sm text-green-800 dark:text-green-200">
                <p className="font-semibold mb-1">✅ Atualização Automática:</p>
                <p>O sistema tenta atualizar o Traefik automaticamente quando você cria, edita ou exclui IPs.</p>
                <p className="mt-2 text-xs text-green-700 dark:text-green-300">
                  <strong>Coolify usa Traefik:</strong> A configuração é feita via Labels Docker no painel do Coolify.
                </p>
                <p className="mt-2 text-xs text-green-700 dark:text-green-300">
                  <strong>Para configurar:</strong> Veja <code className="bg-green-100 dark:bg-green-900 px-1 rounded">scripts/server/TRAEFIK_SETUP.md</code>
                </p>
              </div>
            </div>
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum IP cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  ips.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-mono font-medium">{ip.ip}</TableCell>
                      <TableCell>
                        {ip.descricao ? (
                          <span className="text-sm text-muted-foreground">{ip.descricao}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {ip.ativo ? (
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
                            onClick={() => handleToggleStatus(ip)}
                            title={ip.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {ip.ativo ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(ip)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ip.id, ip.ip)}
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

      {/* Dialog para CRIAR IP */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo IP</DialogTitle>
            <DialogDescription>
              Adicione um novo IP à lista de IPs permitidos
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-ip">IP *</Label>
              <Input
                id="create-ip"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                placeholder="Ex: 192.168.1.100"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Formato: xxx.xxx.xxx.xxx</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-descricao">Descrição</Label>
              <Input
                id="create-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: IP Lucas"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="create-ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="create-ativo">IP ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Adicionando...' : 'Adicionar IP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para EDITAR IP */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar IP</DialogTitle>
            <DialogDescription>
              Modifique as informações do IP
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ip">IP *</Label>
              <Input
                id="edit-ip"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Formato: xxx.xxx.xxx.xxx</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Input
                id="edit-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="edit-ativo">IP ativo</Label>
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

      {/* Dialog para mostrar Configuração do Traefik */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Configuração do Traefik (Coolify)
            </DialogTitle>
            <DialogDescription>
              Copie as labels abaixo e adicione no Coolify em "Docker Labels" ou "Environment". O Traefik detecta mudanças automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={nginxConfig}
                readOnly
                className="font-mono text-sm min-h-[200px] bg-muted"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={copyConfigToClipboard}
              >
                {configCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Próximos passos:</strong>
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <li>No Coolify, vá no seu serviço</li>
                <li>Vá em "Docker Labels" ou "Environment"</li>
                <li>Adicione as labels mostradas acima (começando com <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">traefik.http</code>)</li>
                <li>Salve e o Traefik detectará automaticamente</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={copyConfigToClipboard}>
              {configCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Configuração
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

