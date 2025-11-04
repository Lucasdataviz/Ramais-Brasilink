import { useState } from 'react';
import { useRealtimeExtensions, useRealtimeQueues } from '@/hooks/useRealtimeData';
import { ExtensionCard } from '@/components/ExtensionCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone, Search, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const { extensions, loading } = useRealtimeExtensions();
  const { queues } = useRealtimeQueues();
  const [search, setSearch] = useState('');

  const filteredExtensions = extensions.filter((ext) => {
    const searchLower = search.toLowerCase();
    return (
      ext.name.toLowerCase().includes(searchLower) ||
      ext.number.includes(searchLower) ||
      ext.department?.toLowerCase().includes(searchLower) ||
      queues.find((q) => q.id === ext.queue_id)?.name.toLowerCase().includes(searchLower)
    );
  });

  const groupedByQueue = queues.map((queue) => ({
    queue,
    extensions: filteredExtensions.filter((ext) => ext.queue_id === queue.id),
  }));

  const extensionsWithoutQueue = filteredExtensions.filter((ext) => !ext.queue_id);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Ramais Corporativos</h1>
                <p className="text-sm text-muted-foreground">
                  Consulta em tempo real • {extensions.length} ramais
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" asChild>
                <Link to="/admin/login">
                  <Lock className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, ramal, departamento ou fila..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 text-base"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center text-muted-foreground">Carregando ramais...</div>
        ) : (
          <div className="space-y-12">
            {groupedByQueue.map(
              ({ queue, extensions: queueExtensions }) =>
                queueExtensions.length > 0 && (
                  <section key={queue.id}>
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-1 h-8 rounded-full"
                        style={{ backgroundColor: queue.color }}
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{queue.name}</h2>
                        {queue.description && (
                          <p className="text-sm text-muted-foreground">{queue.description}</p>
                        )}
                      </div>
                      <span className="ml-auto text-sm text-muted-foreground">
                        {queueExtensions.length} ramai{queueExtensions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {queueExtensions.map((ext) => (
                        <ExtensionCard key={ext.id} extension={ext} queue={queue} />
                      ))}
                    </div>
                  </section>
                )
            )}

            {extensionsWithoutQueue.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">Outros Ramais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {extensionsWithoutQueue.map((ext) => (
                    <ExtensionCard key={ext.id} extension={ext} />
                  ))}
                </div>
              </section>
            )}

            {filteredExtensions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum ramal encontrado</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
