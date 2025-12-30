import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Search, Wrench, ArrowLeft, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getNumeroTecnicos } from '@/lib/supabase';
import { NumeroTecnico, TipoTecnico } from '@/lib/types';
import { toast } from 'sonner';

const TIPOS_TECNICO: TipoTecnico[] = ['Rio Verde', 'Viçosa', 'Tianguá', 'Frecheirinha', 'Infraestrutura', 'Araquém', 'Cocal-PI']

export default function Tecnicos() {
  const [tecnicos, setTecnicos] = useState<NumeroTecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('Todos');

  useEffect(() => {
    loadTecnicos();
  }, []);

  const loadTecnicos = async () => {
    try {
      setLoading(true);
      const data = await getNumeroTecnicos();
      setTecnicos(data);
    } catch (error) {
      console.error('Error loading tecnicos:', error);
      toast.error('Erro ao carregar técnicos');
    } finally {
      setLoading(false);
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  // Filtrar técnicos por busca
  const filteredBySearch = useMemo(() => {
    if (!search) return tecnicos;
    return tecnicos.filter((tecnico) =>
      tecnico.nome.toLowerCase().includes(search.toLowerCase()) ||
      tecnico.telefone.includes(search) ||
      tecnico.descricao.toLowerCase().includes(search.toLowerCase())
    );
  }, [tecnicos, search]);

  // Agrupar técnicos por tipo (incluindo áreas de atuação secundárias)
  const tecnicosPorTipo = useMemo(() => {
    const grouped: Record<string, NumeroTecnico[]> = {};

    // Inicializar arrays para os tipos predefinidos
    TIPOS_TECNICO.forEach(tipo => {
      grouped[tipo] = [];
    });

    filteredBySearch.forEach(tecnico => {
      // Adicionar à cidade principal
      if (!grouped[tecnico.tipo]) {
        grouped[tecnico.tipo] = [];
      }
      grouped[tecnico.tipo].push(tecnico);

      // Adicionar às áreas de atuação secundárias
      if (tecnico.areas_atuacao && Array.isArray(tecnico.areas_atuacao)) {
        tecnico.areas_atuacao.forEach(area => {
          // Normalizar nome da área (opcional, mas bom pra garantir)
          // Se a área não existe no objeto agrupado, cria
          // Mas idealmente só adicionamos se for um tipo válido ou customizado que queremos mostrar
          // Se for uma string livre, vamos adicionar
          if (!grouped[area]) {
            grouped[area] = [];
          }

          // Evitar duplicatas se a área for igual ao tipo principal (segurança)
          if (area !== tecnico.tipo) {
            // Verificar se já não foi adicionado (caso de duplicidade no array de areas)
            if (!grouped[area].some(t => t.id === tecnico.id)) {
              grouped[area].push(tecnico);
            }
          }
        });
      }
    });

    return grouped;
  }, [filteredBySearch]);

  // Técnicos filtrados por tipo selecionado
  const filteredTecnicos = useMemo(() => {
    if (selectedTipo === 'Todos') {
      return filteredBySearch;
    }
    return tecnicosPorTipo[selectedTipo] || [];
  }, [filteredBySearch, tecnicosPorTipo, selectedTipo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando técnicos...</p>
        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">

      {/* Header Premium */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 693 893"
                  className="h-7 w-7"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <g transform="translate(0,893) scale(0.1,-0.1)" stroke="none">
                    <path fill="white" d="M3 5928 c3 -2696 5 -3004 19 -3103 59 -398 227 -870 439 -1232 311-531 745-941 1290-1218 630-321 1311-437 1969-335 567 87 1062 296 1489 628 616 480 1094 1176 1241 1808 19 81 50 291 50 340 l0 24 -747 0 -748 0 -40 -128 c-48 -155 -151 -364 -240 -487 -413 -574 -1135 -853 -1849 -715 -542 105 -1032 473 -1276 960 -330 658 -222 1459 272 2017 153 173 296 278 543 398 206 101 405 165 511 165 l34 0 0 750 c0 739 0 750 -20 750 -44 0 -254 -33 -385 -61 -413 -87 -714 -209 -1052 -426 l-83 -53 0 1455 0 1455 -710 0 -711 0 4 -2992z" />
                    <path fill="#f1364fff" d="M3335 6528 c-4 -230 -3 -392 4 -466 17 -182 16 -182 251 -181 179 0 273 -11 430 -51 439 -112 855 -359 1191 -707 426 -442 671 -993 705 -1584 l7 -116 -134 24 c-74 13 -174 32 -224 41 l-90 17 -13 70 c-7 39 -24 124 -38 190 -128 600 -485 1104 -993 1403 -197 115 -398 190 -726 267 -279 66 -318 60 -352 -54 -14 -48 -17 -111 -17 -421 -1 -381 3 -420 42 -435 10 -3 69 -11 132 -16 323 -28 520 -115 710 -315 84 -88 148 -181 208 -299 48 -98 108 -253 99 -261 -10 -10 -270 15 -472 46 -104 15 -219 31 -255 35 -123 11 -205 27 -365 68 -138 36 -174 42 -265 42 -92 0 -112 -4 -160 -26 -270 -127 -373 -409 -245 -674 62 -127 156 -212 286 -255 54 -18 80 -21 164 -18 86 4 112 9 185 40 47 20 108 41 135 47 28 6 680 90 1450 187 1186 149 1434 177 1620 185 242 11 251 14 290 80 29 49 27 258 -3 421 -47 249 -184 704 -297 979 -276 676 -807 1249 -1520 1642 -484 267 -1148 447 -1646 447 l-87 0 -7 -352z m-23 -2998 l64 -20 24 -81 c23 -80 23 -83 7 -145 -28 -103 -32 -111 -68 -118 -235 -47 -384 25 -366 176 9 74 58 151 122 189 40 25 134 25 217 -1z" />
                  </g>
                </svg>

              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Técnicos de Suporte
                </h1>
                <p className="text-sm text-muted-foreground">
                  Contatos dos técnicos por região
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="shadow-md">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por nome, telefone ou função..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-base border-2 shadow-lg rounded-xl focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={selectedTipo} onValueChange={setSelectedTipo} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex h-auto">
            <TabsTrigger value="Todos" className="text-sm">Todos</TabsTrigger>
            {Object.keys(tecnicosPorTipo)
              .filter(tipo => tecnicosPorTipo[tipo].length > 0 || TIPOS_TECNICO.includes(tipo as any))
              .sort()
              .map((tipo) => (
                <TabsTrigger key={tipo} value={tipo} className="text-sm">
                  {tipo}
                </TabsTrigger>
              ))}
          </TabsList>

          {/* Conteúdo para "Todos" e Tipos Específicos */}
          <div className="space-y-8">
            {selectedTipo === 'Todos' ? (
              // Mostrar todos os agrupamentos
              Object.keys(tecnicosPorTipo).map((tipo) => {
                const tecnicosDoTipo = tecnicosPorTipo[tipo];
                if (!tecnicosDoTipo || tecnicosDoTipo.length === 0) return null;
                return (
                  <div key={tipo} className="space-y-4">
                    {/* ... (código existente para "Todos" mantido na estrutura se fosse fazer replace igual) */}
                    {/* REUTILIZANDO A LOGICA DE EXIBICAO ABAIXO PARA EVITAR DUPLICACAO COMPLEXA NESTE REPLACE */}
                    {/* Na verdade, o replace anterior tinha uma lógica duplicada para 'Todos'. Vamos simplificar. */}
                  </div>
                );
              })
            ) : null}

            {/* Como o replace é difícil com lógica condicional complexa aninhada, vou focar em substituir a lógica de renderização
                dentro do map principal ou criar um componente reutilizável se pudesse.
                Mas aqui vou substituir o bloco return principal loopando pelos tabs contents
            */}
          </div>

          {/* Renderizando TabsContent para TODOS os tipos disponíveis (incluindo "Todos" se quiséssemos customizar, mas o componente Tabs cuida disso) */}
          {/* Para simplificar a edição e manter a consistência, vou recriar o bloco de TabsContent */}

          <TabsContent value="Todos" className="space-y-8">
            {Object.keys(tecnicosPorTipo).sort().map((tipo) => {
              const tecnicosDoTipo = tecnicosPorTipo[tipo];
              // Filtrar apenas técnicos operacionais (remover supervisores e coordenadores da visão geral "Todos")
              const apenasTecnicos = tecnicosDoTipo.filter(t => !t.supervisor && !t.coordenador);

              if (!apenasTecnicos || apenasTecnicos.length === 0) return null;

              return (
                <div key={tipo} className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Badge className={`${getTipoBadgeColor(tipo)} text-white text-base px-4 py-1.5`}>
                      {tipo}
                    </Badge>
                    <span className="text-muted-foreground text-lg font-normal">
                      {apenasTecnicos.length} {apenasTecnicos.length === 1 ? 'técnico' : 'técnicos'}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {apenasTecnicos.map(tecnico => (
                      <Card key={`${tecnico.id}-${tipo}`} className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{tecnico.nome}</CardTitle>
                          <CardDescription className="text-xs">{tecnico.descricao}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <Phone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span className="font-mono text-xs font-semibold truncate">{tecnico.telefone}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(tecnico.telefone, 'Telefone')}
                                className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 shrink-0"
                                title="Copiar telefone"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {Object.keys(tecnicosPorTipo).map((tipo) => {
            const tecnicosDoTipo = tecnicosPorTipo[tipo] || [];

            // Separar Gestão (Supervisores e Coordenadores) do resto
            // USANDO OS CAMPOS CORRETOS AGORA
            const gestao = tecnicosDoTipo.filter(t => t.supervisor || t.coordenador);
            const equipe = tecnicosDoTipo.filter(t => !t.supervisor && !t.coordenador);

            return (
              <TabsContent key={tipo} value={tipo} className="space-y-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Badge className={`${getTipoBadgeColor(tipo)} text-white text-base px-4 py-1.5`}>
                      {tipo}
                    </Badge>
                    <span className="text-muted-foreground text-lg font-normal">
                      {tecnicosDoTipo.length} {tecnicosDoTipo.length === 1 ? 'contato' : 'contatos'}
                    </span>
                  </h2>
                </div>

                {tecnicosDoTipo.length === 0 ? (
                  <Card className="border shadow-xl p-12">
                    <div className="text-center">
                      <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-xl font-semibold text-foreground mb-2">Nenhum técnico encontrado aqui</p>
                      <p className="text-sm text-muted-foreground">
                        Tente buscar com outros termos ou selecione outro tipo
                      </p>
                    </div>
                  </Card>
                ) : (
                  <>
                    {/* SEÇÃO DE GESTÃO - Liderança Primeiro */}
                    {gestao.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                          <div className="h-4 w-1 bg-purple-500 rounded-full"></div>
                          Supervisão e Coordenação
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {gestao.map((tecnico) => (
                            <Card key={`${tecnico.id}-gestao`} className="border-2 border-purple-100 dark:border-purple-900/30 shadow-lg hover:shadow-xl transition-all bg-purple-50/10 dark:bg-purple-900/10">
                              <CardHeader className="pb-2">
                                <Badge variant="outline" className="w-fit mb-2 border-purple-200 text-purple-700 dark:text-purple-300">
                                  {tecnico.coordenador ? 'Coordenador' : 'Supervisor'}
                                </Badge>
                                <CardTitle className="text-lg font-bold">{tecnico.nome}</CardTitle>
                                <CardDescription className="text-sm font-medium text-purple-600/80 dark:text-purple-400">
                                  {tecnico.descricao}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 dark:bg-black/20 border border-purple-200/30">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                    <span className="font-mono text-sm font-bold truncate">{tecnico.telefone}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(tecnico.telefone, 'Telefone')}
                                    className="h-7 w-7 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30 shrink-0"
                                    title="Copiar telefone"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SEÇÃO DA EQUIPE TÉCNICA */}
                    {equipe.length > 0 && (
                      <div>
                        {gestao.length > 0 && (
                          <h3 className="text-lg font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                            <div className="h-4 w-1 bg-blue-500 rounded-full"></div>
                            Equipe Técnica
                          </h3>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                          {equipe.map((tecnico) => (
                            <Card key={tecnico.id} className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold">{tecnico.nome}</CardTitle>
                                <CardDescription className="text-sm">{tecnico.descricao}</CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span className="font-mono text-sm font-semibold truncate">{tecnico.telefone}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(tecnico.telefone, 'Telefone')}
                                    className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 shrink-0"
                                    title="Copiar telefone"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
}

