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
  const legenda = tipo === 'supervisor'
    ? extension.metadata?.legenda_supervisor
    : extension.metadata?.legenda_coordenador;

  const isSupervisor = tipo === 'supervisor';
  const accent = isSupervisor ? '#2563eb' : '#7c3aed';

  const useShortNumber = () => {
    const preference = localStorage.getItem('useShortNumberForCalls');
    return preference === 'true' || (showShortNumber && preference !== 'false');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();

    const normalizedStatus = extension.status.toLowerCase();
    if (normalizedStatus !== 'active' && normalizedStatus !== 'ativo') {
      toast.error('Não é possível ligar para um ramal inativo');
      return;
    }

    const numberToCall = useShortNumber() && extension.number.length > 4
      ? extension.number.slice(-4)
      : extension.number;

    try {
      const sipUrl = `sip:${numberToCall}`;
      const link = document.createElement('a');
      link.href = sipUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Iniciando ligação para ${numberToCall}...`);
    } catch (error) {
      try {
        window.location.href = `tel:${numberToCall}`;
        toast.success(`Iniciando ligação para ${numberToCall}...`);
      } catch (telError) {
        toast.error('Erro ao iniciar ligação. Verifique se há um softphone instalado.');
        console.error('Error making call:', telError);
      }
    }
  };

  const isActive = extension.status.toLowerCase() === 'active' || extension.status.toLowerCase() === 'ativo';

  return (
    <Card className="p-4 border border-border card-lift bg-card">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {extension.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {legenda || extension.metadata?.descricao || extension.department || 'Sem descrição'}
          </p>
        </div>
        <Badge
          className="shrink-0 text-[10px] font-semibold border"
          style={{ backgroundColor: `${accent}14`, color: accent, borderColor: `${accent}30` }}
        >
          {isSupervisor ? 'Supervisor' : 'Coordenador'}
        </Badge>
      </div>

      <div
        className="flex items-center gap-2 p-2.5 rounded-xl border"
        style={{ backgroundColor: `${accent}0a`, borderColor: `${accent}22` }}
      >
        <Phone className="h-4 w-4 shrink-0" style={{ color: accent }} />
        <span className="text-base font-mono font-bold text-foreground flex-1">
          {displayNumber}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCall}
          disabled={!isActive}
          className="shrink-0 h-8 w-8 p-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500/10"
          title="Ligar para este ramal"
        >
          <PhoneCall className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(displayNumber);
          }}
          className="shrink-0 h-8 w-8 p-0"
          style={{ color: accent }}
          title="Copiar ramal"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
