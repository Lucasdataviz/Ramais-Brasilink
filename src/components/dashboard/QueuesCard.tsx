import { useState } from 'react';
import {
  ChevronUp, ChevronDown, Layers,
  ShoppingBag, Megaphone, Headphones, Building2,
  EyeOff, PhoneForwarded, CreditCard, Zap,
  Check, Copy,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Filas fixas no código — sempre visíveis ──────────────────────────────────
const FILAS = [
  { id: '1', numero: '7001', nome: 'Comercial',        cor: '#3b82f6', icon: ShoppingBag },
  { id: '2', numero: '7002', nome: 'Ouvidoria',        cor: '#10b981', icon: Megaphone },
  { id: '3', numero: '7003', nome: 'SAC',              cor: '#f59e0b', icon: Headphones },
  { id: '4', numero: '7004', nome: 'Corporativo',      cor: '#f1364f', icon: Building2 },
  { id: '5', numero: '7005', nome: 'Cobrança',         cor: '#6366f1', icon: CreditCard },
  { id: '6', numero: '7006', nome: 'Tec. Oculto',      cor: '#6b7280', icon: EyeOff },
  { id: '7', numero: '9999', nome: 'Upcall',           cor: '#ec4899', icon: Zap },
];

// ── Chip de copiar com feedback visual ───────────────────────────────────────
const CopyChip = ({ value, label, cor }: { value: string; label: string; cor: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    toast.success(`Número copiado: ${value}`, {
      description: 'Pronto para colar no seu softphone',
      duration: 2500,
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 active:scale-95"
      style={{
        background: copied ? `${cor}22` : `${cor}10`,
        borderColor: copied ? `${cor}55` : `${cor}25`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = `${cor}1c`;
        (e.currentTarget as HTMLElement).style.borderColor = `${cor}45`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = copied ? `${cor}22` : `${cor}10`;
        (e.currentTarget as HTMLElement).style.borderColor = copied ? `${cor}55` : `${cor}25`;
      }}
      title={`Copiar ${value}`}
    >
      <div className="flex flex-col items-start min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5" style={{ color: `${cor}99` }}>
          {label}
        </span>
        <span className="text-sm font-mono font-black tracking-wider leading-none" style={{ color: cor }}>
          {value}
        </span>
      </div>
      <div
        className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg"
        style={{ background: `${cor}20` }}
      >
        {copied
          ? <Check className="h-3.5 w-3.5" style={{ color: cor }} />
          : <Copy className="h-3.5 w-3.5" style={{ color: `${cor}bb` }} />
        }
      </div>
    </button>
  );
};

// ── Componente principal ─────────────────────────────────────────────────────
export const QueuesCard = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-6">

      {/* ── Header colapsável ── */}
      <div
        className="group relative rounded-2xl overflow-hidden glass-card cursor-pointer transition-all duration-300 hover:shadow-lg mb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#f1364f] via-orange-400 to-amber-400" />

        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: 'rgba(241,54,79,0.12)', border: '1px solid rgba(241,54,79,0.2)', color: '#f1364f' }}
            >
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">Filas de Atendimento</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {FILAS.length} filas · Clique em Transferir para copiar o código
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="hidden sm:inline text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(241,54,79,0.1)', color: '#f1364f', border: '1px solid rgba(241,54,79,0.2)' }}
            >
              {expanded ? 'Recolher' : 'Expandir'}
            </span>
            {expanded
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
            }
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        </div>
      </div>

      {/* ── Grid de filas ── */}
      {expanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
            {FILAS.map((fila) => {
              const Icon = fila.icon;
              return (
                <div
                  key={fila.id}
                  className="group relative rounded-2xl overflow-hidden glass-card flex flex-col"
                  style={{ transition: 'box-shadow 0.3s, transform 0.3s' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 2px ${fila.cor}55, 0 8px 28px ${fila.cor}22`;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                    (e.currentTarget as HTMLDivElement).style.transform = '';
                  }}
                >
                  {/* Acento superior */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ background: `linear-gradient(90deg, ${fila.cor}77, ${fila.cor})` }}
                  />
                  {/* Blob */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-[0.07] group-hover:opacity-[0.18] transition-opacity duration-500 -translate-y-1/2 translate-x-1/2"
                    style={{ backgroundColor: fila.cor }}
                  />

                  <div className="p-4 flex flex-col gap-3 relative z-10">

                    {/* Ícone do setor + nome */}
                    <div className="flex flex-col items-center text-center gap-1.5">
                      <div
                        className="p-3 rounded-2xl text-white shadow-md group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: fila.cor, boxShadow: `0 4px 14px ${fila.cor}45` }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-foreground leading-tight text-center">
                        {fila.nome}
                      </p>
                    </div>

                    {/* Número em destaque */}
                    <div
                      className="flex items-center justify-center rounded-xl py-2.5 border"
                      style={{ background: `${fila.cor}12`, borderColor: `${fila.cor}28` }}
                    >
                      <span className="text-2xl font-black font-mono tracking-widest" style={{ color: fila.cor }}>
                        {fila.numero}
                      </span>
                    </div>

                    {/* Apenas chip de Transferir */}
                    <CopyChip
                      value={`*2${fila.numero}`}
                      label="Transferir"
                      cor={fila.cor}
                    />
                  </div>

                  {/* Shimmer hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
