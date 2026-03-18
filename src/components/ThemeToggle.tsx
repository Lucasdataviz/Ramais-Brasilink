import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative w-9 h-9 rounded-xl flex items-center justify-center
        transition-all duration-300 focus:outline-none
        focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2
        ${isDark
          ? "bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400"
          : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-500"
        }
      `}
      aria-label="Alternar tema"
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      <span className="relative w-5 h-5 overflow-hidden">
        {/* Sun Icon — visível no modo claro */}
        <Sun
          className={`
            absolute inset-0 w-full h-full transition-all duration-500
            ${isDark ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}
          `}
          strokeWidth={2}
        />
        {/* Moon Icon — visível no modo escuro */}
        <Moon
          className={`
            absolute inset-0 w-full h-full transition-all duration-500
            ${isDark ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}
          `}
          strokeWidth={2}
        />
      </span>
    </button>
  );
}
