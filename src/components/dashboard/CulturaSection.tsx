import { Target, Eye, Heart, Zap, Users2, RefreshCw, Shield, Leaf } from 'lucide-react';

const valores = [
  { label: 'Colaboração', icon: Users2, color: '#6366f1' },
  { label: 'Inovação', icon: Zap, color: '#f1364f' },
  { label: 'Melhoria Contínua', icon: RefreshCw, color: '#10b981' },
  { label: 'Responsabilidade', icon: Shield, color: '#f59e0b' },
  { label: 'Sustentabilidade', icon: Leaf, color: '#22c55e' },
];

export const CulturaSection = () => {
  return (
    <section className="w-full px-4 py-8">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/60" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/60 border border-border/50">
          <Heart className="h-3.5 w-3.5 text-rose-500" />
          <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
            Cultura Brasilink
          </span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/60" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Missão */}
        <div className="group relative rounded-2xl overflow-hidden glass-card p-6 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-orange-400" />
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity -translate-y-1/2 translate-x-1/2 bg-rose-500" />

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Missão</h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Conectar pessoas e negócios por meio de um hub de soluções digitais, que entrega{' '}
            <span className="font-semibold text-rose-500">inovação</span>, educação e suporte para transformar o
            jeito de viver, trabalhar e crescer, com valor contínuo para clientes e acionistas.
          </p>
        </div>

        {/* Visão */}
        <div className="group relative rounded-2xl overflow-hidden glass-card p-6 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-blue-400" />
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity -translate-y-1/2 translate-x-1/2 bg-violet-500" />

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Visão</h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Presente conectado, onde{' '}
            <span className="font-semibold text-violet-500">tecnologia</span>,{' '}
            <span className="font-semibold text-rose-500">pessoas</span> e{' '}
            <span className="font-semibold text-violet-500">negócios</span> vivem integrados em soluções digitais
            que simplificam, protegem e potencializam o cotidiano, para um novo estilo de vida e trabalho mais
            inovador.
          </p>
        </div>

        {/* Valores */}
        <div className="group relative rounded-2xl overflow-hidden glass-card p-6 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity -translate-y-1/2 translate-x-1/2 bg-emerald-500" />

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Valores</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {valores.map(({ label, icon: Icon, color }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: `${color}12`,
                  color: color,
                  borderColor: `${color}30`,
                }}
              >
                <Icon className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
