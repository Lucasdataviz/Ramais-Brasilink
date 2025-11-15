import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Activity, Building2 } from 'lucide-react';
import { getRamais, getAllDepartamentos } from '@/lib/supabase';
import { Ramal, Departamento } from '@/lib/types';

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
  const totalDepartamentos = departamentos.length;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
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
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total de Ramais
              </p>
              <h3 className="text-3xl font-bold mt-2">{totalRamais}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-500/10">
              <Phone className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ramais Ativos
              </p>
              <h3 className="text-3xl font-bold mt-2">{ramaisAtivos}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-500/10">
              <Activity className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Departamentos
              </p>
              <h3 className="text-3xl font-bold mt-2">{totalDepartamentos}</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-500/10">
              <Building2 className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};