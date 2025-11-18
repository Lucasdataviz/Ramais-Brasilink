import { Extension } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Copy, PhoneCall } from 'lucide-react';
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

  const displayNumber = formatNumber(extension.number);
  const fullNumber = extension.number; // Número completo para ligação

  // Obter preferência de usar apenas 4 dígitos
  const useShortNumber = () => {
    const preference = localStorage.getItem('useShortNumberForCalls');
    return preference === 'true' || (showShortNumber && preference !== 'false');
  };

  // Função para fazer ligação via SIP
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Verificar se o ramal está ativo
    const normalizedStatus = extension.status.toLowerCase();
    if (normalizedStatus !== 'active' && normalizedStatus !== 'ativo') {
      toast.error('Não é possível ligar para um ramal inativo');
      return;
    }

    // Usar número curto (4 dígitos) se a preferência estiver ativa
    const numberToCall = useShortNumber() && extension.number.length > 4 
      ? extension.number.slice(-4) 
      : extension.number;

    try {
      // Tentar usar protocolo SIP primeiro (para softphones como MicroSIP)
      // Formato: sip:numero@servidor ou sip:numero
      const sipUrl = `sip:${numberToCall}`;
      
      // Criar um link temporário e clicar nele
      const link = document.createElement('a');
      link.href = sipUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Iniciando ligação para ${numberToCall}...`);
    } catch (error) {
      // Fallback: tentar protocolo tel: (para dispositivos móveis)
      try {
        const telUrl = `tel:${numberToCall}`;
        window.location.href = telUrl;
        toast.success(`Iniciando ligação para ${numberToCall}...`);
      } catch (telError) {
        toast.error('Erro ao iniciar ligação. Verifique se há um softphone instalado.');
        console.error('Error making call:', telError);
      }
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all border-0 shadow-md bg-white dark:bg-gray-900">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground truncate">
            {extension.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {extension.metadata?.descricao || extension.department || 'Sem descrição'}
          </p>
        </div>
        <Badge className={`${getStatusColor(extension.status)} ml-2 shrink-0 text-xs font-semibold`}>
          {getStatusLabel(extension.status)}
        </Badge>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
        <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-lg font-mono font-bold text-foreground flex-1">
          {displayNumber}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCall}
          disabled={extension.status.toLowerCase() !== 'active' && extension.status.toLowerCase() !== 'ativo'}
          className="shrink-0 h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ligar para este ramal"
        >
          <PhoneCall className="h-4 w-4 text-green-600 dark:text-green-400" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(displayNumber);
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