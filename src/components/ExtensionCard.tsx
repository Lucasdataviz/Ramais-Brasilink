import { Extension } from '@/lib/types';
import { Phone, Copy, PhoneCall, CheckCircle2, XCircle, Wrench } from 'lucide-react';
import { toast } from 'sonner';

interface ExtensionCardProps {
  extension: Extension;
  showShortNumber?: boolean;
}

export const ExtensionCard = ({ extension, showShortNumber = false }: ExtensionCardProps) => {
  const copyToClipboard = (number: string) => {
    navigator.clipboard.writeText(number);
    toast.success(`Ramal copiado: ${number}`, {
      description: extension.name,
      duration: 2000,
    });
  };

  const formatNumber = (number: string) => {
    if (showShortNumber && number.length > 4) {
      return number.slice(-4);
    }
    return number;
  };

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active' || s === 'ativo') {
      return {
        label: 'Ativo',
        dot: 'bg-emerald-400',
        pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
        accent: 'from-emerald-400 to-teal-400',
        numberBg: 'bg-blue-50/80 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
        numberText: 'text-blue-700 dark:text-blue-300',
        phoneIcon: 'text-blue-500',
        callBtn: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        avatarBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        PhoneIcon: PhoneCall,
        isActive: true,
      };
    } else if (s === 'maintenance' || s === 'manutenção') {
      return {
        label: 'Manutenção',
        dot: 'bg-amber-400',
        pill: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
        accent: 'from-amber-400 to-orange-400',
        numberBg: 'bg-muted/60 border-border/40',
        numberText: 'text-muted-foreground',
        phoneIcon: 'text-amber-400',
        callBtn: 'opacity-40 cursor-not-allowed text-muted-foreground',
        avatarBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
        PhoneIcon: Phone,
        isActive: false,
      };
    }
    // inactive / default
    return {
      label: 'Inativo',
      dot: 'bg-gray-400',
      pill: 'bg-gray-100 text-gray-500 ring-gray-200 dark:bg-gray-700/40 dark:text-gray-400 dark:ring-gray-600/30',
      accent: 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700',
      numberBg: 'bg-muted/60 border-border/40',
      numberText: 'text-muted-foreground',
      phoneIcon: 'text-gray-400',
      callBtn: 'opacity-40 cursor-not-allowed text-muted-foreground',
      avatarBg: 'bg-gradient-to-br from-gray-400 to-gray-500',
      PhoneIcon: Phone,
      isActive: false,
    };
  };

  const displayNumber = formatNumber(extension.number);
  const cfg = getStatusConfig(extension.status);

  // Initials from name
  const initials = extension.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cfg.isActive) {
      toast.error('Não é possível ligar para um ramal inativo');
      return;
    }
    const numberToCall = extension.number.length > 4 ? extension.number.slice(-4) : extension.number;
    try {
      const link = document.createElement('a');
      link.href = `sip:${numberToCall}`;
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
    <div className="group relative rounded-2xl overflow-hidden glass-card card-lift cursor-default transition-all duration-300">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${cfg.accent}`} />

      <div className="px-4 pt-5 pb-4 flex flex-col gap-3">

        {/* ── Row 1: Avatar + Name/Desc + Status ── */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={`
              shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
              text-white text-sm font-bold shadow-md select-none
              ${cfg.avatarBg}
              ${cfg.isActive ? 'shadow-blue-200 dark:shadow-blue-900/50' : 'opacity-70'}
            `}
          >
            {initials || <Phone className="h-4 w-4" />}
          </div>

          {/* Name + description */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground leading-tight truncate">
              {extension.name}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate leading-tight">
              {extension.metadata?.descricao || extension.department || 'Sem descrição'}
            </p>
          </div>

          {/* Status pill */}
          <span
            className={`
              shrink-0 inline-flex items-center gap-1 px-2 py-0.5
              rounded-full text-[10px] font-semibold ring-1 ring-inset
              ${cfg.pill}
            `}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.isActive ? 'animate-pulse' : ''}`} />
            {cfg.label}
          </span>
        </div>

        {/* ── Row 2: Phone number block ── */}
        <div
          className={`
            flex items-center gap-2 px-3 py-2.5 rounded-xl border
            ${cfg.numberBg}
          `}
        >
          <cfg.PhoneIcon className={`h-3.5 w-3.5 shrink-0 ${cfg.phoneIcon}`} />
          <span className={`flex-1 font-mono font-bold text-base tracking-widest ${cfg.numberText}`}>
            {displayNumber}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5">
            {/* Call */}
            <button
              onClick={handleCall}
              disabled={!cfg.isActive}
              title="Ligar para este ramal"
              className={`
                h-7 w-7 flex items-center justify-center rounded-lg
                transition-all duration-200
                ${cfg.callBtn}
                ${cfg.isActive ? 'hover:scale-110' : ''}
              `}
            >
              <PhoneCall className="h-3.5 w-3.5" />
            </button>

            {/* Copy */}
            <button
              onClick={(e) => { e.stopPropagation(); copyToClipboard(displayNumber); }}
              title="Copiar ramal"
              className="
                h-7 w-7 flex items-center justify-center rounded-lg
                text-muted-foreground hover:text-blue-500
                hover:bg-blue-50 dark:hover:bg-blue-500/10
                transition-all duration-200 hover:scale-110
              "
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
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