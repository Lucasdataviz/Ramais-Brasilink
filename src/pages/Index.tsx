import { useState, useMemo, useEffect } from 'react';
import { useRealtimeExtensions } from '@/hooks/useRealtimeData';
import { ExtensionCard } from '@/components/ExtensionCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Phone, Search, Lock, ExternalLink, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getDepartamentos } from '@/lib/supabase';
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
      const data = await getDepartamentos();
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
              <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg`}>
                <Phone className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ramais Corporativos
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                  <Phone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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