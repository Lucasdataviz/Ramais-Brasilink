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
import { Checkbox } from '@/components/ui/checkbox';
import { Ramal, Departamento } from '@/lib/types';
import {
  getRamais, deleteRamal, updateRamal, createRamal, getDepartamentosFromRamais,
  criarNotificacaoRamalCriado, criarNotificacaoRamalAtualizado
} from '@/lib/supabase';
import { toast } from 'sonner';
import { Phone, Eye, Copy, User, Server, Network, Lock, Edit, Trash2, Settings, Plus, Search, ArrowLeft, Folder, Users, UserCheck, HelpCircle } from 'lucide-react';

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
    descricao: '',
    servidor_sip: '',
    usuario: '',
    dominio: '',
    login: '',
    senha: '',
    status: 'ativo' as 'ativo' | 'inativo',
    isSupervisor: false,
    isCoordenador: false,
    legendaSupervisor: '',
    legendaCoordenador: '',
  });
  const [saving, setSaving] = useState(false);
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({ dominio: '', servidor_sip: '' });

  // Novos estados para navegação por pastas
  // Novos estados para navegação por pastas
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = ramais;

    // Filtro por departamento selecionado
    if (selectedDepartment) {
      if (selectedDepartment === 'Sem Departamento') {
        // Mostra apenas ramais sem departamento que NÃO são supervisores/coordenadores
        filtered = filtered.filter(r => (!r.departamento || r.departamento === 'Sem Departamento') && !r.supervisor && !r.coordenador);
      } else if (selectedDepartment === 'Supervisores e Coordenadores') {
        filtered = filtered.filter(r => r.supervisor || r.coordenador);
      } else {
        filtered = filtered.filter(r => r.departamento === selectedDepartment);
      }
    }

    // Filtro de busca
    if (searchTerm !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ramal) =>
          ramal.nome.toLowerCase().includes(term) ||
          ramal.ramal.includes(term) ||
          ramal.departamento.toLowerCase().includes(term)
      );
    }

    setFilteredRamais(filtered);
  }, [searchTerm, ramais, selectedDepartment]);

  // Departamentos filtrados para o viewMode = 'departments'
  const filteredDepartamentos = departamentos.filter(dept =>
    !searchTerm || dept.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [ramaisData, deptData] = await Promise.all([
        getRamais(),
        getDepartamentosFromRamais()
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
      descricao: '',
      servidor_sip: '',
      usuario: '',
      dominio: '',
      login: '',
      senha: '',
      status: 'ativo',
      isSupervisor: false,
      isCoordenador: false,
      legendaSupervisor: '',
      legendaCoordenador: '',
    });
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.nome.trim() || !createForm.ramal.trim()) {
      toast.error('Nome e ramal são obrigatórios');
      return;
    }

    // Se for supervisor ou coordenador, não precisa de departamento
    if (!createForm.isSupervisor && !createForm.isCoordenador && !createForm.departamento.trim()) {
      toast.error('Departamento é obrigatório para ramais normais');
      return;
    }

    try {
      setSaving(true);
      // Construct payload explicitly to avoid sending auxiliary form fields like isSupervisor/isCoordenador
      const payload: any = {
        nome: createForm.nome,
        ramal: createForm.ramal,
        departamento: (createForm.isSupervisor || createForm.isCoordenador) ? '' : createForm.departamento,
        descricao: createForm.descricao.trim() || null,
        servidor_sip: createForm.servidor_sip,
        usuario: createForm.usuario,
        dominio: createForm.dominio,
        login: createForm.login,
        senha: createForm.senha,
        status: createForm.status,
        supervisor: createForm.isSupervisor || false,
        coordenador: createForm.isCoordenador || false,
        legenda_supervisor: createForm.isSupervisor ? createForm.legendaSupervisor || null : null,
        legenda_coordenador: createForm.isCoordenador ? createForm.legendaCoordenador || null : null,
      };

      const novoRamal = await createRamal(payload);
      // Criar notificação
      try {
        await criarNotificacaoRamalCriado(novoRamal);
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
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
      // Buscar ramal antigo para comparar
      const ramalAntigo = ramais.find(r => r.id === editForm.id);
      if (!ramalAntigo) {
        toast.error('Ramal não encontrado');
        return;
      }

      await updateRamal(editForm.id, {
        nome: editForm.nome,
        ramal: editForm.ramal,
        departamento: (editForm.supervisor || editForm.coordenador) ? '' : editForm.departamento,
        descricao: editForm.descricao?.trim() || null,
        servidor_sip: editForm.servidor_sip,
        usuario: editForm.usuario,
        dominio: editForm.dominio,
        login: editForm.login,
        senha: editForm.senha,
        status: editForm.status,
        supervisor: editForm.supervisor || false,
        coordenador: editForm.coordenador || false,
        legenda_supervisor: editForm.supervisor ? editForm.legenda_supervisor || null : null,
        legenda_coordenador: editForm.coordenador ? editForm.legenda_coordenador || null : null,
      });

      // Criar notificação se houver mudanças relevantes
      try {
        await criarNotificacaoRamalAtualizado(ramalAntigo, editForm);
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }

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

  const handleBulkUpdate = async () => {
    if (!bulkConfig.dominio && !bulkConfig.servidor_sip) {
      toast.error('Preencha pelo menos um campo para atualizar');
      return;
    }

    if (!confirm('ATENÇÃO: Isso irá alterar o Domínio e/ou Servidor SIP de TODOS os ramais.\nDeseja realmente continuar?')) {
      return;
    }

    try {
      setSaving(true);
      // Dynamic import to avoid messing with top imports blind
      const { updateAllRamaisConfig } = await import('@/lib/supabase');

      await updateAllRamaisConfig(bulkConfig);

      toast.success('Ramais atualizados com sucesso!');
      setBulkUpdateDialogOpen(false);
      setBulkConfig({ dominio: '', servidor_sip: '' });
      loadData();
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast.error('Erro ao atualizar ramais');
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

  const getDepartmentColor = (deptIdOrName: string) => {
    const dept = departamentos.find(d => d.id === deptIdOrName || d.nome === deptIdOrName);
    return dept?.cor || '#6b7280';
  };

  const getDepartmentName = (deptIdOrName: string) => {
    const dept = departamentos.find(d => d.id === deptIdOrName || d.nome === deptIdOrName);
    return dept?.nome || deptIdOrName || 'Sem departamento';
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

  const getDepartmentStats = () => {
    const stats = new Map<string, number>();
    ramais.forEach(ramal => {
      if (ramal.supervisor || ramal.coordenador) {
        // Conta como Supervisor/Coordenador
        stats.set('Supervisores e Coordenadores', (stats.get('Supervisores e Coordenadores') || 0) + 1);
      } else {
        const dept = ramal.departamento || 'Sem Departamento';
        stats.set(dept, (stats.get(dept) || 0) + 1);
      }
    });
    return stats;
  };

  const departmentStats = getDepartmentStats();

  // Lista de departamentos para exibição
  const displayDepartments = [
    // Primeiro os departamentos reais
    ...departamentos,
    // Adicionar Card de Supervisores se houver
    ...(departmentStats.has('Supervisores e Coordenadores') ? [{
      id: 'supervisores-coordenadores',
      nome: 'Supervisores e Coordenadores',
      cor: '#8b5cf6', // Roxo
      icone: 'UserCheck',
      ativo: true
    } as Departamento] : []),
    // Por último, Sem Departamento, apenas se tiver ramais que NÃO são supervisores
    ...(departmentStats.has('Sem Departamento') ? [{
      id: 'sem-depto',
      nome: 'Sem Departamento',
      cor: '#94a3b8',
      icone: 'HelpCircle',
      ativo: true
    } as Departamento] : [])
  ];

  return (
    <div className="space-y-4">
      {viewMode === 'cards' ? (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Phone className="h-6 w-6" />
                  Gerenciar Ramais
                </CardTitle>
                <CardDescription>
                  Selecione um departamento para visualizar e gerenciar seus ramais
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(true)} className="gap-2">
                  <Network className="h-4 w-4" />
                  <span className="hidden sm:inline">Config. em Massa</span>
                </Button>
                <Button onClick={handleOpenCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Ramal
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card
                className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-primary flex flex-col justify-center items-center p-6 bg-muted/30 border-dashed"
                onClick={() => {
                  setSelectedDepartment(null);
                  setViewMode('list');
                }}
              >
                <Users className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-semibold text-lg">Todos os Ramais</h3>
                <p className="text-sm text-muted-foreground">{ramais.length} ramais</p>
              </Card>

              {displayDepartments.map((dept) => {
                const count = departmentStats.get(dept.nome) || 0;
                return (
                  <Card
                    key={dept.id || dept.nome}
                    className="cursor-pointer hover:shadow-md transition-all border-l-4 overflow-hidden group"
                    style={{ borderLeftColor: dept.cor || '#94a3b8' }}
                    onClick={() => {
                      setSelectedDepartment(dept.nome);
                      setViewMode('list');
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="p-2 rounded-lg bg-secondary/50 group-hover:bg-secondary transition-colors">
                          {dept.nome === 'Supervisores e Coordenadores' ? (
                            <UserCheck className="h-5 w-5" />
                          ) : dept.nome === 'Sem Departamento' ? (
                            <HelpCircle className="h-5 w-5" />
                          ) : (
                            <Folder className="h-5 w-5" />
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {count} ramais
                        </Badge>
                      </div>
                      <CardTitle className="mt-4 text-xl truncate" title={dept.nome}>{dept.nome}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">Clique para gerenciar</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setViewMode('cards');
                    setSelectedDepartment(null);
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Phone className="h-6 w-6" />
                    {selectedDepartment || 'Todos os Ramais'}
                  </CardTitle>
                  <CardDescription>
                    Gerenciando ramais {selectedDepartment ? `do departamento ${selectedDepartment}` : 'do sistema'}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, número..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button onClick={() => {
                  handleOpenCreateDialog();
                  if (selectedDepartment && selectedDepartment !== 'Sem Departamento') {
                    setCreateForm(prev => ({ ...prev, departamento: selectedDepartment }));
                  }
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ramal
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Grid de Ramais (Antigo List View) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredRamais.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="bg-muted/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {searchTerm ? 'Nenhum ramal encontrado' : 'Nenhum ramal cadastrado neste departamento'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Tente buscar por outro termo' : 'Clique em "Ramal" para adicionar'}
                  </p>
                </div>
              ) : (
                filteredRamais.map((ramal) => (
                  <Card
                    key={ramal.id}
                    className="group hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
                  >
                    <div className={`h-2 w-full ${ramal.supervisor ? 'bg-blue-500' :
                      ramal.coordenador ? 'bg-purple-500' :
                        'bg-gray-200 dark:bg-gray-700'
                      }`} />

                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0 mr-2">
                          <h3 className="font-bold text-lg truncate" title={ramal.nome}>
                            {ramal.nome}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: getDepartmentColor(ramal.departamento) }}
                            />
                            <span className="truncate" title={getDepartmentName(ramal.departamento)}>
                              {getDepartmentName(ramal.departamento)}
                            </span>
                          </div>
                          {(ramal.supervisor || ramal.coordenador) && (
                            <div className="flex gap-1 mt-2">
                              {ramal.supervisor && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] px-1.5 py-0">
                                  Supervisor
                                </Badge>
                              )}
                              {ramal.coordenador && (
                                <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[10px] px-1.5 py-0">
                                  Coordenador
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(ramal.status)}
                          <span className="font-mono font-bold text-lg text-foreground">
                            {ramal.ramal.slice(-4)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-8"
                          onClick={() => handleViewConfig(ramal)}
                        >
                          <Settings className="h-3 w-3 mr-1.5" />
                          Config
                        </Button>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="flex-1 h-8"
                            onClick={() => handleEdit(ramal)}
                            title="Editar"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="flex-1 h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(ramal.id, ramal.nome)}
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para CRIAR ramal */}
      < Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} >
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
                <Label htmlFor="create-departamento">Departamento {!createForm.isSupervisor && !createForm.isCoordenador && '*'}</Label>
                <Select
                  value={createForm.departamento}
                  onValueChange={(value) => setCreateForm({ ...createForm, departamento: value })}
                  disabled={createForm.isSupervisor || createForm.isCoordenador}
                >
                  <SelectTrigger id="create-departamento" disabled={createForm.isSupervisor || createForm.isCoordenador}>
                    <SelectValue placeholder={createForm.isSupervisor || createForm.isCoordenador ? "Não necessário para supervisor/coordenador" : "Selecione..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.filter(d => d.ativo).map((dept) => (
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
                {(createForm.isSupervisor || createForm.isCoordenador) && (
                  <p className="text-xs text-muted-foreground">
                    Supervisores e coordenadores não precisam de departamento
                  </p>
                )}
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
              <Label htmlFor="create-descricao">Descrição (Opcional)</Label>
              <Input
                id="create-descricao"
                value={createForm.descricao}
                onChange={(e) => setCreateForm({ ...createForm, descricao: e.target.value })}
                placeholder="Ex: Atendimento ao Cliente - Se não preenchido, usa o departamento"
              />
              <p className="text-xs text-muted-foreground">
                Se deixar em branco, será usado o nome do departamento como descrição
              </p>
            </div>

            {/* Checkboxes para Supervisor e Coordenador */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-supervisor"
                  checked={createForm.isSupervisor}
                  onCheckedChange={(checked) => {
                    const isSupervisor = checked === true;
                    setCreateForm({
                      ...createForm,
                      isSupervisor,
                      departamento: (isSupervisor || createForm.isCoordenador) ? '' : createForm.departamento
                    });
                  }}
                />
                <Label htmlFor="create-supervisor" className="text-sm font-normal cursor-pointer">
                  Supervisor
                </Label>
              </div>
              {createForm.isSupervisor && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="create-legenda-supervisor" className="text-sm">
                    Legenda do Supervisor (ex: Supervisor do Comercial)
                  </Label>
                  <Input
                    id="create-legenda-supervisor"
                    value={createForm.legendaSupervisor}
                    onChange={(e) => setCreateForm({ ...createForm, legendaSupervisor: e.target.value })}
                    placeholder="Ex: Supervisor do Comercial"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-coordenador"
                  checked={createForm.isCoordenador}
                  onCheckedChange={(checked) => {
                    const isCoordenador = checked === true;
                    setCreateForm({
                      ...createForm,
                      isCoordenador,
                      departamento: (isCoordenador || createForm.isSupervisor) ? '' : createForm.departamento
                    });
                  }}
                />
                <Label htmlFor="create-coordenador" className="text-sm font-normal cursor-pointer">
                  Coordenador
                </Label>
              </div>
              {createForm.isCoordenador && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="create-legenda-coordenador" className="text-sm">
                    Legenda do Coordenador (ex: Coordenador do SAC)
                  </Label>
                  <Input
                    id="create-legenda-coordenador"
                    value={createForm.legendaCoordenador}
                    onChange={(e) => setCreateForm({ ...createForm, legendaCoordenador: e.target.value })}
                    placeholder="Ex: Coordenador do SAC"
                  />
                </div>
              )}
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
      </Dialog >

      {/* Dialog para EDITAR ramal */}
      < Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen} >
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
                    disabled={editForm.supervisor || editForm.coordenador}
                  >
                    <SelectTrigger id="edit-departamento" disabled={editForm.supervisor || editForm.coordenador}>
                      <SelectValue placeholder={editForm.supervisor || editForm.coordenador ? "Não necessário para supervisor/coordenador" : ""} />
                    </SelectTrigger>
                    <SelectContent>
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
                  {(editForm.supervisor || editForm.coordenador) && (
                    <p className="text-xs text-muted-foreground">
                      Supervisores e coordenadores não precisam de departamento
                    </p>
                  )}
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
                <Label htmlFor="edit-descricao">Descrição (Opcional)</Label>
                <Input
                  id="edit-descricao"
                  value={editForm.descricao || ''}
                  onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                  placeholder="Ex: Atendimento ao Cliente - Se não preenchido, usa o departamento"
                />
                <p className="text-xs text-muted-foreground">
                  Se deixar em branco, será usado o nome do departamento como descrição
                </p>
              </div>

              {/* Checkboxes para Supervisor e Coordenador */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-supervisor"
                    checked={editForm.supervisor === true}
                    onCheckedChange={(checked) => {
                      const isSupervisor = checked === true;
                      setEditForm({
                        ...editForm,
                        supervisor: isSupervisor,
                        departamento: (isSupervisor || editForm.coordenador) ? '' : editForm.departamento
                      });
                    }}
                  />
                  <Label htmlFor="edit-supervisor" className="text-sm font-normal cursor-pointer">
                    Supervisor
                  </Label>
                </div>
                {editForm.supervisor && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="edit-legenda-supervisor" className="text-sm">
                      Legenda do Supervisor (ex: Supervisor do Comercial)
                    </Label>
                    <Input
                      id="edit-legenda-supervisor"
                      value={editForm.legenda_supervisor || ''}
                      onChange={(e) => setEditForm({ ...editForm, legenda_supervisor: e.target.value })}
                      placeholder="Ex: Supervisor do Comercial"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-coordenador"
                    checked={editForm.coordenador === true}
                    onCheckedChange={(checked) => {
                      const isCoordenador = checked === true;
                      setEditForm({
                        ...editForm,
                        coordenador: isCoordenador,
                        departamento: (isCoordenador || editForm.supervisor) ? '' : editForm.departamento
                      });
                    }}
                  />
                  <Label htmlFor="edit-coordenador" className="text-sm font-normal cursor-pointer">
                    Coordenador
                  </Label>
                </div>
                {editForm.coordenador && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="edit-legenda-coordenador" className="text-sm">
                      Legenda do Coordenador (ex: Coordenador do SAC)
                    </Label>
                    <Input
                      id="edit-legenda-coordenador"
                      value={editForm.legenda_coordenador || ''}
                      onChange={(e) => setEditForm({ ...editForm, legenda_coordenador: e.target.value })}
                      placeholder="Ex: Coordenador do SAC"
                    />
                  </div>
                )}
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
      </Dialog >

      {/* Sheet para VER CONFIGURAÇÕES */}
      < Sheet open={configSheetOpen} onOpenChange={setConfigSheetOpen} >
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
      </Sheet >
      {/* Dialog para ATUALIZAÇÃO EM MASSA */}
      < Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualização em Massa</DialogTitle>
            <DialogDescription>
              Altere o Domínio e/ou Servidor SIP de <strong>TODOS</strong> os ramais de uma vez.
              Deixe em branco o campo que não deseja alterar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-dominio">Novo Domínio (Opcional)</Label>
              <Input
                id="bulk-dominio"
                value={bulkConfig.dominio}
                onChange={e => setBulkConfig({ ...bulkConfig, dominio: e.target.value })}
                placeholder="Ex: novo.dominio.com.br"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-sip">Novo Servidor SIP (Opcional)</Label>
              <Input
                id="bulk-sip"
                value={bulkConfig.servidor_sip}
                onChange={e => setBulkConfig({ ...bulkConfig, servidor_sip: e.target.value })}
                placeholder="Ex: sip.novo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkUpdate} disabled={saving} variant="destructive">
              {saving ? 'Atualizando...' : 'Confirmar Atualização em Massa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </div >
  );
};