import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      className="relative w-full py-8 px-8 flex flex-col items-center justify-center gap-3"
      style={{
        background: '#0f0b2e',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-2.5 text-sm text-white/40">
        <span className="font-light">Desenvolvido com</span>
        <Heart className="h-4 w-4 text-[#f1364f] animate-pulse fill-[#f1364f]" />
        <span className="font-light">por</span>
        <span className="font-bold text-white tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Lucas Silva
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-[1px] w-8 bg-white/10" />
        <div className="text-[10px] uppercase tracking-[0.4em] font-medium text-white/30">
          Brasilink • 2026
        </div>
        <div className="h-[1px] w-8 bg-white/10" />
      </div>
      
      {/* Subtle bottom glow accent */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[1px] opacity-30" 
        style={{ background: 'linear-gradient(90deg, transparent, #f1364f, transparent)' }} 
      />
    </footer>
  );
};
