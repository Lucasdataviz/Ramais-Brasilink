import { Target, Eye, Heart, Zap, Users2, RefreshCw, Shield, Leaf, Sparkles } from 'lucide-react';

const valores = [
  { label: 'Colaboração', icon: Users2, color: '#6366f1', desc: 'Juntos somos mais fortes' },
  { label: 'Inovação', icon: Zap, color: '#f1364f', desc: 'Sempre à frente do futuro' },
  { label: 'Melhoria Contínua', icon: RefreshCw, color: '#10b981', desc: 'Evoluímos a cada dia' },
  { label: 'Responsabilidade', icon: Shield, color: '#f59e0b', desc: 'Comprometidos com o que fazemos' },
  { label: 'Sustentabilidade', icon: Leaf, color: '#22c55e', desc: 'Presente e futuro conectados' },
];

export const CulturaSidebar = () => {
  return (
    <aside
        className="fixed top-0 left-0 h-full z-40 w-[300px] flex flex-col"
        style={{ background: '#0f0b2e' }}
      >

        {/* Decorative blobs */}
        <div className="absolute top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: '#f1364f' }} />
        <div className="absolute bottom-24 -left-8 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: '#6366f1' }} />

        {/* ── Logo (altura fixa 72px) ── */}
        <div className="relative z-10 flex items-center gap-3 px-5 h-[72px] shrink-0">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl blur-md opacity-60" style={{ background: '#f1364f' }} />
            <div className="relative p-2 rounded-xl" style={{ background: 'rgba(241,54,79,0.2)', border: '1px solid rgba(241,54,79,0.4)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 693 893" className="h-7 w-7" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(0,893) scale(0.1,-0.1)" fill="currentColor" stroke="none">
                  <path fill="white" d="M3 5928 c3 -2696 5 -3004 19 -3103 59 -398 227 -870 439 -1232 311-531 745 -941 1290 -1218 630 -321 1311 -437 1969 -335 567 87 1062 296 1489 628 616 480 1094 1176 1241 1808 19 81 50 291 50 340 l0 24 -747 0 -748 0 -40 -128 c-48 -155 -151 -364 -240 -487 -413 -574 -1135 -853 -1849 -715 -542 105 -1032 473 -1276 960 -330 658 -222 1459 272 2017 153 173 296 278 543 398 206 101 405 165 511 165 l34 0 0 750 c0 739 0 750 -20 750 -44 0 -254 -33 -385 -61 -413 -87 -714 -209 -1052 -426 l-83 -53 0 1455 0 1455 -710 0 -711 0 4 -2992z"/>
                  <path fill="#f1364f" d="M3335 6528 c-4 -230 -3 -392 4 -466 17 -182 16 -182 251 -181 179 0 273 -11 430 -51 439 -112 855 -359 1191 -707 426 -442 671 -993 705 -1584 l7 -116 -134 24 c-74 13 -174 32 -224 41 l-90 17 -13 70 c-7 39 -24 124 -38 190 -128 600 -485 1104 -993 1403 -197 115 -398 190 -726 267 -279 66 -318 60 -352 -54 -14 -48 -17 -111 -17 -421 -1 -381 3 -420 42 -435 10 -3 69 -11 132 -16 323 -28 520 -115 710 -315 84 -88 148 -181 208 -299 48 -98 108 -253 99 -261 -10 -10 -270 15 -472 46 -104 15 -219 31 -255 35 -123 11 -205 27 -365 68 -138 36 -174 42 -265 42 -92 0 -112 -4 -160 -26 -270 -127 -373 -409 -245 -674 62 -127 156 -212 286 -255 54 -18 80 -21 164 -18 86 4 112 9 185 40 47 20 108 41 135 47 28 6 680 90 1450 187 1186 149 1434 177 1620 185 242 11 251 14 290 80 29 49 27 258 -3 421 -47 249 -184 704 -297 979 -276 676 -807 1249 -1520 1642 -484 267 -1148 447 -1646 447 l-87 0 -7 -352z m-23 -2998 l64 -20 24 -81 c23 -80 23 -83 7 -145 -28 -103 -32 -111 -68 -118 -235 -47 -384 25 -366 176 9 74 58 151 122 189 40 25 134 25 217 -1z"/>
                </g>
              </svg>
            </div>
          </div>
          <div>
            <p className="text-lg font-extrabold text-white tracking-tight leading-snug">brasilink</p>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: '#f1364f' }}>Paixão por conectar</p>
          </div>
        </div>

        {/* Scrollable culture content */}
        <div className="flex-1 overflow-y-auto relative z-10">
          {/* Subtle divider below logo */}
          <div className="mx-4 h-px mb-3 mt-1" style={{ background: 'rgba(241,54,79,0.2)' }} />
          <div className="px-4 pb-6 flex flex-col gap-3">

            {/* Section label */}
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3 w-3" style={{ color: '#f1364f' }} />
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-white/50">Nossa Cultura</span>
            </div>

            {/* Missão */}
            <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(241,54,79,0.1)', border: '1px solid rgba(241,54,79,0.2)' }}>
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: 'linear-gradient(90deg, #f1364f, #ff6b6b)' }} />
              <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(241,54,79,0.2)' }}>
                  <Target className="h-3.5 w-3.5" style={{ color: '#f1364f' }} />
                </div>
                <h3 className="text-base font-bold text-white">Missão</h3>
              </div>
              <p className="text-[13px] text-white/65 leading-relaxed">
                Conectar pessoas e negócios por meio de um hub de soluções digitais com{' '}
                <span className="font-semibold" style={{ color: '#f1364f' }}>inovação</span>,
                educação e suporte para transformar o jeito de viver e trabalhar.
              </p>
            </div>

            {/* Visão */}
            <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)' }} />
              <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.2)' }}>
                  <Eye className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <h3 className="text-base font-bold text-white">Visão</h3>
              </div>
              <p className="text-[13px] text-white/65 leading-relaxed">
                Presente conectado, onde{' '}
                <span className="font-semibold text-violet-400">tecnologia</span> e{' '}
                <span className="font-semibold" style={{ color: '#f1364f' }}>pessoas</span>{' '}
                vivem integrados em soluções digitais que simplificam e potencializam o cotidiano.
              </p>
            </div>

            {/* Valores */}
            <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}>
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.2)' }}>
                  <Heart className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white">Valores</h3>
              </div>
              <div className="flex flex-col gap-3">
                {valores.map(({ label, icon: Icon, color, desc }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${color}20` }}>
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{label}</p>
                      <p className="text-[10px] text-white/40 leading-tight">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </aside>
  );
};
