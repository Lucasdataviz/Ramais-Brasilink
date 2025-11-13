import { useState, useMemo, useEffect } from 'react';
import { useRealtimeExtensions } from '@/hooks/useRealtimeData';
import { ExtensionCard } from '@/components/ExtensionCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Lock, ExternalLink, Building2, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getDepartamentosFromRamais } from '@/lib/supabase';
import { Departamento } from '@/lib/types';

const Index = () => {
  const { extensions, loading } = useRealtimeExtensions();
  const [search, setSearch] = useState('');
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [departamentosLoading, setDepartamentosLoading] = useState(true);

  useEffect(() => {
    loadDepartamentos();
  }, []);

  const loadDepartamentos = async () => {
    try {
      setDepartamentosLoading(true);
      const data = await getDepartamentosFromRamais();
      setDepartamentos(data);
    } catch (error) {
      console.error('Error loading departamentos:', error);
    } finally {
      setDepartamentosLoading(false);
    }
  };

  const filteredExtensions = useMemo(() => {
    if (!search) return extensions;
    const searchLower = search.toLowerCase();
    return extensions.filter((ext) => (
      ext.name.toLowerCase().includes(searchLower) ||
      ext.number.includes(searchLower) ||
      (ext.department && ext.department.toLowerCase().includes(searchLower))
    ));
  }, [extensions, search]);

  // Agrupar departamentos por hierarquia (pais e filhos)
  const departamentosHierarquicos = useMemo(() => {
    const pais = departamentos.filter(d => !d.departamento_pai && d.ativo);
    return pais.map(pai => ({
      ...pai,
      filhos: departamentos.filter(d => d.departamento_pai === pai.id && d.ativo),
    })).filter(pai => pai.filhos.length > 0); // Apenas pais que têm filhos
  }, [departamentos]);

  // Agrupar extensões por departamento
  const groupedByDepartment = useMemo(() => {
    const departments = new Set(extensions.map(ext => ext.department).filter(Boolean));
    return Array.from(departments).map((dept) => {
      const deptInfo = departamentos.find(d => d.id === dept || d.nome === dept);
      return {
        department: dept,
        departmentInfo: deptInfo,
        extensions: filteredExtensions.filter((ext) => ext.department === dept),
      };
    }).sort((a, b) => {
      const ordemA = a.departmentInfo?.ordem || 999;
      const ordemB = b.departmentInfo?.ordem || 999;
      return ordemA - ordemB;
    });
  }, [filteredExtensions, extensions, departamentos]);

  const getGradient = (dept: Departamento | undefined) => {
    if (dept?.cor) {
      // Converter cor hex para gradiente
      return `from-[${dept.cor}] to-[${dept.cor}] opacity-80`;
    }
    return 'from-gray-500 to-gray-600';
  };

  const getBackgroundColor = (dept: Departamento | undefined) => {
    if (dept?.cor) {
      return dept.cor;
    }
    return '#6b7280';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header Premium */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Logo SVG da Brasilink */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 693 893"
                  className="h-7 w-7 fill-white"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <g transform="translate(0,893) scale(0.1,-0.1)" fill="currentColor" stroke="none">
                    <path  fill="white" d="M3 5928 c3 -2696 5 -3004 19 -3103 59 -398 227 -870 439 -1232 311-531 745 -941 1290 -1218 630 -321 1311 -437 1969 -335 567 87 1062 296 1489 628 616 480 1094 1176 1241 1808 19 81 50 291 50 340 l0 24 -747 0 -748 0 -40 -128 c-48 -155 -151 -364 -240 -487 -413 -574 -1135 -853 -1849 -715 -542 105 -1032 473 -1276 960 -330 658 -222 1459 272 2017 153 173 296 278 543 398 206 101 405 165 511 165 l34 0 0 750 c0 739 0 750 -20 750 -44 0 -254 -33 -385 -61 -413 -87 -714 -209 -1052 -426 l-83 -53 0 1455 0 1455 -710 0 -711 0 4 -2992z"/>
                    <path fill="#f1364fff"d="M3335 6528 c-4 -230 -3 -392 4 -466 17 -182 16 -182 251 -181 179 0 273 -11 430 -51 439 -112 855 -359 1191 -707 426 -442 671 -993 705 -1584 l7 -116 -134 24 c-74 13 -174 32 -224 41 l-90 17 -13 70 c-7 39 -24 124 -38 190 -128 600 -485 1104 -993 1403 -197 115 -398 190 -726 267 -279 66 -318 60 -352 -54 -14 -48 -17 -111 -17 -421 -1 -381 3 -420 42 -435 10 -3 69 -11 132 -16 323 -28 520 -115 710 -315 84 -88 148 -181 208 -299 48 -98 108 -253 99 -261 -10 -10 -270 15 -472 46 -104 15 -219 31 -255 35 -123 11 -205 27 -365 68 -138 36 -174 42 -265 42 -92 0 -112 -4 -160 -26 -270 -127 -373 -409 -245 -674 62 -127 156 -212 286 -255 54 -18 80 -21 164 -18 86 4 112 9 185 40 47 20 108 41 135 47 28 6 680 90 1450 187 1186 149 1434 177 1620 185 242 11 251 14 290 80 29 49 27 258 -3 421 -47 249 -184 704 -297 979 -276 676 -807 1249 -1520 1642 -484 267 -1148 447 -1646 447 l-87 0 -7 -352z m-23 -2998 l64 -20 24 -81 c23 -80 23 -83 7 -145 -28 -103 -32 -111 -68 -118 -235 -47 -384 25 -366 176 9 74 58 151 122 189 40 25 134 25 217 -1z"/>
                  </g>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ramais Brasilink
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="shadow-md">
                <Link to="/tecnicos" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Técnicos
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="shadow-md">
                <a 
                  href="https://agente.npx.app.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Beatrix
                </a>
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                <Link to="/admin/login" title="Admin">
                  <Lock className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou ramal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-base border-2 shadow-lg rounded-xl focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading || departamentosLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
            <p className="text-muted-foreground mt-4">Carregando ramais...</p>
          </div>
        ) : (
          <>
            {/* Cards de Supervisores (departamentos filhos) */}
            {departamentosHierarquicos.length > 0 && (
              <div className="mb-8">
                {departamentosHierarquicos.map((pai) => {
                  if (pai.filhos.length === 0) return null;
                  
                  return (
                    <div key={pai.id} className="mb-6">
                      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Building2 className="h-6 w-6" style={{ color: pai.cor }} />
                        {pai.icone} {pai.nome}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {pai.filhos.map((filho) => {
                          // Buscar ramais que pertencem a este departamento filho
                          const ramaisFilho = extensions.filter(ext => {
                            // Verificar se o department é o ID ou nome do departamento
                            return ext.department === filho.id || 
                                   ext.department === filho.nome ||
                                   (typeof ext.department === 'string' && ext.department.includes(filho.nome));
                          });
                          
                          return (
                            <Card 
                              key={filho.id} 
                              className="border-2 shadow-lg hover:shadow-xl transition-shadow"
                              style={{ borderLeftColor: filho.cor, borderLeftWidth: '4px' }}
                            >
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                  <div 
                                    className="w-4 h-4 rounded-full shrink-0"
                                    style={{ backgroundColor: filho.cor }}
                                  ></div>
                                  <span className="truncate">{filho.icone} {filho.nome}</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {ramaisFilho.length} {ramaisFilho.length === 1 ? 'ramal' : 'ramais'}
                                </p>
                                {ramaisFilho.length > 0 ? (
                                  <div className="mt-4 space-y-2">
                                    {ramaisFilho.slice(0, 4).map((ext) => (
                                      <div key={ext.id} className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium text-sm truncate flex-1">{ext.name}</span>
                                          <span className="font-mono text-sm font-bold ml-2">{ext.number.slice(-4)}</span>
                                        </div>
                                      </div>
                                    ))}
                                    {ramaisFilho.length > 4 && (
                                      <p className="text-xs text-muted-foreground text-center mt-2">
                                        +{ramaisFilho.length - 4} mais
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground text-center py-4">
                                    Nenhum ramal associado
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Departamentos principais (sem pai) */}
            {filteredExtensions.length === 0 && search ? (
              <Card className="border shadow-xl p-12">
                <div className="text-center">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-semibold text-foreground mb-2">Nenhum ramal encontrado</p>
                  <p className="text-sm text-muted-foreground">
                    Tente buscar com outros termos
                  </p>
                </div>
              </Card>
            ) : filteredExtensions.length === 0 && !search ? (
              <Card className="border shadow-xl p-12">
                <div className="text-center">
                  <svg 
                   xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 703 909"
                   className="h-7 w-7 fill-white"
                   preserveAspectRatio="xMidYMid meet"
                  >
                    <g transform="translate(0,909) scale(0.1,-0.1)">
                      <path d="M3410 6531 l0 -482 23 -23 c21 -20 37 -23 197 -34 323 -23 561 -80 850 -204 563 -241 1061 -731 1311 -1289 107 -238 155 -400 194 -653 14 -87 34 -179 45 -204 11 -24 23 -69 26 -97 4 -29 9 -57 13 -62 7 -11 928 -99 937 -90 10 9 -25 557 -42 682 -56 399 -295 974 -572 1380 -633 927 -1673 1497 -2829 1551 l-153 7 0 -482z"/>
                      <path d="M3410 5073 l0 -470 113 -6 c328 -19 536 -99 713 -272 117 -115 281 -362 384 -577 22 -47 48 -89 57 -93 9 -3 64 -10 122 -15 59 -6 249 -29 423 -52 175 -23 320 -39 322 -37 9 9 -25 321 -45 414 -58 272 -190 545 -376 775 -86 106 -262 274 -373 357 -359 266 -785 421 -1207 440 l-133 6 0 -470z"/>
                    </g>
                  </svg>
                  <p className="text-xl font-semibold text-foreground mb-2">Nenhum ramal cadastrado</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione ramais através do painel administrativo
                  </p>
                </div>
              </Card>
            ) : (
              <Accordion type="multiple" className="w-full space-y-4">
                {groupedByDepartment.map(
                  ({ department, departmentInfo, extensions: deptExtensions }) =>
                    deptExtensions.length > 0 && !departmentInfo?.departamento_pai && (
                      <AccordionItem 
                        key={department} 
                        value={department} 
                        className="border-0 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-900"
                      >
                        <AccordionTrigger className="hover:no-underline px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-4 flex-1">
                            <div 
                              className="w-1.5 h-12 rounded-full"
                              style={{ backgroundColor: getBackgroundColor(departmentInfo) }}
                            ></div>
                            <div className="flex-1 text-left">
                              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                {departmentInfo?.icone} {department || departmentInfo?.nome || department}
                              </h2>
                              <p className="text-sm text-muted-foreground mt-1">
                                {deptExtensions.length} {deptExtensions.length === 1 ? 'ramal' : 'ramais'}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-gray-50 dark:bg-gray-800/50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                            {deptExtensions.map((ext) => (
                              <ExtensionCard key={ext.id} extension={ext} showShortNumber={true} />
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                )}
              </Accordion>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;