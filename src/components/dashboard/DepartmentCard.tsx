import { Users, ChevronRight, Building2 } from 'lucide-react';
import { getIconComponent as getIcon } from '@/lib/icons';

interface DepartmentCardProps {
  id: string;
  nome: string;
  icone?: string;
  cor?: string;
  extensionsCount: number;
  isExpanded?: boolean;
  onClick: (id: string) => void;
}

export const DepartmentCard = ({
  id,
  nome,
  icone,
  cor = '#2563eb',
  extensionsCount,
  isExpanded = false,
  onClick
}: DepartmentCardProps) => {

  const renderIcon = () => {
    const IconFound = getIcon(icone);
    const FinalIcon = (IconFound && (typeof IconFound === 'function' || typeof IconFound === 'object')) ? IconFound : Building2;
    const Icon = FinalIcon as any;
    return <Icon className="h-6 w-6" />;
  };

  if (isExpanded) return null;

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className="group relative w-full h-[184px] rounded-2xl bg-card border border-border card-lift text-left select-none overflow-hidden"
    >
      {/* Top accent — só aparece com força no hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
        style={{ background: cor }}
      />

      <div className="h-full p-5 flex flex-col items-center justify-center text-center gap-3">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: `${cor}14`, color: cor }}
        >
          {renderIcon()}
        </div>

        <div className="space-y-1 w-full">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug min-h-[2.375rem] flex items-center justify-center">
            {nome}
          </h3>
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
            <Users className="h-3 w-3" />
            <p className="text-xs font-medium">
              {extensionsCount} {extensionsCount === 1 ? 'ramal' : 'ramais'}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-0.5 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0"
          style={{ color: cor }}
        >
          Ver ramais
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </button>
  );
};
