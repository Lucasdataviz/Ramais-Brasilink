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
  { id: '1', numero: '7001', nome: 'Comercial',        cor: '#2563eb', icon: ShoppingBag },
  { id: '2', numero: '7002', nome: 'Ouvidoria',        cor: '#059669', icon: Megaphone },
  { id: '3', numero: '7003', nome: 'SAC',              cor: '#d97706', icon: Headphones },
  { id: '4', numero: '7004', nome: 'Corporativo',      cor: '#e11d48', icon: Building2 },
  { id: '5', numero: '7005', nome: 'Cobrança',         cor: '#7c3aed', icon: CreditCard },
  { id: '6', numero: '7006', nome: 'Tec. Oculto',      cor: '#475569', icon: EyeOff },
  { id: '7', numero: '9999', nome: 'Upcall',           cor: '#db2777', icon: Zap },
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
      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border bg-muted/50 hover:bg-muted transition-colors duration-150 active:scale-[0.98]"
      title={`Copiar ${value}`}
    >
      <div className="flex flex-col items-start min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-widest leading-none mb-1 text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-mono font-bold tracking-wider leading-none" style={{ color: cor }}>
          {value}
        </span>
      </div>
      <div
        className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg"
        style={{ background: `${cor}16`, color: cor }}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
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
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 rounded-2xl bg-card border border-border card-lift px-5 py-4 mb-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground leading-tight">Filas de Atendimento</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {FILAS.length} filas · clique em Transferir para copiar o código
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {expanded ? 'Recolher' : 'Expandir'}
          </span>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </button>

      {/* ── Grid de filas ── */}
      {expanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {FILAS.map((fila) => {
              const Icon = fila.icon;
              return (
                <div
                  key={fila.id}
                  className="relative rounded-2xl overflow-hidden bg-card border border-border card-lift flex flex-col"
                >
                  {/* Acento superior */}
                  <div className="h-[3px]" style={{ background: fila.cor }} />

                  <div className="p-4 flex flex-col gap-3">

                    {/* Ícone do setor + nome */}
                    <div className="flex flex-col items-center text-center gap-2">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${fila.cor}14`, color: fila.cor }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-foreground leading-tight text-center">
                        {fila.nome}
                      </p>
                    </div>

                    {/* Número em destaque */}
                    <div
                      className="flex items-center justify-center rounded-xl py-2.5 border"
                      style={{ background: `${fila.cor}0c`, borderColor: `${fila.cor}25` }}
                    >
                      <span className="text-xl font-bold font-mono tracking-widest" style={{ color: fila.cor }}>
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
