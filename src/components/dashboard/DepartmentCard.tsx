import { Users, ChevronDown, Building2 } from 'lucide-react';
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
  cor = '#6366f1', 
  extensionsCount, 
  isExpanded = false, 
  onClick 
}: DepartmentCardProps) => {
  
  const renderIcon = () => {
    const IconFound = getIcon(icone);
    const FinalIcon = (IconFound && (typeof IconFound === 'function' || typeof IconFound === 'object')) ? IconFound : Building2;
    const Icon = FinalIcon as any;
    return <Icon className="h-8 w-8" />;
  };

  if (isExpanded) return null;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden glass-card card-lift cursor-pointer select-none"
      style={{ transition: 'box-shadow 0.3s, transform 0.3s' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 2px ${cor}60, 0 8px 30px ${cor}25`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
      onClick={() => onClick(id)}
    >
      {/* Top gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${cor}99, ${cor})` }}
      />

      {/* Clickable indicator — top right corner */}
      <div
        className="absolute top-2.5 right-2.5 p-1 rounded-lg opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${cor}20`, color: cor }}
      >
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300" />
      </div>

      {/* Background color blob */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2"
        style={{ backgroundColor: cor }}
      />

      <div className="p-6 flex flex-col items-center text-center space-y-3 relative z-10">
        {/* Icon container */}
        <div
          className="p-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110"
          style={{
            backgroundColor: `${cor}18`,
            color: cor,
            boxShadow: `0 4px 20px ${cor}25`,
          }}
        >
          {renderIcon()}
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-sm md:text-base text-foreground line-clamp-2 leading-snug">
            {nome}
          </h3>
          <div className="flex items-center justify-center gap-1.5">
            <Users className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">
              {extensionsCount} {extensionsCount === 1 ? 'ramal' : 'ramais'}
            </p>
          </div>
        </div>

        {/* Bottom expand hint */}
        <div className="flex items-center gap-1 text-xs opacity-30 group-hover:opacity-100 transition-opacity duration-300" style={{ color: cor }}>
          <ChevronDown className="h-3 w-3" />
          <span className="font-medium">Ver ramais</span>
        </div>
      </div>
    </div>
  );
};
