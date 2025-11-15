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
      // Pegar apenas a notificação mais recente (última)
      if (data.length > 0) {
        setNotificacoes([data[0]]); // Apenas a primeira (mais recente)
      } else {
        setNotificacoes([]);
      }
    } catch (error) {
      console.error('Error loading notificacoes:', error);
    }
  };

  if (notificacoes.length === 0) return null;

  // Usar apenas a mensagem da notificação mais recente
  const mensagemUnica = notificacoes[0].mensagem;
  // Criar loop infinito: duplicar a mensagem para criar transição perfeita
  // Usar um espaçamento muito grande (equivalente a ~200 caracteres) para garantir que apenas uma mensagem apareça por vez
  // Quando a primeira mensagem sair completamente pela esquerda, a segunda já estará começando a entrar pela direita
  const espacoSeparador = '                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ';
  // Duplicar para criar loop contínuo - apenas uma mensagem visível por vez
  const mensagemDuplicada = `${mensagemUnica}${espacoSeparador}${mensagemUnica}`;

  const getTipoColor = () => {
    // Usar cor baseada na primeira notificação ou padrão
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

  return (
    <div className={`bg-gradient-to-r ${getTipoColor()} text-white overflow-hidden relative shadow-lg border-b-2 border-white/20`}>
      <div className="relative">
        {/* Efeito de brilho animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        
        <div className="flex items-center gap-4 py-3 px-4 relative z-10">
          {/* Badge de Notícias */}
          <div className="flex items-center gap-2 shrink-0 px-4 py-1.5 bg-black/30 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
            <Bell className="h-5 w-5 animate-bounce" />
            <span className="font-black text-xs uppercase tracking-widest drop-shadow-lg">
              NOTÍCIAS
            </span>
          </div>

          {/* Separador animado */}
          <div className="h-6 w-0.5 bg-white/40 animate-pulse"></div>

          {/* Ticker com scroll contínuo */}
          <div className="flex-1 overflow-hidden relative">
            <div className="ticker-wrapper">
              <div className="ticker-content">
                <span className="font-bold text-sm md:text-base drop-shadow-md whitespace-nowrap">
                  {mensagemDuplicada}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ticker-wrapper {
          width: 100%;
          overflow: hidden;
          position: relative;
        }
        
        .ticker-content {
          display: inline-block;
          white-space: nowrap;
          will-change: transform;
          animation: ticker-scroll 70s linear infinite;
        }
        
        @keyframes ticker-scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(calc(-50%));
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

