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
  Building2, Plus, Edit, Trash2, Power, PowerOff, Phone, Check, ChevronsUpDown, Search
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

  const filteredRamais = ramais.filter(ramal => {
    if (!ramaisSearch) return true;
    const search = ramaisSearch.toLowerCase();
    return (
      ramal.nome.toLowerCase().includes(search) ||
      ramal.ramal.toLowerCase().includes(search) ||
      ramal.departamento?.toLowerCase().includes(search)
    );
  });

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
                  <TableHead>Ícone</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ramais</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Coordenador</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum departamento cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  departamentos.map((departamento) => {
                    const ramaisDoDepartamento = getRamaisDoDepartamento(departamento);
                    return (
                      <TableRow key={departamento.id}>
                        <TableCell>
                          {getIconComponent(departamento.icone || 'Empresa')}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: departamento.cor }}
                            ></div>
                            {departamento.nome}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {ramaisDoDepartamento.slice(0, 3).map((ramal) => (
                              <Badge key={ramal.id} variant="outline" className="text-xs">
                                <Phone className="h-3 w-3 mr-1" />
                                {ramal.ramal}
                              </Badge>
                            ))}
                            {ramaisDoDepartamento.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{ramaisDoDepartamento.length - 3}
                              </Badge>
                            )}
                            {ramaisDoDepartamento.length === 0 && (
                              <span className="text-xs text-muted-foreground">Nenhum ramal</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {departamento.supervisor ? (
                            <Badge variant="secondary">{departamento.supervisor}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {departamento.coordenador ? (
                            <Badge variant="secondary">{departamento.coordenador}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
                        <CommandEmpty>Nenhum ramal encontrado.</CommandEmpty>
                        <CommandGroup>
                          {ramais.map((ramal) => (
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
                        <CommandEmpty>Nenhum ramal encontrado.</CommandEmpty>
                        <CommandGroup>
                          {ramais.map((ramal) => (
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
                <div className="flex gap-2">
                  <Select
                    value={formData.cor}
                    onValueChange={(value) => setFormData({ ...formData, cor: value })}
                  >
                    <SelectTrigger id="create-cor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            ></div>
                            <span>{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-20 h-10"
                  />
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
                        <CommandEmpty>Nenhum ramal encontrado.</CommandEmpty>
                        <CommandGroup>
                          {ramais.map((ramal) => (
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
                        <CommandEmpty>Nenhum ramal encontrado.</CommandEmpty>
                        <CommandGroup>
                          {ramais.map((ramal) => (
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
                <div className="flex gap-2">
                  <Select
                    value={formData.cor}
                    onValueChange={(value) => setFormData({ ...formData, cor: value })}
                  >
                    <SelectTrigger id="edit-cor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            ></div>
                            <span>{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-20 h-10"
                  />
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
