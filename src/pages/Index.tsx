import { useState, useMemo, useEffect } from 'react';
import { useRealtimeExtensions } from '@/hooks/useRealtimeData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ChevronDown, Users, UserCog, Star, X, ChevronUp, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExtensionCard } from '@/components/ExtensionCard';
import { NewsTicker } from '@/components/NewsTicker';
import { getDepartamentosFromRamais, getAllDepartamentos, supabase } from '@/lib/supabase';
import { Departamento } from '@/lib/types';
import { Header } from '@/components/dashboard/Header';
import { SupervisorsCard } from '@/components/dashboard/SupervisorsCard';
import { QueuesCard } from '@/components/dashboard/QueuesCard';
import { DepartmentSection } from '@/components/dashboard/DepartmentSection';
import { Footer } from '@/components/dashboard/Footer';

import { DepartmentCard } from '@/components/dashboard/DepartmentCard';
import { getIconComponent } from '@/lib/icons';




const Index = () => {
  const { extensions, loading } = useRealtimeExtensions();
  const [search, setSearch] = useState('');
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [departamentosLoading, setDepartamentosLoading] = useState(true);
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);
  const [showSupervisors, setShowSupervisors] = useState(false);
  const [showQueues, setShowQueues] = useState(false);

  const supervisores = extensions.filter(ext => ext.metadata?.supervisor === true);
  const coordenadores = extensions.filter(ext => ext.metadata?.coordenador === true);

  useEffect(() => {
    loadDepartamentos();

    const channel = supabase
      .channel('departamentos-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'departamentos',
        },
        () => {
          loadDepartamentos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Reload departments when extensions change to catch new dynamic departments
  useEffect(() => {
    loadDepartamentos();
  }, [extensions.length]); // Only reload if count changes to avoid simple loops, or just [extensions]


  const loadDepartamentos = async () => {
    try {
      setDepartamentosLoading(true);
      try {
        const data = await getAllDepartamentos();
        setDepartamentos(data);
      } catch (error) {
        const data = await getDepartamentosFromRamais();
        setDepartamentos(data);
      }
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

  const departamentosHierarquicos = useMemo(() => {
    const pais = departamentos.filter(d => !d.departamento_pai && d.ativo);
    return pais.map(pai => ({
      ...pai,
      filhos: departamentos.filter(d => d.departamento_pai === pai.id && d.ativo),
    })).filter(pai => pai.filhos.length > 0);
  }, [departamentos]);

  const groupedByDepartment = useMemo(() => {
    const departments = new Set(extensions.map(ext => ext.department).filter(Boolean));
    return Array.from(departments)
      .map((dept) => {
        const deptInfo = departamentos.find(d => (d.id === dept || d.nome === dept) && d.ativo);
        if (!deptInfo) return null;
        return {
          department: dept,
          departmentInfo: deptInfo,
          extensions: filteredExtensions.filter((ext) => ext.department === dept),
        };
      })
      .filter((dept) => dept !== null)
      .sort((a, b) => {
        const ordemA = a?.departmentInfo?.ordem || 999;
        const ordemB = b?.departmentInfo?.ordem || 999;
        return ordemA - ordemB;
      }) as Array<{ department: string; departmentInfo: Departamento; extensions: typeof filteredExtensions }>;
  }, [filteredExtensions, extensions, departamentos]);

  const toggleDepartment = (departmentId: string) => {
    const isClosing = expandedDepartment === departmentId;
    setExpandedDepartment((prev) => (prev === departmentId ? null : departmentId));

    if (isClosing) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col min-h-screen">
        <Header
          search={search}
          setSearch={setSearch}
          supervisorCount={supervisores.length}
          coordenadorCount={coordenadores.length}
          onSupervisoresClick={() => setShowSupervisors(v => !v)}
          onQueuesClick={() => setShowQueues(v => !v)}
          showQueues={showQueues}
        />
        <NewsTicker />

        <main className="w-full max-w-[2000px] mx-auto px-4 md:px-8 py-6 relative flex-1">

        {loading || departamentosLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-[3px] border-muted" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">Carregando ramais...</p>
              <p className="text-sm text-muted-foreground mt-1">Aguarde um momento</p>
            </div>
          </div>
        ) : (
          <>
            {showQueues && (
              <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
                <QueuesCard />
              </div>
            )}

            {showSupervisors && (
              <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
                <SupervisorsCard extensions={filteredExtensions} />
              </div>
            )}

            {/* Hierarchical Departments Logic */}
            {departamentosHierarquicos.length > 0 && (
              <div className="mb-8">
                {departamentosHierarquicos.map((pai) => {
                  if (pai.filhos.length === 0) return null;

                  return (
                    <div key={pai.id} className="mb-6">
                      <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2.5 text-foreground">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${pai.cor}14`, color: pai.cor }}
                        >
                          {(() => {
                            const IconComp = getIconComponent(pai.icone) || Building2;
                            const Icon = IconComp as any;
                            return <Icon className="h-4 w-4" />;
                          })()}
                        </div>
                        {pai.nome}
                      </h2>
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                        {pai.filhos.map((filho) => {
                          const ramaisFilho = extensions.filter(ext => {
                            return ext.department === filho.id ||
                              ext.department === filho.nome ||
                              (typeof ext.department === 'string' && ext.department.includes(filho.nome));
                          });

                          const isExpanded = expandedDepartment === filho.id;
                          return (
                            <div key={filho.id} className={isExpanded ? 'col-span-full' : 'col-span-1'}>
                              <DepartmentCard 
                                id={filho.id}
                                nome={filho.nome}
                                icone={filho.icone}
                                cor={filho.cor}
                                extensionsCount={ramaisFilho.length}
                                isExpanded={isExpanded}
                                onClick={toggleDepartment}
                              />

                              {isExpanded && (
                                <div className="mt-2 animate-in slide-in-from-top-3 duration-300 fade-in">
                                  <div className="relative rounded-2xl overflow-hidden glass-card" style={{ borderTop: `4px solid ${filho.cor || '#f1364f'}` }}>
                                    <div className="flex items-start justify-between px-6 py-5 bg-muted/40">
                                      <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${filho.cor}14`, color: filho.cor }}>
                                          {(() => {
                                            const IconComp = getIconComponent(filho.icone) || Building2;
                                            const Icon = IconComp as any;
                                            return <Icon className="h-6 w-6" />;
                                          })()}
                                        </div>
                                        <div>
                                          <h2 className="font-display text-lg font-semibold text-foreground">{filho.nome}</h2>
                                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                                            <Users className="h-3 w-3" />
                                            {ramaisFilho.length} {ramaisFilho.length === 1 ? 'ramal' : 'ramais'}
                                          </span>
                                        </div>
                                      </div>
                                      <Button variant="ghost" size="icon" onClick={() => toggleDepartment(filho.id)} className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                                        <X className="h-5 w-5" />
                                      </Button>
                                    </div>
                                    <div className="p-6 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 border-t border-border/60">
                                      {ramaisFilho.map((ext) => (
                                        <ExtensionCard key={ext.id} extension={ext} showShortNumber={true} />
                                      ))}
                                    </div>
                                    <div className="px-6 py-3 flex justify-center border-t border-border/60">
                                      <Button variant="ghost" size="sm" onClick={() => toggleDepartment(filho.id)} className="text-xs text-muted-foreground gap-1.5 uppercase tracking-widest font-semibold">
                                        <ChevronUp className="h-4 w-4" /> Recolher
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredExtensions.length === 0 && search ? (
              <div className="glass-card rounded-2xl p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                  <Search className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-xl font-bold text-foreground mb-2">Nenhum ramal encontrado</p>
                <p className="text-sm text-muted-foreground">Tente buscar com outros termos</p>
              </div>
            ) : filteredExtensions.length === 0 && !search ? (
              <div className="glass-card rounded-2xl p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-xl font-bold text-foreground mb-2">Nenhum ramal cadastrado</p>
                <p className="text-sm text-muted-foreground">Adicione ramais através do painel administrativo</p>
              </div>
            ) : (
              <DepartmentSection
                groupedDepartments={groupedByDepartment}
                expandedDepartment={expandedDepartment}
                toggleDepartment={toggleDepartment}
                filteredExtensions={filteredExtensions}
              />
            )}
          </>
        )}
      </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;