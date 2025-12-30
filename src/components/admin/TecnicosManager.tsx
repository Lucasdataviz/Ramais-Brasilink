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
import { Textarea } from '@/components/ui/textarea';
import { NumeroTecnico, TipoTecnico } from '@/lib/types';
import {
  getNumeroTecnicos,
  createNumeroTecnico,
  updateNumeroTecnico,
  deleteNumeroTecnico,
} from '@/lib/supabase';
import { toast } from 'sonner';
import { Wrench, Plus, Edit, Trash2, Phone, ChevronLeft } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const TIPOS_TECNICO_PREDEFINIDOS: TipoTecnico[] = ['Rio Verde', 'Viçosa', 'Tianguá', 'Frecheirinha', 'Infraestrutura', 'Araquém', 'Cocal-PI'];

export const TecnicosManager = () => {
  const [tecnicos, setTecnicos] = useState<NumeroTecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTecnico, setSelectedTecnico] = useState<NumeroTecnico | null>(null);
  const [saving, setSaving] = useState(false);
  const [cidadeOpen, setCidadeOpen] = useState(false);
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);
  const [cidadeSearch, setCidadeSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    descricao: '',
    tipo: 'Rio Verde' as TipoTecnico,
    supervisor: false,
    coordenador: false,
    areas_atuacao: [] as string[],
  });

  useEffect(() => {
    loadTecnicos();
  }, []);

  const loadTecnicos = async () => {
    try {
      setLoading(true);
      const data = await getNumeroTecnicos();
      setTecnicos(data);
      // Extrair cidades únicas dos técnicos
      const cidades = [...new Set(data.map(t => t.tipo))];
      setCidadesDisponiveis([...TIPOS_TECNICO_PREDEFINIDOS, ...cidades.filter(c => !TIPOS_TECNICO_PREDEFINIDOS.includes(c))]);
    } catch (error) {
      console.error('Error loading tecnicos:', error);
      toast.error('Erro ao carregar técnicos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      nome: '',
      telefone: '',
      descricao: '',
      tipo: 'Rio Verde',
      supervisor: false,
      coordenador: false,
      areas_atuacao: [],
    });
    setCidadeSearch('');
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (tecnico: NumeroTecnico) => {
    setSelectedTecnico(tecnico);
    setFormData({
      nome: tecnico.nome,
      telefone: tecnico.telefone,
      descricao: tecnico.descricao,
      tipo: tecnico.tipo,
      supervisor: tecnico.supervisor || false,
      coordenador: tecnico.coordenador || false,
      areas_atuacao: tecnico.areas_atuacao || [],
    });
    setEditDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.nome.trim() || !formData.telefone.trim() || !formData.descricao.trim()) {
      toast.error('Nome, telefone e função são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      const novoTecnico = await createNumeroTecnico({
        nome: formData.nome,
        telefone: formData.telefone,
        descricao: formData.descricao,
        tipo: formData.tipo,
        supervisor: formData.supervisor,
        coordenador: formData.coordenador,
        areas_atuacao: formData.areas_atuacao,
      });

      // Criar notificação
      try {
        const { criarNotificacaoTecnicoCriado } = await import('@/lib/supabase');
        await criarNotificacaoTecnicoCriado(novoTecnico);
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }

      toast.success('Técnico criado com sucesso!');
      setCreateDialogOpen(false);
      loadTecnicos();
    } catch (error: any) {
      console.error('Error creating tecnico:', error);
      let errorMessage = error.message || 'Erro ao criar técnico';

      // Verificar se é erro de constraint (cidade não permitida)
      if (error.message?.includes('check constraint') || error.message?.includes('violates check constraint')) {
        errorMessage = `A cidade "${formData.tipo}" não está permitida no banco de dados. Execute o script SQL para adicionar esta cidade: scripts/fixes/sql_add_cocal_pi_tecnicos.sql`;
      }

      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTecnico || !formData.nome.trim() || !formData.telefone.trim() || !formData.descricao.trim()) {
      toast.error('Nome, telefone e função são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      const tecnicoAtualizado = await updateNumeroTecnico(selectedTecnico.id, {
        nome: formData.nome,
        telefone: formData.telefone,
        descricao: formData.descricao,
        tipo: formData.tipo,
        supervisor: formData.supervisor,
        coordenador: formData.coordenador,
        areas_atuacao: formData.areas_atuacao,
      });

      // Criar notificação
      try {
        const { criarNotificacaoTecnicoAtualizado } = await import('@/lib/supabase');
        await criarNotificacaoTecnicoAtualizado(selectedTecnico, tecnicoAtualizado);
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }

      toast.success('Técnico atualizado com sucesso!');
      setEditDialogOpen(false);
      loadTecnicos();
    } catch (error: any) {
      console.error('Error updating tecnico:', error);
      let errorMessage = error.message || 'Erro ao atualizar técnico';

      // Verificar se é erro de constraint (cidade não permitida)
      if (error.message?.includes('check constraint') || error.message?.includes('violates check constraint')) {
        errorMessage = `A cidade "${formData.tipo}" não está permitida no banco de dados. Execute o script SQL para adicionar esta cidade: scripts/fixes/sql_add_cocal_pi_tecnicos.sql`;
      }

      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o técnico "${nome}"?`)) {
      return;
    }

    try {
      await deleteNumeroTecnico(id);
      toast.success('Técnico excluído com sucesso!');
      loadTecnicos();
    } catch (error: any) {
      console.error('Error deleting tecnico:', error);
      toast.error(error.message || 'Erro ao excluir técnico');
    }
  };

  const getTipoBadgeColor = (tipo: TipoTecnico) => {
    const colors: Record<string, string> = {
      'Rio Verde': 'bg-green-500',
      'Viçosa': 'bg-blue-500',
      'Tianguá': 'bg-purple-500',
      'Frecheirinha': 'bg-orange-500',
      'Infraestrutura': 'bg-red-500',
      'Araquém': 'bg-cyan-500',
      'Cocal-PI': 'bg-pink-500',
    };
    return colors[tipo] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando técnicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cidadesDisponiveis.map((cidade) => {
            const count = tecnicos.filter(t => t.tipo === cidade).length;
            const bgClass = getTipoBadgeColor(cidade as TipoTecnico).replace('bg-', 'border-').replace('500', '200'); // Light border

            return (
              <Card
                key={cidade}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all border-l-4",
                  bgClass === 'border-gray-500' ? "border-l-gray-500" : bgClass
                )}
                onClick={() => {
                  setSelectedCity(cidade);
                  setViewMode('list');
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex justify-between items-center">
                    {cidade}
                    <Badge variant="secondary" className="text-xs">
                      {count} técnicos
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Clique para gerenciar os técnicos de {cidade}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setViewMode('grid');
                    setSelectedCity(null);
                  }}
                  title="Voltar para lista de cidades"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Wrench className="h-6 w-6" />
                    Técnicos de {selectedCity}
                  </CardTitle>
                  <CardDescription>
                    Gerenciando {tecnicos.filter(t => t.tipo === selectedCity).length} técnicos em {selectedCity}
                  </CardDescription>
                </div>
              </div>
              <Button onClick={() => {
                handleOpenCreateDialog();
                if (selectedCity) {
                  setFormData(prev => ({ ...prev, tipo: selectedCity as TipoTecnico }));
                }
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Técnico
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tecnicos.filter(t => t.tipo === selectedCity).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nenhum técnico cadastrado nesta cidade
                      </TableCell>
                    </TableRow>
                  ) : (
                    tecnicos
                      .filter(t => t.tipo === selectedCity)
                      .map((tecnico) => (
                        <TableRow key={tecnico.id}>
                          <TableCell className="font-medium">{tecnico.nome}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono">{tecnico.telefone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{tecnico.descricao}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getTipoBadgeColor(tecnico.tipo)} text-white`}>
                              {tecnico.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditDialog(tecnico)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(tecnico.id, tecnico.nome)}
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
      )}

      {/* Dialog para CRIAR técnico */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Técnico</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo técnico
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
                  placeholder="Ex: Daniel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-telefone">Telefone *</Label>
                <Input
                  id="create-telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="Ex: (88) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-tipo">Cidade *</Label>
              <Popover open={cidadeOpen} onOpenChange={setCidadeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cidadeOpen}
                    className="w-full justify-between"
                  >
                    {formData.tipo || "Selecione uma cidade ou digite..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Buscar cidade ou digite nova..."
                      value={cidadeSearch}
                      onValueChange={(value) => setCidadeSearch(value)}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {cidadeSearch && (
                          <div className="py-2">
                            <p className="text-sm text-muted-foreground mb-2">Cidade não encontrada</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setFormData({ ...formData, tipo: cidadeSearch });
                                setCidadeSearch('');
                                setCidadeOpen(false);
                              }}
                            >
                              Criar "{cidadeSearch}"
                            </Button>
                          </div>
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {cidadesDisponiveis
                          .filter(cidade =>
                            !cidadeSearch ||
                            cidade.toLowerCase().includes(cidadeSearch.toLowerCase())
                          )
                          .map((cidade) => (
                            <CommandItem
                              key={cidade}
                              value={cidade}
                              onSelect={() => {
                                setFormData({ ...formData, tipo: cidade });
                                setCidadeSearch('');
                                setCidadeOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.tipo === cidade ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {cidade}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Input
                id="create-tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                placeholder="Ou digite uma nova cidade..."
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-descricao">Função *</Label>
              <Textarea
                id="create-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Instalação"
                rows={3}
              />
            </div>

            <div className="flex gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-supervisor"
                  checked={formData.supervisor}
                  onCheckedChange={(checked) => setFormData({ ...formData, supervisor: checked === true })}
                />
                <Label htmlFor="create-supervisor" className="text-sm font-normal cursor-pointer">
                  Supervisor
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-coordenador"
                  checked={formData.coordenador}
                  onCheckedChange={(checked) => setFormData({ ...formData, coordenador: checked === true })}
                />
                <Label htmlFor="create-coordenador" className="text-sm font-normal cursor-pointer">
                  Coordenador
                </Label>
              </div>
            </div>

            {(formData.coordenador || formData.supervisor) && (
              <div className="space-y-2 pt-2">
                <Label>Áreas de Atuação (Opcional)</Label>
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {cidadesDisponiveis.map((cidade) => (
                      <div key={cidade} className="flex items-center space-x-2">
                        <Checkbox
                          id={`create-area-${cidade}`}
                          checked={formData.areas_atuacao.includes(cidade)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                areas_atuacao: [...formData.areas_atuacao, cidade],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                areas_atuacao: formData.areas_atuacao.filter((c) => c !== cidade),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`create-area-${cidade}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {cidade}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecione as cidades adicionais que este técnico atende além da cidade principal.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Criando...' : 'Criar Técnico'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para EDITAR técnico */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Técnico</DialogTitle>
            <DialogDescription>
              Modifique as informações do técnico
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
                <Label htmlFor="edit-telefone">Telefone *</Label>
                <Input
                  id="edit-telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tipo">Cidade *</Label>
              <Popover open={cidadeOpen} onOpenChange={setCidadeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cidadeOpen}
                    className="w-full justify-between"
                  >
                    {formData.tipo || "Selecione uma cidade ou digite..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Buscar cidade ou digite nova..."
                      value={cidadeSearch}
                      onValueChange={(value) => setCidadeSearch(value)}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {cidadeSearch && (
                          <div className="py-2">
                            <p className="text-sm text-muted-foreground mb-2">Cidade não encontrada</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setFormData({ ...formData, tipo: cidadeSearch });
                                setCidadeSearch('');
                                setCidadeOpen(false);
                              }}
                            >
                              Criar "{cidadeSearch}"
                            </Button>
                          </div>
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {cidadesDisponiveis
                          .filter(cidade =>
                            !cidadeSearch ||
                            cidade.toLowerCase().includes(cidadeSearch.toLowerCase())
                          )
                          .map((cidade) => (
                            <CommandItem
                              key={cidade}
                              value={cidade}
                              onSelect={() => {
                                setFormData({ ...formData, tipo: cidade });
                                setCidadeSearch('');
                                setCidadeOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.tipo === cidade ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {cidade}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Input
                id="edit-tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                placeholder="Ou digite uma nova cidade..."
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Função *</Label>
              <Textarea
                id="edit-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-supervisor"
                  checked={formData.supervisor}
                  onCheckedChange={(checked) => setFormData({ ...formData, supervisor: checked === true })}
                />
                <Label htmlFor="edit-supervisor" className="text-sm font-normal cursor-pointer">
                  Supervisor
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-coordenador"
                  checked={formData.coordenador}
                  onCheckedChange={(checked) => setFormData({ ...formData, coordenador: checked === true })}
                />
                <Label htmlFor="edit-coordenador" className="text-sm font-normal cursor-pointer">
                  Coordenador
                </Label>
              </div>
            </div>

            {(formData.coordenador || formData.supervisor) && (
              <div className="space-y-2 pt-2">
                <Label>Áreas de Atuação (Opcional)</Label>
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {cidadesDisponiveis.map((cidade) => (
                      <div key={cidade} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-area-${cidade}`}
                          checked={formData.areas_atuacao.includes(cidade)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                areas_atuacao: [...formData.areas_atuacao, cidade],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                areas_atuacao: formData.areas_atuacao.filter((c) => c !== cidade),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`edit-area-${cidade}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {cidade}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecione as cidades adicionais que este técnico atende além da cidade principal.
                </p>
              </div>
            )}
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
