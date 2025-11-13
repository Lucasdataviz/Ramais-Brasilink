import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminUser, UserRole } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RamaisManager } from '@/components/admin/RamaisManager';
import { AuditLogsViewer } from '@/components/admin/AuditLogsViewer';
import { StatsCards } from '@/components/admin/StatsCards';
import { UsersManager } from '@/components/admin/UsersManager';
import { DepartamentosManager } from '@/components/admin/DepartamentosManager';
import { TecnicosManager } from '@/components/admin/TecnicosManager';
import { LogOut, Home, Settings, Phone, FileText, UserCircle, Building2, Wrench } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Verificar localStorage para usuário logado
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Verificar se o usuário ainda existe na tabela
        const { data: usuario, error } = await supabase
          .from('usuario_telefonia')
          .select('*')
          .eq('email', userData.email)
          .single();
        
        if (usuario && !error && usuario.ativo !== false) {
          // Atualizar dados do usuário
          const adminUser: AdminUser = {
            id: usuario.id,
            full_name: usuario.nome || '',
            email: usuario.email,
            role: (usuario.role as UserRole) || 'admin',
            last_login: usuario.ultimo_login || null,
            sip_config: undefined, // Não existe na tabela
            created_at: usuario.created_at || new Date().toISOString(),
            updated_at: usuario.updated_at || new Date().toISOString(),
          };
          setUser(adminUser);
          localStorage.setItem('current_user', JSON.stringify(adminUser));
        } else {
          // Usuário não encontrado ou inativo, fazer logout
          localStorage.removeItem('current_user');
          navigate('/admin/login');
        }
      } else {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      // Fallback: verificar localStorage
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    toast.success('Logout realizado com sucesso!');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

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
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="ramais" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Ramais
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="departamentos" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Departamentos
            </TabsTrigger>
            <TabsTrigger value="tecnicos" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Técnicos
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

          <TabsContent value="departamentos" className="space-y-4">
            <DepartamentosManager />
          </TabsContent>

          <TabsContent value="tecnicos" className="space-y-4">
            <TecnicosManager />
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