import { Extension } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Copy, PhoneCall, CheckCircle2, XCircle, Wrench } from 'lucide-react';
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

  const formatNumber = (number: string) => {
    if (showShortNumber && number.length > 4) {
      return number.slice(-4);
    }
    return number;
  };

  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'active' || normalizedStatus === 'ativo') {
      return {
        color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        dot: 'bg-emerald-500',
        label: 'Ativo',
        icon: CheckCircle2,
        glow: 'shadow-emerald-500/10',
        isActive: true,
      };
    } else if (normalizedStatus === 'inactive' || normalizedStatus === 'inativo') {
      return {
        color: 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20',
        dot: 'bg-gray-400',
        label: 'Inativo',
        icon: XCircle,
        glow: '',
        isActive: false,
      };
    } else if (normalizedStatus === 'maintenance' || normalizedStatus === 'manutenção') {
      return {
        color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        dot: 'bg-amber-500',
        label: 'Manutenção',
        icon: Wrench,
        glow: 'shadow-amber-500/10',
        isActive: false,
      };
    }
    return {
      color: 'bg-muted text-muted-foreground',
      dot: 'bg-gray-400',
      label: status,
      icon: XCircle,
      glow: '',
      isActive: false,
    };
  };

  const displayNumber = formatNumber(extension.number);
  const statusConfig = getStatusConfig(extension.status);
  const StatusIcon = statusConfig.icon;

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const normalizedStatus = extension.status.toLowerCase();
    if (normalizedStatus !== 'active' && normalizedStatus !== 'ativo') {
      toast.error('Não é possível ligar para um ramal inativo');
      return;
    }
    const numberToCall = extension.number.length > 4
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
    } catch {
      try {
        window.location.href = `tel:${numberToCall}`;
        toast.success(`Iniciando ligação para ${numberToCall}...`);
      } catch {
        toast.error('Erro ao iniciar ligação.');
      }
    }
  };

  return (
    <div
      className={`
        group relative rounded-2xl overflow-hidden
        glass-card card-lift cursor-default
        ${statusConfig.isActive ? statusConfig.glow : ''}
        transition-all duration-300
      `}
    >
      {/* Colored top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          statusConfig.isActive
            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
            : 'bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700'
        }`}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-sm font-bold text-foreground truncate leading-snug">
              {extension.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {extension.metadata?.descricao || extension.department || 'Sem descrição'}
            </p>
          </div>

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${statusConfig.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${statusConfig.isActive ? 'animate-pulse' : ''}`} />
            {statusConfig.label}
          </span>
        </div>

        {/* Number row */}
        <div className={`
          flex items-center gap-2 p-3 rounded-xl
          ${statusConfig.isActive
            ? 'bg-gradient-to-r from-blue-500/8 via-indigo-500/8 to-purple-500/8 dark:from-blue-500/15 dark:via-indigo-500/15 dark:to-purple-500/15 border border-blue-200/40 dark:border-blue-700/30'
            : 'bg-muted/50 border border-border/40'
          }
        `}>
          <Phone className={`h-4 w-4 shrink-0 ${statusConfig.isActive ? 'text-blue-500 dark:text-blue-400' : 'text-muted-foreground'}`} />
          <span className="text-base font-mono font-bold text-foreground flex-1 tracking-wider">
            {displayNumber}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCall}
              disabled={!statusConfig.isActive}
              className={`
                shrink-0 h-7 w-7 p-0 rounded-lg
                ${statusConfig.isActive
                  ? 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                  : 'opacity-40 cursor-not-allowed text-muted-foreground'
                }
                transition-all duration-200
              `}
              title="Ligar para este ramal"
            >
              <PhoneCall className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(displayNumber);
              }}
              className="shrink-0 h-7 w-7 p-0 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-500 dark:text-blue-400 transition-all duration-200"
              title="Copiar ramal"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hover shimmer overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
      </div>
    </div>
  );
};