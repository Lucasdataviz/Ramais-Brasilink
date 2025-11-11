import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '@/lib/storage';
import { AdminUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RamaisManager } from '@/components/admin/RamaisManager';
import { AuditLogsViewer } from '@/components/admin/AuditLogsViewer';
import { StatsCards } from '@/components/admin/StatsCards';
import { UsersManager } from '@/components/admin/UsersManager';
import { LogOut, Home, Settings, Phone, FileText, UserCircle } from 'lucide-react';
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
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Painel Administrativo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo, <span className="font-semibold">{user.full_name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <StatsCards />
        </div>

        <Tabs defaultValue="ramais" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="ramais" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Ramais
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ramais" className="space-y-4">
            <RamaisManager />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UsersManager />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card className="border">
              <CardHeader>
                <CardTitle>Logs de Auditoria</CardTitle>
                <CardDescription>
                  Visualize todas as ações realizadas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuditLogsViewer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}