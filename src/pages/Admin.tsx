import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/storage';
import { AdminUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExtensionsManager } from '@/components/admin/ExtensionsManager';
import { QueuesManager } from '@/components/admin/QueuesManager';
import { AuditLogsViewer } from '@/components/admin/AuditLogsViewer';
import { LogOut } from 'lucide-react';
import { logout } from '@/lib/storage';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/admin/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-sm text-muted-foreground">
                Bem-vindo, {user.full_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="extensions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="extensions">Ramais</TabsTrigger>
            <TabsTrigger value="queues">Filas</TabsTrigger>
            <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
          </TabsList>

          <TabsContent value="extensions">
            <ExtensionsManager />
          </TabsContent>

          <TabsContent value="queues">
            <QueuesManager />
          </TabsContent>

          <TabsContent value="logs">
            <AuditLogsViewer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
