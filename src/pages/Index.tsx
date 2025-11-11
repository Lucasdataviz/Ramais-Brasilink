import { useState, useMemo } from 'react';
import { useRealtimeExtensions } from '@/hooks/useRealtimeData';
import { ExtensionCard } from '@/components/ExtensionCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Phone, Search, Lock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const { extensions, loading } = useRealtimeExtensions();
  const [search, setSearch] = useState('');

  const filteredExtensions = useMemo(() => {
    if (!search) return extensions;
    const searchLower = search.toLowerCase();
    return extensions.filter((ext) => (
      ext.name.toLowerCase().includes(searchLower) ||
      ext.number.includes(searchLower) ||
      ext.department.toLowerCase().includes(searchLower)
    ));
  }, [extensions, search]);

  const groupedByDepartment = useMemo(() => {
    const departments = new Set(extensions.map(ext => ext.department));
    return Array.from(departments).map((dept) => ({
      department: dept,
      extensions: filteredExtensions.filter((ext) => ext.department === dept),
    })).sort((a, b) => a.department.localeCompare(b.department));
  }, [filteredExtensions, extensions]);

  const departmentColors: Record<string, string> = {
    'Administrativo': 'from-blue-500 to-blue-600',
    'Ouvidoria': 'from-green-500 to-green-600',
    'Cobrança': 'from-orange-500 to-orange-600',
    'Helpdesk': 'from-purple-500 to-purple-600',
    'Upcall': 'from-pink-500 to-pink-600',
    'Financeiro': 'from-emerald-500 to-emerald-600',
    'TI': 'from-red-500 to-red-600',
    'Suporte': 'from-indigo-500 to-indigo-600',
    'Vendas': 'from-yellow-500 to-yellow-600',
  };

  const getGradient = (dept: string) => {
    return departmentColors[dept] || 'from-gray-500 to-gray-600';
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
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
            <p className="text-muted-foreground mt-4">Carregando ramais...</p>
          </div>
        ) : (
          <>
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
                  ({ department, extensions: deptExtensions }) =>
                    deptExtensions.length > 0 && (
                      <AccordionItem 
                        key={department} 
                        value={department} 
                        className="border-0 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-900"
                      >
                        <AccordionTrigger className="hover:no-underline px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-1.5 h-12 rounded-full bg-gradient-to-b ${getGradient(department)}`}></div>
                            <div className="flex-1 text-left">
                              <h2 className="text-xl font-bold text-foreground">{department}</h2>
                              <p className="text-sm text-muted-foreground mt-1">
                                {deptExtensions.length} {deptExtensions.length === 1 ? 'ramal' : 'ramais'}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-gray-50 dark:bg-gray-800/50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                            {deptExtensions.map((ext) => (
                              <ExtensionCard key={ext.id} extension={ext} />
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