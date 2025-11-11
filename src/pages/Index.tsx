import { useState, useMemo } from 'react';
import { useRealtimeExtensions } from '@/hooks/useRealtimeData';
import { ExtensionCard } from '@/components/ExtensionCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Phone, Search, Lock, ExternalLink, Building2 } from 'lucide-react';
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
    'Administrativo': '#3b82f6',
    'Ouvidoria': '#10b981',
    'Cobrança': '#f59e0b',
    'Helpdesk': '#8b5cf6',
    'Upcall': '#ec4899',
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Ramais Corporativos</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
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

          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou ramal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-3">Carregando ramais...</p>
          </div>
        ) : (
          <>
            {filteredExtensions.length === 0 && search ? (
              <Card className="border p-12">
                <div className="text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-lg font-semibold text-foreground mb-1">Nenhum ramal encontrado</p>
                  <p className="text-sm text-muted-foreground">
                    Tente buscar com outros termos
                  </p>
                </div>
              </Card>
            ) : filteredExtensions.length === 0 && !search ? (
              <Card className="border p-12">
                <div className="text-center">
                  <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-lg font-semibold text-foreground mb-1">Nenhum ramal cadastrado</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione ramais através do painel administrativo
                  </p>
                </div>
              </Card>
            ) : (
              <Accordion type="multiple" className="w-full space-y-3">
                {groupedByDepartment.map(
                  ({ department, extensions: deptExtensions }) =>
                    deptExtensions.length > 0 && (
                      <AccordionItem 
                        key={department} 
                        value={department} 
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className="w-1 h-8 rounded-full"
                              style={{ backgroundColor: departmentColors[department] || '#6b7280' }}
                            />
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold text-foreground">{department}</h2>
                                <span className="text-sm text-muted-foreground">
                                  ({deptExtensions.length} {deptExtensions.length === 1 ? 'ramal' : 'ramais'})
                                </span>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-2 pb-4">
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
