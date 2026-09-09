import { Heart, Target, Eye, Zap, Users2, RefreshCw, Shield, Leaf, Sparkles } from 'lucide-react';

const valores = [
  { label: 'Colaboração', icon: Users2, color: '#6366f1' },
  { label: 'Inovação', icon: Zap, color: '#f1364f' },
  { label: 'Melhoria Contínua', icon: RefreshCw, color: '#10b981' },
  { label: 'Responsabilidade', icon: Shield, color: '#f59e0b' },
  { label: 'Sustentabilidade', icon: Leaf, color: '#22c55e' },
];

export const Footer = () => {
  return (
    <footer className="relative w-full mt-2">
      {/* Separator */}
      <div className="relative h-px mx-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(241,54,79,0.4), transparent)' }} />

      {/* Cultura strip — mesma linguagem visual da página */}
      <div className="px-4 py-8">
        {/* Header da seção */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/50" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/40">
            <Sparkles className="h-3 w-3 text-[#f1364f]" />
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
              Cultura Brasilink
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/50" />
        </div>

        {/* 3 cards — igual glassmorphism da página */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Missão */}
          <div className="group relative rounded-2xl overflow-hidden glass-card card-lift cursor-default transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#f1364f] to-orange-400" />
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-[0.06] group-hover:opacity-[0.12] transition-opacity -translate-y-1/2 translate-x-1/2 bg-[#f1364f]" />

            <div className="p-5 relative z-10 flex flex-col items-center text-center">
              <div className="p-2.5 rounded-xl bg-[#f1364f]/10 border border-[#f1364f]/15 text-[#f1364f] mb-3">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Missão</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Conectar pessoas e negócios por meio de um hub de soluções digitais, que entrega{' '}
                <span className="font-semibold text-[#f1364f]">inovação</span>,
                educação e suporte para transformar o jeito de viver e trabalhar.
              </p>
            </div>

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
            </div>
          </div>

          {/* Visão */}
          <div className="group relative rounded-2xl overflow-hidden glass-card card-lift cursor-default transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-blue-400" />
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-[0.06] group-hover:opacity-[0.12] transition-opacity -translate-y-1/2 translate-x-1/2 bg-violet-500" />

            <div className="p-5 relative z-10 flex flex-col items-center text-center">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/15 text-violet-500 mb-3">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Visão</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Presente conectado, onde{' '}
                <span className="font-semibold text-violet-500">tecnologia</span>,{' '}
                <span className="font-semibold text-[#f1364f]">pessoas</span> e{' '}
                <span className="font-semibold text-violet-500">negócios</span> vivem integrados
                em soluções digitais que simplificam e potencializam o cotidiano.
              </p>
            </div>

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
            </div>
          </div>

          {/* Valores */}
          <div className="group relative rounded-2xl overflow-hidden glass-card card-lift cursor-default transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-[0.06] group-hover:opacity-[0.12] transition-opacity -translate-y-1/2 translate-x-1/2 bg-emerald-500" />

            <div className="p-5 relative z-10 flex flex-col items-center text-center">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 mb-3">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Valores</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {valores.map(({ label, icon: Icon, color }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 hover:scale-105 cursor-default"
                    style={{
                      backgroundColor: `${color}14`,
                      color,
                      border: `1px solid ${color}28`,
                    }}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-border/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Desenvolvido com</span>
            <Heart className="h-3.5 w-3.5 animate-pulse text-[#f1364f] fill-[#f1364f]" />
            <span>por</span>
            <span className="font-bold text-foreground">Lucas Silva</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.35em] font-medium text-muted-foreground/60">
            Brasilink · 2026
          </div>
        </div>
      </div>
    </footer>
  );
};
