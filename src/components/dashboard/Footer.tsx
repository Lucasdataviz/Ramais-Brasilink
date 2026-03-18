import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      className="relative w-full py-5 px-6 flex items-center justify-center"
      style={{
        background: 'linear-gradient(160deg, #0f0b2e 0%, #1a0a2e 60%, #12061f 100%)',
        borderTop: '1px solid rgba(241,54,79,0.15)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #f1364f, rgba(99,102,241,0.5), transparent)' }}
      />

      <div className="flex items-center gap-2 text-sm text-white/50">
        <span>Feito com</span>
        <Heart className="h-4 w-4 text-rose-500 animate-pulse fill-rose-500" />
        <span>por</span>
        <span className="font-semibold text-white/80">Lucas Silva</span>
      </div>
    </footer>
  );
};
