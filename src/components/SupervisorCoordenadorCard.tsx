import { Extension } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Copy, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';

interface SupervisorCoordenadorCardProps {
  extension: Extension;
  tipo: 'supervisor' | 'coordenador';
  showShortNumber?: boolean;
}

export const SupervisorCoordenadorCard = ({ 
  extension, 
  tipo,
  showShortNumber = false 
}: SupervisorCoordenadorCardProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Ramal copiado!');
  };

  const formatNumber = (number: string) => {
    if (showShortNumber && number.length > 4) {
      return number.slice(-4);
    }
    return number;
  };

  const displayNumber = formatNumber(extension.number);
  const fullNumber = extension.number; // Número completo para ligação
  const legenda = tipo === 'supervisor' 
    ? extension.metadata?.legenda_supervisor 
    : extension.metadata?.legenda_coordenador;

  const isSupervisor = tipo === 'supervisor';

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
      const sipUrl = `sip:${numberToCall}`;
      
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
  const gradientClass = isSupervisor
    ? 'from-blue-500/10 via-blue-400/5 to-transparent dark:from-blue-500/20 dark:via-blue-400/10'
    : 'from-purple-500/10 via-purple-400/5 to-transparent dark:from-purple-500/20 dark:via-purple-400/10';
  
  const borderColor = isSupervisor
    ? 'border-blue-200/50 dark:border-blue-800/30'
    : 'border-purple-200/50 dark:border-purple-800/30';

  return (
    <Card className={`
      p-4 hover:shadow-xl transition-all duration-300 border 
      ${borderColor}
      bg-gradient-to-br ${gradientClass}
      backdrop-blur-sm
      shadow-md hover:scale-[1.02]
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground truncate">
            {extension.name}
          </h3>
          {legenda && (
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {legenda}
            </p>
          )}
          {!legenda && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {extension.metadata?.descricao || extension.department || 'Sem descrição'}
            </p>
          )}
        </div>
        <Badge className={`
          ml-2 shrink-0 text-xs font-semibold
          ${isSupervisor 
            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300/30 dark:border-blue-700/30' 
            : 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300/30 dark:border-purple-700/30'
          }
        `}>
          {isSupervisor ? 'Supervisor' : 'Coordenador'}
        </Badge>
      </div>

      <div className={`
        flex items-center gap-2 p-3 rounded-lg 
        ${isSupervisor
          ? 'bg-gradient-to-r from-blue-50/80 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/40 dark:border-blue-800/30'
          : 'bg-gradient-to-r from-purple-50/80 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200/40 dark:border-purple-800/30'
        }
      `}>
        <Phone className={`
          h-4 w-4 shrink-0
          ${isSupervisor 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-purple-600 dark:text-purple-400'
          }
        `} />
        <span className="text-lg font-mono font-bold text-foreground flex-1">
          {displayNumber}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCall}
          disabled={extension.status.toLowerCase() !== 'active' && extension.status.toLowerCase() !== 'ativo'}
          className={`
            shrink-0 h-8 w-8 p-0 disabled:opacity-50 disabled:cursor-not-allowed
            ${isSupervisor
              ? 'hover:bg-green-100 dark:hover:bg-green-900/30'
              : 'hover:bg-green-100 dark:hover:bg-green-900/30'
            }
          `}
          title="Ligar para este ramal"
        >
          <PhoneCall className={`h-4 w-4 ${isSupervisor ? 'text-green-600 dark:text-green-400' : 'text-green-600 dark:text-green-400'}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(displayNumber);
          }}
          className={`
            shrink-0 h-8 w-8 p-0
            ${isSupervisor
              ? 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
              : 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
            }
          `}
          title="Copiar ramal"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

