import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RamaisManager } from '@/components/admin/RamaisManager';
import { AuditLogsViewer } from '@/components/admin/AuditLogsViewer';
import { StatsCards } from '@/components/admin/StatsCards';
import { UsersManager } from '@/components/admin/UsersManager';
import { DepartamentosManager } from '@/components/admin/DepartamentosManager';
import { TecnicosManager } from '@/components/admin/TecnicosManager';
import { IPsManager } from '@/components/admin/IPsManager';
import { LogOut, Home, Settings, Phone, FileText, UserCircle, Building2, Wrench, Network, LayoutDashboard, Shield, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } else {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    toast.success('Logout realizado com sucesso!');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Geral' },
    { id: 'ramais', label: 'Ramais', icon: Phone, category: 'Telefonia' },
    { id: 'departamentos', label: 'Departamentos', icon: Building2, category: 'Telefonia' },
    { id: 'tecnicos', label: 'Técnicos', icon: Wrench, category: 'Telefonia' },
    { id: 'users', label: 'Usuários', icon: UserCircle, category: 'Sistema' },
    { id: 'ips', label: 'IPs Permitidos', icon: Network, category: 'Sistema' },
    { id: 'logs', label: 'Auditoria', icon: FileText, category: 'Sistema' },
  ];

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
      {/* Sidebar Premium */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 hidden md:flex flex-col shadow-2xl z-20">

        {/* Brand Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white tracking-tight">Admin<span className="text-blue-400">Panel</span></h1>
              <p className="text-xs text-slate-400 font-medium">Gestão Corporativa</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">
                {category}
              </h3>
              <div className="space-y-1">
                {menuItems.filter(item => item.category === category).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
                      <span>{item.label}</span>
                      {isActive && (
                        <ChevronRight className="h-3 w-3 absolute right-3 opacity-50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
              {user.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 border-slate-700 bg-transparent text-slate-400 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair do Sistema
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950">

        {/* Top Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {menuItems.find(i => i.id === activeTab)?.icon && (
                (() => {
                  const Icon = menuItems.find(i => i.id === activeTab)!.icon;
                  return <Icon className="h-5 w-5 text-blue-600" />;
                })()
              )}
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeTab === 'dashboard' && 'Visão geral e métricas do sistema'}
              {activeTab === 'ramais' && 'Gerenciamento completo de ramais'}
              {activeTab === 'departamentos' && 'Organização estrutural da empresa'}
              {activeTab === 'tecnicos' && 'Controle de equipe técnica'}
              {activeTab === 'users' && 'Administração de acessos'}
              {activeTab === 'ips' && 'Segurança e controle de rede'}
              {activeTab === 'logs' && 'Histórico de atividades'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                <span>Ir para Site</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dashboard' && <StatsCards />}
            {activeTab === 'ramais' && <RamaisManager />}
            {activeTab === 'departamentos' && <DepartamentosManager />}
            {activeTab === 'tecnicos' && <TecnicosManager />}
            {activeTab === 'users' && <UsersManager />}
            {activeTab === 'ips' && <IPsManager />}
            {activeTab === 'logs' && (
              <Card className="border shadow-sm bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle>Logs de Auditoria</CardTitle>
                  <CardDescription>
                    Registro detalhado de todas as operações do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AuditLogsViewer />
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}