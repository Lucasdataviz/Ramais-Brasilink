import { useEffect, useState } from 'react';
import { getNotificacoesAtivas } from '@/lib/supabase';
import { Notificacao } from '@/lib/types';
import { Bell } from 'lucide-react';

export const NewsTicker = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  useEffect(() => {
    loadNotificacoes();
    const interval = setInterval(loadNotificacoes, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadNotificacoes = async () => {
    try {
      const data = await getNotificacoesAtivas();

      // Filtrar apenas notificações das últimas 24 horas
      const h24 = 24 * 60 * 60 * 1000;
      const now = new Date().getTime();

      const recent = data.filter(n => {
        const created = new Date(n.created_at).getTime();
        return (now - created) < h24;
      });

      setNotificacoes(recent);
    } catch (error) {
      console.error('Error loading notificacoes:', error);
    }
  };

  if (notificacoes.length === 0) return null;

  const getTipoColor = () => {
    // Usar cor baseada na primeira notificação (mais recente)
    const primeiroTipo = notificacoes[0]?.tipo || 'ramal_atualizado';
    switch (primeiroTipo) {
      case 'ramal_criado':
        return 'from-green-500 via-emerald-500 to-green-600';
      case 'ramal_atualizado':
        return 'from-blue-500 via-cyan-500 to-blue-600';
      case 'departamento_criado':
        return 'from-purple-500 via-pink-500 to-purple-600';
      case 'tecnico_criado':
        return 'from-teal-500 via-cyan-500 to-teal-600';
      case 'tecnico_atualizado':
        return 'from-indigo-500 via-blue-500 to-indigo-600';
      case 'mudancas_multiplas':
        return 'from-amber-500 via-orange-500 to-amber-600';
      default:
        return 'from-orange-500 via-red-500 to-orange-600';
    }
  };

  // Se houver apenas 1 notificação, exibe estático
  if (notificacoes.length === 1) {
    return (
      <div className={`bg-gradient-to-r ${getTipoColor()} text-white shadow-lg border-b-2 border-white/20`}>
        <div className="w-full flex items-center justify-center py-2 px-4">
          {/* Static centered message */}
          <span className="font-bold text-sm md:text-base text-center">
            {notificacoes[0].mensagem}
          </span>
        </div>
      </div>
    );
  }

  // Se houver mais de 1, prepara o ticker
  const mensagens = notificacoes.map(n => n.mensagem).join(" • ");
  // Espaço para separar no loop
  const espaco = "\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0";
  const displayContent = `${mensagens}${espaco}${mensagens}${espaco}`;

  return (
    <div className={`bg-gradient-to-r ${getTipoColor()} text-white overflow-hidden relative shadow-lg border-b-2 border-white/20`}>
      <div className="relative">
        {/* Efeito de brilho animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

        <div className="flex items-center gap-4 py-2 px-4 relative z-10 w-full">
          {/* Badge de Notícias - Restored but simplified */}
          <div className="flex items-center gap-2 shrink-0 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full border border-white/20 shadow-sm z-20">
            <Bell className="h-3.5 w-3.5" />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              NOTÍCIAS
            </span>
          </div>

          {/* Separador */}
          <div className="h-5 w-0.5 bg-white/40 z-20"></div>

          {/* Ticker com scroll contínuo */}
          <div className="flex-1 overflow-hidden relative h-6">
            <div className="ticker-wrapper">
              <div className="ticker-content font-medium text-sm md:text-base whitespace-nowrap">
                {displayContent}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ticker-wrapper {
          width: 100%;
          overflow: hidden;
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          display: flex;
          align-items: center;
        }
        
        .ticker-content {
          display: inline-block;
          will-change: transform;
          animation: ticker-scroll ${Math.max(30, notificacoes.length * 15)}s linear infinite;
        }
        
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};
