import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Wrench, ExternalLink, Search, Lock, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  search: string;
  setSearch: (value: string) => void;
  supervisorCount?: number;
  coordenadorCount?: number;
  onSupervisoresClick?: () => void;
}

export const Header = ({ search, setSearch, supervisorCount = 0, coordenadorCount = 0, onSupervisoresClick }: HeaderProps) => {
  const total = supervisorCount + coordenadorCount;

  return (
    <header className="sticky top-0 z-40 h-[72px] flex items-center">
      <div
        className="relative w-full h-full flex items-center"
        style={{ background: '#0f0b2e' }}
      >
        <div className="relative w-full px-5 flex items-center gap-3">

          {/* ── Search Bar ── */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-r from-[#f1364f] via-violet-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-60 blur transition-all duration-300" />
              <div className="relative flex items-center rounded-xl border transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)' }}
              >
                <Search className="absolute left-3.5 h-4 w-4 text-white/40 group-focus-within:text-[#f1364f] transition-colors duration-200 pointer-events-none" />
                <Input
                  placeholder="Buscar por nome, ramal ou departamento..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-10 py-5 text-sm border-0 shadow-none rounded-xl focus-visible:ring-0 bg-transparent text-white placeholder:text-white/30"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 h-5 w-5 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150"
                    title="Limpar busca"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Supervisores badge ── */}
          {total > 0 && (
            <button
              onClick={onSupervisoresClick}
              className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
              title="Ver Supervisores e Coordenadores"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">
                {supervisorCount > 0 && `${supervisorCount} sup.`}
                {supervisorCount > 0 && coordenadorCount > 0 && ' · '}
                {coordenadorCount > 0 && `${coordenadorCount} coord.`}
              </span>
              <span className="lg:hidden">{total}</span>
            </button>
          )}

          {/* ── Spacer ── */}
          <div className="flex-1" />

          {/* ── Action Buttons (right) ── */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="sm" asChild className="hidden md:flex h-9 gap-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all px-3">
              <Link to="/tecnicos">
                <Wrench className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Técnicos</span>
              </Link>
            </Button>

            <Button variant="ghost" size="sm" asChild className="hidden md:flex h-9 gap-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all px-3">
              <a href="http://10.29.29.136/fop2" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Painel</span>
              </a>
            </Button>

            <div className="w-px h-6 bg-white/15 mx-0.5 hidden md:block" />

            <ThemeToggle />

            <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Link to="/admin/login" title="Acessar Admin">
                <Lock className="h-4 w-4" />
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </header>
  );
};
