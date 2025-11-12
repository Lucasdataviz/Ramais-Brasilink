import { Extension } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ExtensionCardProps {
  extension: Extension;
  showShortNumber?: boolean;
}

export const ExtensionCard = ({ extension, showShortNumber = false }: ExtensionCardProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Ramal copiado!');
  };

  // Função para mostrar apenas os últimos 4 dígitos
  const formatNumber = (number: string) => {
    if (showShortNumber && number.length > 4) {
      return number.slice(-4);
    }
    return number;
  };

  const getStatusColor = (status: string) => {
    // Aceita tanto 'active'/'ativo' quanto 'inactive'/'inativo'
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'active' || normalizedStatus === 'ativo') {
      return 'bg-green-500 text-white hover:bg-green-600';
    } else if (normalizedStatus === 'inactive' || normalizedStatus === 'inativo') {
      return 'bg-gray-400 text-white';
    } else if (normalizedStatus === 'maintenance' || normalizedStatus === 'manutenção') {
      return 'bg-yellow-500 text-white';
    }
    return 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'active' || normalizedStatus === 'ativo') {
      return 'Ativo';
    } else if (normalizedStatus === 'inactive' || normalizedStatus === 'inativo') {
      return 'Inativo';
    } else if (normalizedStatus === 'maintenance' || normalizedStatus === 'manutenção') {
      return 'Manutenção';
    }
    return status;
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all border-0 shadow-md bg-white dark:bg-gray-900">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground truncate">
            {extension.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 truncate">{extension.department}</p>
        </div>
        <Badge className={`${getStatusColor(extension.status)} ml-2 shrink-0 text-xs font-semibold`}>
          {getStatusLabel(extension.status)}
        </Badge>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
        <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-lg font-mono font-bold text-foreground flex-1">
          {formatNumber(extension.number)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(extension.number);
          }}
          className="shrink-0 h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          title="Copiar ramal"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};