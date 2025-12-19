import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Activity, Building2 } from 'lucide-react';
import { getRamais, getAllDepartamentos } from '@/lib/supabase';
import { Ramal, Departamento } from '@/lib/types';
import { DashboardCharts } from './DashboardCharts';

export const StatsCards = () => {
  const [ramais, setRamais] = useState<Ramal[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [ramaisData, departamentosData] = await Promise.all([
        getRamais(),
        getAllDepartamentos(),
      ]);
      setRamais(ramaisData);
      setDepartamentos(departamentosData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const totalRamais = ramais.length;
  const ramaisAtivos = ramais.filter(r => r.status === 'ativo').length;
  const ramaisInativos = ramais.filter(r => r.status === 'inativo').length;
  const totalDepartamentos = departamentos.length;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-2 shadow-md">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ... existing cards ... */}
        <Card className="border-2 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Ramais
                </p>
                <h3 className="text-3xl font-bold mt-2">{totalRamais}</h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Phone className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <span className="text-blue-500 font-medium flex items-center mr-1">
                +100%
              </span>
              registrados
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ramais Ativos
                </p>
                <h3 className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">{ramaisAtivos}</h3>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: `${totalRamais > 0 ? (ramaisAtivos / totalRamais) * 100 : 0}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ramais Inativos
                </p>
                <h3 className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400">{ramaisInativos}</h3>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-500"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" x2="12" y1="2" y2="12" /></svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              Requerem atenção
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Departamentos
                </p>
                <h3 className="text-3xl font-bold mt-2">{totalDepartamentos}</h3>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Building2 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              Estrutura organizacional
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts ramais={ramais} departamentos={departamentos} />
    </div>
  );
};