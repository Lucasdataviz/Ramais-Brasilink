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

  // Uma faixa neutra e discreta — o tipo da notificação vira só um
  // acento no ícone, não uma cor de fundo diferente a cada troca.
  const getTipoAccent = () => {
    const primeiroTipo = notificacoes[0]?.tipo || 'ramal_atualizado';
    switch (primeiroTipo) {
      case 'ramal_criado':
      case 'tecnico_criado':
        return 'text-emerald-400';
      case 'departamento_criado':
        return 'text-violet-400';
      case 'mudancas_multiplas':
        return 'text-amber-400';
      default:
        return 'text-primary';
    }
  };

  const accent = getTipoAccent();

  // Se houver apenas 1 notificação, exibe estático
  if (notificacoes.length === 1) {
    return (
      <div className="bg-[#0b1220] border-b border-white/[0.06]">
        <div className="w-full flex items-center justify-center gap-2 py-2 px-4">
          <Bell className={`h-3.5 w-3.5 shrink-0 ${accent}`} />
          <span className="font-medium text-sm text-white/90 text-center">
            {notificacoes[0].mensagem}
          </span>
        </div>
      </div>
    );
  }

  // Se houver mais de 1, prepara o ticker
  const mensagens = notificacoes.map(n => n.mensagem).join(" • ");
  const espaco = "    •    ";
  const displayContent = `${mensagens}${espaco}${mensagens}${espaco}`;

  return (
    <div className="bg-[#0b1220] border-b border-white/[0.06] overflow-hidden relative">
      <div className="flex items-center gap-4 py-2 px-4 w-full">
        <div className={`flex items-center gap-2 shrink-0 px-2.5 py-1 bg-white/[0.06] rounded-full border border-white/[0.08] ${accent}`}>
          <Bell className="h-3.5 w-3.5" />
          <span className="font-semibold text-[10px] uppercase tracking-wider text-white/70">
            Novidades
          </span>
        </div>

        <div className="h-4 w-px bg-white/[0.1] shrink-0" />

        <div className="flex-1 overflow-hidden relative h-5">
          <div className="ticker-wrapper">
            <div className="ticker-content font-medium text-sm text-white/85 whitespace-nowrap">
              {displayContent}
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
      `}</style>
    </div>
  );
};
