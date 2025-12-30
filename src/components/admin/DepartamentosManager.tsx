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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Departamento, Ramal } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  getAllDepartamentos,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
  toggleDepartamentoStatus,
  getRamais,
  updateRamal,
  getRamalsByDepartamento,
  criarNotificacaoDepartamentoCriado,
} from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Building2, Plus, Edit, Trash2, Power, PowerOff, Phone, Check, ChevronsUpDown, Search, ChevronLeft, User
} from 'lucide-react';
import { PREDEFINED_ICONS, getIconComponent as getIcon } from '@/lib/icons';

// Função para obter ícone por nome ou emoji
const getIconComponent = (iconName: string) => {
  const IconComponent = getIcon(iconName);
  if (typeof IconComponent === 'function' || typeof IconComponent === 'object') {
    const Icon = IconComponent as any;
    return <Icon className="h-5 w-5" />;
  }
  // Fallback para emoji se não encontrar
  return <span className="text-xl">{iconName}</span>;
};

// Cores predefinidas
const PREDEFINED_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#ef4444',
  '#14b8a6', '#f97316', '#84cc16', '#a855f7', '#e11d48', '#0ea5e9', '#64748b', '#1e293b',
];

export const DepartamentosManager = () => {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ramais, setRamais] = useState<Ramal[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null);
  const [saving, setSaving] = useState(false);
  const [supervisorOpen, setSupervisorOpen] = useState(false);
  const [coordenadorOpen, setCoordenadorOpen] = useState(false);
  const [ramaisSearch, setRamaisSearch] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    icone: 'Empresa',
    cor: '#3b82f6',
    supervisor: '',
    coordenador: '',
    status: 'ativo' as 'ativo' | 'inativo',
    ramaisSelecionados: [] as string[], // IDs dos ramais selecionados
  });

  const [viewMode, setViewMode] = useState<'cards' | 'details'>('cards');
  const [viewingDepartment, setViewingDepartment] = useState<Departamento | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptData, ramaisData] = await Promise.all([
        getAllDepartamentos(),
        getRamais(),
      ]);
      setDepartamentos(deptData);
      setRamais(ramaisData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback: usar getDepartamentosFromRamais se getAllDepartamentos falhar
      try {
        const { getDepartamentosFromRamais } = await import('@/lib/supabase');
        const data = await getDepartamentosFromRamais();
        setDepartamentos(data);
      } catch (fallbackError) {
        console.error('Error loading departamentos:', fallbackError);
        toast.error('Erro ao carregar departamentos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      nome: '',
      icone: 'Empresa',
      cor: '#3b82f6',
      supervisor: '',
      coordenador: '',
      status: 'ativo',
      ramaisSelecionados: [],
    });
    setRamaisSearch('');
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = async (departamento: Departamento) => {
    setSelectedDepartamento(departamento);

    // Buscar ramais vinculados a este departamento
    try {
      const ramaisDoDepartamento = await getRamalsByDepartamento(departamento.nome);
      const ramaisIds = ramaisDoDepartamento.map(r => r.id);

      setFormData({
        nome: departamento.nome,
        icone: departamento.icone || 'Empresa',
        cor: departamento.cor || '#3b82f6',
        supervisor: departamento.supervisor || '',
        coordenador: departamento.coordenador || '',
        status: departamento.ativo ? 'ativo' : 'inativo',
        ramaisSelecionados: ramaisIds,
      });
    } catch (error) {
      console.error('Error loading ramais:', error);
      setFormData({
        nome: departamento.nome,
        icone: departamento.icone || 'Empresa',
        cor: departamento.cor || '#3b82f6',
        supervisor: departamento.supervisor || '',
        coordenador: departamento.coordenador || '',
        status: departamento.ativo ? 'ativo' : 'inativo',
        ramaisSelecionados: [],
      });
    }
    setEditDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome do departamento é obrigatório');
      return;
    }

    try {
      setSaving(true);

      // Tentar criar na tabela departamentos
      try {
        const novoDepartamento = await createDepartamento({
          nome: formData.nome,
          cor: formData.cor,
          icone: formData.icone,
          ordem: departamentos.length,
          ativo: formData.status === 'ativo',
          departamento_pai: null,
          supervisor: formData.supervisor || null,
          coordenador: formData.coordenador || null,
        });

        // Vincular ramais selecionados ao departamento
        if (formData.ramaisSelecionados.length > 0) {
          for (const ramalId of formData.ramaisSelecionados) {
            await updateRamal(ramalId, { departamento: formData.nome });
          }
        }

        // Criar notificação
        try {
          await criarNotificacaoDepartamentoCriado(novoDepartamento);
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }

        toast.success('Departamento criado com sucesso!');
        setCreateDialogOpen(false);
        loadData();
      } catch (error: any) {
        // Se a tabela departamentos não existir, criar um ramal placeholder
        if (error.message?.includes('relation "departamentos" does not exist')) {
          const { createRamalWithDepartamento } = await import('@/lib/supabase');
          await createRamalWithDepartamento({
            nome: `Departamento ${formData.nome}`,
            ramal: `DEP-${formData.nome.toUpperCase().substring(0, 3)}`,
            departamento: formData.nome,
            servidor_sip: '',
            usuario: '',
            dominio: '',
            login: '',
            senha: '',
            status: formData.status,
          });
          toast.success('Departamento criado com sucesso!');
          setCreateDialogOpen(false);
          loadData();
        } else {
          throw error;
        }
      }
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

      // Tentar atualizar na tabela departamentos
      try {
        await updateDepartamento(selectedDepartamento.id, {
          nome: formData.nome,
          cor: formData.cor,
          icone: formData.icone,
          ativo: formData.status === 'ativo',
          supervisor: formData.supervisor || null,
          coordenador: formData.coordenador || null,
        });

        // Atualizar ramais vinculados
        // Primeiro, remover vínculo de todos os ramais do departamento antigo
        const ramaisAntigos = await getRamalsByDepartamento(selectedDepartamento.nome);
        for (const ramal of ramaisAntigos) {
          if (!formData.ramaisSelecionados.includes(ramal.id)) {
            await updateRamal(ramal.id, { departamento: '' });
          }
        }

        // Depois, adicionar vínculo dos ramais selecionados
        for (const ramalId of formData.ramaisSelecionados) {
          await updateRamal(ramalId, { departamento: formData.nome });
        }

        toast.success('Departamento atualizado com sucesso!');
        setEditDialogOpen(false);
        loadData();
      } catch (error: any) {
        // Se a tabela departamentos não existir, atualizar apenas os ramais
        if (error.message?.includes('relation "departamentos" does not exist')) {
          const { updateRamaisByDepartamento } = await import('@/lib/supabase');
          if (selectedDepartamento.nome !== formData.nome) {
            await updateRamaisByDepartamento(selectedDepartamento.nome, formData.nome);
          }
          toast.success('Departamento atualizado com sucesso!');
          setEditDialogOpen(false);
          loadData();
        } else {
          throw error;
        }
      }
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
      loadData();
    } catch (error: any) {
      console.error('Error deleting departamento:', error);
      // Se a tabela departamentos não existir, deletar ramais
      if (error.message?.includes('relation "departamentos" does not exist')) {
        const { deleteRamaisByDepartamento } = await import('@/lib/supabase');
        await deleteRamaisByDepartamento(nome);
        toast.success('Departamento excluído com sucesso!');
        loadData();
      } else {
        toast.error(error.message || 'Erro ao excluir departamento');
      }
    }
  };

  const handleToggleStatus = async (departamento: Departamento) => {
    try {
      await toggleDepartamentoStatus(departamento.id, departamento.ativo);
      toast.success(`Departamento ${departamento.ativo ? 'desativado' : 'ativado'} com sucesso!`);
      loadData();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      // Fallback: atualizar ramais manualmente
      const ramaisDoDepartamento = ramais.filter(r => r.departamento === departamento.nome);
      const novoStatus = departamento.ativo ? 'inativo' : 'ativo';
      for (const ramal of ramaisDoDepartamento) {
        await updateRamal(ramal.id, { status: novoStatus });
      }
      toast.success(`Departamento ${departamento.ativo ? 'desativado' : 'ativado'} com sucesso!`);
      loadData();
    }
  };

  const toggleRamalSelection = (ramalId: string) => {
    setFormData(prev => ({
      ...prev,
      ramaisSelecionados: prev.ramaisSelecionados.includes(ramalId)
        ? prev.ramaisSelecionados.filter(id => id !== ramalId)
        : [...prev.ramaisSelecionados, ramalId],
    }));
  };

  const getRamaisDoDepartamento = (departamento: Departamento) => {
    return ramais.filter(r => r.departamento === departamento.nome || r.departamento === departamento.id);
  };

  // Ramais filtrados para vincular ao departamento (excluindo supervisores e coordenadores)
  const filteredRamais = ramais.filter(ramal => {
    // Excluir supervisores e coordenadores
    if (ramal.supervisor || ramal.coordenador) return false;

    if (!ramaisSearch) return true;
    const search = ramaisSearch.toLowerCase();
    return (
      ramal.nome.toLowerCase().includes(search) ||
      ramal.ramal.toLowerCase().includes(search) ||
      ramal.departamento?.toLowerCase().includes(search)
    );
  });

  // Ramais que são supervisores (para seleção de supervisor)
  const ramaisSupervisores = ramais.filter(ramal => ramal.supervisor === true);

  // Ramais que são coordenadores (para seleção de coordenador)
  const ramaisCoordenadores = ramais.filter(ramal => ramal.coordenador === true);

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
      {viewMode === 'cards' ? (
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
            {departamentos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum departamento cadastrado</p>
                <Button variant="link" onClick={handleOpenCreateDialog}>Criar primeiro departamento</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {departamentos.map((dept) => {
                  const deptRamais = getRamaisDoDepartamento(dept);
                  return (
                    <Card
                      key={dept.id}
                      className="cursor-pointer hover:shadow-md transition-all group overflow-hidden border-l-4"
                      style={{ borderLeftColor: dept.cor }}
                      onClick={() => {
                        setViewingDepartment(dept);
                        setViewMode('details');
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="p-2 rounded-lg bg-secondary/50 group-hover:bg-secondary transition-colors">
                            {getIconComponent(dept.icone || 'Empresa')}
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            {dept.ativo ? (
                              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0">Ativo</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-muted-foreground">Inativo</Badge>
                            )}
                          </div>
                        </div>
                        <CardTitle className="mt-4 text-xl">{dept.nome}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                            <span className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Ramais
                            </span>
                            <span className="font-bold text-foreground">{deptRamais.length}</span>
                          </div>

                          {(dept.supervisor || dept.coordenador) && (
                            <div className="space-y-2 pt-2 border-t text-xs">
                              {dept.supervisor && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span className="truncate">Sup: {dept.supervisor.split('-')[0].trim()}</span>
                                </div>
                              )}
                              {dept.coordenador && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span className="truncate">Coord: {dept.coordenador.split('-')[0].trim()}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Detail View Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setViewMode('cards');
                setViewingDepartment(null);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <div
                  className="p-2 rounded-md bg-muted"
                  style={{ color: viewingDepartment?.cor }}
                >
                  {viewingDepartment && getIconComponent(viewingDepartment.icone || 'Empresa')}
                </div>
                {viewingDepartment?.nome}
              </h2>
              <p className="text-muted-foreground">
                Gerencie as configurações e ramais deste departamento
              </p>
            </div>

            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                onClick={() => viewingDepartment && handleToggleStatus(viewingDepartment)}
              >
                {viewingDepartment?.ativo ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4 text-red-500" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4 text-green-500" />
                    Ativar
                  </>
                )}
              </Button>
              <Button
                onClick={() => viewingDepartment && handleOpenEditDialog(viewingDepartment)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Configurações
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  if (viewingDepartment) {
                    handleDelete(viewingDepartment.id, viewingDepartment.nome);
                    setViewMode('cards');
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Ramais List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Ramais do Departamento
              </CardTitle>
              <CardDescription>
                Lista de todos os ramais vinculados ao departamento {viewingDepartment?.nome}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingDepartment && getRamaisDoDepartamento(viewingDepartment).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum ramal vinculado a este departamento.
                      </TableCell>
                    </TableRow>
                  ) : (
                    viewingDepartment && getRamaisDoDepartamento(viewingDepartment).map((ramal) => (
                      <TableRow key={ramal.id}>
                        <TableCell className="font-mono font-bold">{ramal.ramal}</TableCell>
                        <TableCell>{ramal.nome}</TableCell>
                        <TableCell>
                          {ramal.supervisor ? (
                            <Badge>Supervisor</Badge>
                          ) : ramal.coordenador ? (
                            <Badge variant="outline">Coordenador</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Padrão</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ramal.status === 'ativo' ? 'default' : 'secondary'} className={ramal.status === 'ativo' ? 'bg-green-500' : ''}>
                            {ramal.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog para CRIAR departamento */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                placeholder="Ex: SAC"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-supervisor">Supervisor</Label>
                <Popover open={supervisorOpen} onOpenChange={setSupervisorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={supervisorOpen}
                      className="w-full justify-between"
                    >
                      {formData.supervisor || "Selecione um ramal ou digite..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar por nome ou ramal..." />
                      <CommandList>
                        <CommandEmpty>Nenhum supervisor encontrado.</CommandEmpty>
                        <CommandGroup>
                          {ramaisSupervisores.map((ramal) => (
                            <CommandItem
                              key={ramal.id}
                              value={`${ramal.nome} - ${ramal.ramal}`}
                              onSelect={() => {
                                setFormData({ ...formData, supervisor: `${ramal.nome} - ${ramal.ramal}` });
                                setSupervisorOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.supervisor === `${ramal.nome} - ${ramal.ramal}` ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <Phone className="mr-2 h-4 w-4" />
                              {ramal.nome} - {ramal.ramal}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Input
                  id="create-supervisor"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                  placeholder="Ou digite manualmente..."
                  className="mt-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-coordenador">Coordenador</Label>
                <Popover open={coordenadorOpen} onOpenChange={setCoordenadorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={coordenadorOpen}
                      className="w-full justify-between"
                    >
                      {formData.coordenador || "Selecione um ramal ou digite..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar por nome ou ramal..." />
                      <CommandList>
                        <CommandEmpty>Nenhum coordenador encontrado.</CommandEmpty>
                        <CommandGroup>
                          {ramaisCoordenadores.map((ramal) => (
                            <CommandItem
                              key={ramal.id}
                              value={`${ramal.nome} - ${ramal.ramal}`}
                              onSelect={() => {
                                setFormData({ ...formData, coordenador: `${ramal.nome} - ${ramal.ramal}` });
                                setCoordenadorOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.coordenador === `${ramal.nome} - ${ramal.ramal}` ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <Phone className="mr-2 h-4 w-4" />
                              {ramal.nome} - {ramal.ramal}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Input
                  id="create-coordenador"
                  value={formData.coordenador}
                  onChange={(e) => setFormData({ ...formData, coordenador: e.target.value })}
                  placeholder="Ou digite manualmente..."
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-icone">Ícone</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.icone}
                    onValueChange={(value) => setFormData({ ...formData, icone: value })}
                  >
                    <SelectTrigger id="create-icone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        {PREDEFINED_ICONS.map((iconData) => {
                          const IconComponent = iconData.icon;
                          return (
                            <SelectItem key={iconData.name} value={iconData.name}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                <span>{iconData.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.icone}
                    onValueChange={(value) => setFormData({ ...formData, icone: value })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_ICONS.map((iconData) => {
                        const IconComponent = iconData.icon;
                        return (
                          <SelectItem key={iconData.name} value={iconData.name}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{iconData.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-cor">Cor</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    id="create-cor"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-16 h-12 cursor-pointer"
                    title="Clique para escolher uma cor"
                  />
                  <Input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Validar formato hex
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                        setFormData({ ...formData, cor: value || '#3b82f6' });
                      }
                    }}
                    placeholder="#3b82f6"
                    className="flex-1 font-mono"
                    maxLength={7}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <p className="text-xs text-muted-foreground w-full">Cores rápidas:</p>
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, cor: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${formData.cor === color ? 'border-gray-900 dark:border-gray-100 ring-2 ring-offset-2' : 'border-gray-300 dark:border-gray-700'
                        }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'ativo' | 'inativo') => setFormData({ ...formData, status: value })}
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

            <div className="space-y-2 border-t pt-4">
              <Label>Vincular Ramais Existentes</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Buscar por setor, ramal ou nome..."
                  value={ramaisSearch}
                  onChange={(e) => setRamaisSearch(e.target.value)}
                  className="w-full"
                />
                <ScrollArea className="h-40 border rounded-md p-4">
                  <div className="space-y-2">
                    {filteredRamais.map((ramal) => (
                      <div key={ramal.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ramal-${ramal.id}`}
                          checked={formData.ramaisSelecionados.includes(ramal.id)}
                          onCheckedChange={() => toggleRamalSelection(ramal.id)}
                        />
                        <Label
                          htmlFor={`ramal-${ramal.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {ramal.nome} - {ramal.ramal} {ramal.departamento && `(${ramal.departamento})`}
                        </Label>
                      </div>
                    ))}
                    {filteredRamais.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum ramal encontrado</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="edit-supervisor">Supervisor</Label>
                <Popover open={supervisorOpen} onOpenChange={setSupervisorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={supervisorOpen}
                      className="w-full justify-between"
                    >
                      {formData.supervisor || "Selecione um ramal ou digite..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar por nome ou ramal..." />
                      <CommandList>
                        <CommandEmpty>Nenhum supervisor encontrado.</CommandEmpty>
                        <CommandGroup>
                          {ramaisSupervisores.map((ramal) => (
                            <CommandItem
                              key={ramal.id}
                              value={`${ramal.nome} - ${ramal.ramal}`}
                              onSelect={() => {
                                setFormData({ ...formData, supervisor: `${ramal.nome} - ${ramal.ramal}` });
                                setSupervisorOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.supervisor === `${ramal.nome} - ${ramal.ramal}` ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <Phone className="mr-2 h-4 w-4" />
                              {ramal.nome} - {ramal.ramal}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Input
                  id="edit-supervisor"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                  placeholder="Ou digite manualmente..."
                  className="mt-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-coordenador">Coordenador</Label>
                <Popover open={coordenadorOpen} onOpenChange={setCoordenadorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={coordenadorOpen}
                      className="w-full justify-between"
                    >
                      {formData.coordenador || "Selecione um ramal ou digite..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar por nome ou ramal..." />
                      <CommandList>
                        <CommandEmpty>Nenhum coordenador encontrado.</CommandEmpty>
                        <CommandGroup>
                          {ramaisCoordenadores.map((ramal) => (
                            <CommandItem
                              key={ramal.id}
                              value={`${ramal.nome} - ${ramal.ramal}`}
                              onSelect={() => {
                                setFormData({ ...formData, coordenador: `${ramal.nome} - ${ramal.ramal}` });
                                setCoordenadorOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.coordenador === `${ramal.nome} - ${ramal.ramal}` ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <Phone className="mr-2 h-4 w-4" />
                              {ramal.nome} - {ramal.ramal}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Input
                  id="edit-coordenador"
                  value={formData.coordenador}
                  onChange={(e) => setFormData({ ...formData, coordenador: e.target.value })}
                  placeholder="Ou digite manualmente..."
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-icone">Ícone</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.icone}
                    onValueChange={(value) => setFormData({ ...formData, icone: value })}
                  >
                    <SelectTrigger id="edit-icone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        {PREDEFINED_ICONS.map((iconData) => {
                          const IconComponent = iconData.icon;
                          return (
                            <SelectItem key={iconData.name} value={iconData.name}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                <span>{iconData.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.icone}
                    onValueChange={(value) => setFormData({ ...formData, icone: value })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_ICONS.map((iconData) => {
                        const IconComponent = iconData.icon;
                        return (
                          <SelectItem key={iconData.name} value={iconData.name}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{iconData.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cor">Cor</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    id="edit-cor"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-16 h-12 cursor-pointer"
                    title="Clique para escolher uma cor"
                  />
                  <Input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Validar formato hex
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                        setFormData({ ...formData, cor: value || '#3b82f6' });
                      }
                    }}
                    placeholder="#3b82f6"
                    className="flex-1 font-mono"
                    maxLength={7}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <p className="text-xs text-muted-foreground w-full">Cores rápidas:</p>
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, cor: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${formData.cor === color ? 'border-gray-900 dark:border-gray-100 ring-2 ring-offset-2' : 'border-gray-300 dark:border-gray-700'
                        }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'ativo' | 'inativo') => setFormData({ ...formData, status: value })}
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

            <div className="space-y-2 border-t pt-4">
              <Label>Vincular Ramais Existentes</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Buscar por setor, ramal ou nome..."
                  value={ramaisSearch}
                  onChange={(e) => setRamaisSearch(e.target.value)}
                  className="w-full"
                />
                <ScrollArea className="h-40 border rounded-md p-4">
                  <div className="space-y-2">
                    {filteredRamais.map((ramal) => (
                      <div key={ramal.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-ramal-${ramal.id}`}
                          checked={formData.ramaisSelecionados.includes(ramal.id)}
                          onCheckedChange={() => toggleRamalSelection(ramal.id)}
                        />
                        <Label
                          htmlFor={`edit-ramal-${ramal.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {ramal.nome} - {ramal.ramal} {ramal.departamento && `(${ramal.departamento})`}
                        </Label>
                      </div>
                    ))}
                    {filteredRamais.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum ramal encontrado</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
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
