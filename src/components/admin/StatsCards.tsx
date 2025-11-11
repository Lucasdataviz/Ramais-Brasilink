import { useMemo } from 'react';
import { useRealtimeExtensions } from '@/hooks/useRealtimeData';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Activity, Building2 } from 'lucide-react';

export const StatsCards = () => {
  const { extensions } = useRealtimeExtensions();

  const stats = useMemo(() => {
    const activeCount = extensions.filter(e => e.status === 'active').length;
    const departmentsCount = new Set(extensions.map(e => e.department).filter(Boolean)).size;
    
    return {
      total: extensions.length,
      active: activeCount,
      departments: departmentsCount,
    };
  }, [extensions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border hover:shadow transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Ramais</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border hover:shadow transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ramais Ativos</p>
              <p className="text-3xl font-bold mt-2">{stats.active}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border hover:shadow transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Departamentos</p>
              <p className="text-3xl font-bold mt-2">{stats.departments}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

