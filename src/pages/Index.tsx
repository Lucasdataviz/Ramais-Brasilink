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
import { Footer } from '@/components/dashboard/Footer';
import { CulturaSidebar } from '@/components/dashboard/CulturaSidebar';
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
  const [showSupervisors, setShowSupervisors] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Fixed sidebar always visible */}
      <CulturaSidebar />

      {/* Main content shifted right */}
      <div className="ml-[300px] flex flex-col min-h-screen">
        <Header
          search={search}
          setSearch={setSearch}
          supervisorCount={supervisores.length}
          coordenadorCount={coordenadores.length}
          onSupervisoresClick={() => setShowSupervisors(v => !v)}
        />
        <NewsTicker />

        <main className="w-full px-4 py-6 relative flex-1">

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
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-blue-950" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
              <div className="absolute inset-2 w-12 h-12 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">Carregando ramais...</p>
              <p className="text-sm text-muted-foreground mt-1">Aguarde um momento</p>
            </div>
          </div>
        ) : (
          <>
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
                      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <div style={{ color: pai.cor }}>
                          {getIconComponent(pai.icone)}
                        </div>
                        {pai.nome}
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {pai.filhos.map((filho) => {
                          const ramaisFilho = extensions.filter(ext => {
                            return ext.department === filho.id ||
                              ext.department === filho.nome ||
                              (typeof ext.department === 'string' && ext.department.includes(filho.nome));
                          });

                          return (
                            <div
                              key={filho.id}
                              className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3 cursor-default hover:-translate-y-1 transition-all duration-300"
                              style={{ borderTop: `3px solid ${filho.cor || '#6366f1'}` }}
                            >
                              <div
                                className="p-3 rounded-xl"
                                style={{ backgroundColor: `${filho.cor || '#6366f1'}18`, color: filho.cor || '#6366f1' }}
                              >
                                {getIconComponent(filho.icone)}
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-sm text-foreground leading-tight">{filho.nome}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  <span style={{ color: filho.cor || '#6366f1' }}>⬤</span>{' '}
                                  {ramaisFilho.length} {ramaisFilho.length === 1 ? 'ramal' : 'ramais'}
                                </p>
                              </div>
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