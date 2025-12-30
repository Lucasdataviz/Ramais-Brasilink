import { useState, useMemo, useEffect } from 'react';
import { useRealtimeExtensions } from '@/hooks/useRealtimeData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { NewsTicker } from '@/components/NewsTicker';
import { getDepartamentosFromRamais, getAllDepartamentos, supabase } from '@/lib/supabase';
import { Departamento } from '@/lib/types';
import { Header } from '@/components/dashboard/Header';
import { SupervisorsCard } from '@/components/dashboard/SupervisorsCard';
import { DepartmentSection } from '@/components/dashboard/DepartmentSection';
import { getIconComponent as getIcon } from '@/lib/icons';
import { Building2 } from 'lucide-react';

const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return <Building2 className="h-5 w-5" />;
  const IconComponent = getIcon(iconName);
  if (typeof IconComponent === 'function' || typeof IconComponent === 'object') {
    const Icon = IconComponent as any;
    return <Icon className="h-5 w-5" />;
  }
  return <Building2 className="h-5 w-5" />;
};

const Index = () => {
  const { extensions, loading } = useRealtimeExtensions();
  const [search, setSearch] = useState('');
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [departamentosLoading, setDepartamentosLoading] = useState(true);
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">
      <NewsTicker />

      <Header search={search} setSearch={setSearch} />

      <main className="container mx-auto px-4 py-8 relative">
        <div
          className="fixed inset-0 opacity-[0.02] dark:opacity-[0.03] blur-sm pointer-events-none -z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 693 893'%3E%3Cg transform='translate(0,893) scale(0.1,-0.1)' fill='%23000000'%3E%3Cpath d='M3 5928 c3 -2696 5 -3004 19 -3103 59 -398 227 -870 439 -1232 311-531 745 -941 1290 -1218 630 -321 1311 -437 1969 -335 567 87 1062 296 1489 628 616 480 1094 1176 1241 1808 19 81 50 291 50 340 l0 24 -747 0 -748 0 -40 -128 c-48 -155 -151 -364 -240 -487 -413 -574 -1135 -853 -1849 -715 -542 105 -1032 473 -1276 960 -330 658 -222 1459 272 2017 153 173 296 278 543 398 206 101 405 165 511 165 l34 0 0 750 c0 739 0 750 -20 750 -44 0 -254 -33 -385 -61 -413 -87 -714 -209 -1052 -426 l-83 -53 0 1455 0 1455 -710 0 -711 0 4 -2992z'/%3E%3Cpath d='M3335 6528 c-4 -230 -3 -392 4 -466 17 -182 16 -182 251 -181 179 0 273 -11 430 -51 439 -112 855 -359 1191 -707 426 -442 671 -993 705 -1584 l7 -116 -134 24 c-74 13 -174 32 -224 41 l-90 17 -13 70 c-7 39 -24 124 -38 190 -128 600 -485 1104 -993 1403 -197 115 -398 190 -726 267 -279 66 -318 60 -352 -54 -14 -48 -17 -111 -17 -421 -1 -381 3 -420 42 -435 10 -3 69 -11 132 -16 323 -28 520 -115 710 -315 84 -88 148 -181 208 -299 48 -98 108 -253 99 -261 -10 -10 -270 15 -472 46 -104 15 -219 31 -255 35 -123 11 -205 27 -365 68 -138 36 -174 42 -265 42 -92 0 -112 -4 -160 -26 -270 -127 -373 -409 -245 -674 62 -127 156 -212 286 -255 54 -18 80 -21 164 -18 86 4 112 9 185 40 47 20 108 41 135 47 28 6 680 90 1450 187 1186 149 1434 177 1620 185 242 11 251 14 290 80 29 49 27 258 -3 421 -47 249 -184 704 -297 979 -276 676 -807 1249 -1520 1642 -484 267 -1148 447 -1646 447 l-87 0 -7 -352z m-23 -2998 l64 -20 24 -81 c23 -80 23 -83 7 -145 -28 -103 -32 -111 -68 -118 -235 -47 -384 25 -366 176 9 74 58 151 122 189 40 25 134 25 217 -1z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '300px 300px',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
          }}
        />

        {loading || departamentosLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
            <p className="text-muted-foreground mt-4">Carregando ramais...</p>
          </div>
        ) : (
          <>
            <SupervisorsCard extensions={filteredExtensions} />

            {/* Hierarchical Departments Logic */}
            {departamentosHierarquicos.length > 0 && (
              <div className="mb-8">
                {departamentosHierarquicos.map((pai) => {
                  if (pai.filhos.length === 0) return null;

                  return (
                    <div key={pai.id} className="mb-6">
                      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <div style={{ color: pai.cor }}>
                          {getIconComponent(pai.icone)}
                        </div>
                        {pai.nome}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {pai.filhos.map((filho) => {
                          const ramaisFilho = extensions.filter(ext => {
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
                                  <div style={{ color: filho.cor }}>
                                    {getIconComponent(filho.icone)}
                                  </div>
                                  <span className="truncate">{filho.nome}</span>
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
                  {/* Logo SVG Placeholder - Same as original */}
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-foreground mb-2">Nenhum ramal cadastrado</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione ramais através do painel administrativo
                  </p>
                </div>
              </Card>
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
    </div>
  );
};

export default Index;