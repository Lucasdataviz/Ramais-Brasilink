import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Wrench, ExternalLink, Search, Lock, X, Users, Layers, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  search: string;
  setSearch: (value: string) => void;
  supervisorCount?: number;
  coordenadorCount?: number;
  onSupervisoresClick?: () => void;
  onQueuesClick?: () => void;
  showQueues?: boolean;
}

export const Header = ({
  search,
  setSearch,
  supervisorCount = 0,
  coordenadorCount = 0,
  onSupervisoresClick,
  onQueuesClick,
  showQueues = false,
}: HeaderProps) => {
  const total = supervisorCount + coordenadorCount;

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center bg-[#0b1220] border-b border-white/[0.06]">
      <div className="w-full px-4 md:px-6 flex items-center gap-3 md:gap-5">

        {/* ── Wordmark ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <PhoneCall className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:block font-display font-semibold text-[15px] text-white tracking-tight">
            Ramais <span className="text-white/40 font-normal">Brasilink</span>
          </span>
        </Link>

        <div className="w-px h-6 bg-white/[0.08] hidden md:block" />

        {/* ── Search Bar ── */}
        <div className="flex-1 max-w-lg">
          <div className="relative flex items-center rounded-lg border border-white/[0.08] bg-white/[0.05] focus-within:bg-white/[0.08] focus-within:border-primary/50 transition-colors duration-200">
            <Search className="absolute left-3 h-4 w-4 text-white/35 pointer-events-none" />
            <Input
              placeholder="Buscar por nome, ramal ou departamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 h-9 text-sm border-0 shadow-none rounded-lg focus-visible:ring-0 bg-transparent text-white placeholder:text-white/35"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 h-5 w-5 flex items-center justify-center rounded-full text-white/45 hover:text-white hover:bg-white/10 transition-colors"
                title="Limpar busca"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Supervisores badge ── */}
        {total > 0 && (
          <button
            onClick={onSupervisoresClick}
            className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-white/60 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.07] transition-colors shrink-0"
            title="Ver Supervisores e Coordenadores"
          >
            <Users className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">
              {supervisorCount > 0 && `${supervisorCount} sup.`}
              {supervisorCount > 0 && coordenadorCount > 0 && ' · '}
              {coordenadorCount > 0 && `${coordenadorCount} coord.`}
            </span>
          </button>
        )}

        {/* ── Filas badge ── */}
        <button
          onClick={onQueuesClick}
          aria-pressed={showQueues}
          className={`hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
            showQueues
              ? 'text-white bg-primary/25 border-primary/40'
              : 'text-white/60 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border-white/[0.07]'
          }`}
          title="Ver Filas de Atendimento"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Filas</span>
        </button>

        {/* ── Action Buttons (right) ── */}
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" asChild className="hidden md:flex h-8 gap-1.5 rounded-lg text-xs font-medium text-white/55 hover:text-white hover:bg-white/[0.09] px-2.5">
            <Link to="/tecnicos">
              <Wrench className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Técnicos</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="hidden md:flex h-8 gap-1.5 rounded-lg text-xs font-medium text-white/55 hover:text-white hover:bg-white/[0.09] px-2.5">
            <a href="http://10.29.29.136/fop2" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Painel</span>
            </a>
          </Button>

          <div className="w-px h-5 bg-white/[0.08] mx-1 hidden md:block" />

          <ThemeToggle />

          <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg text-white/55 hover:text-white hover:bg-white/[0.09]">
            <Link to="/admin/login" title="Acessar Admin">
              <Lock className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

      </div>
    </header>
  );
};
