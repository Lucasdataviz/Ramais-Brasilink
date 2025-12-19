import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hidratação incorreta
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative w-16 h-8 rounded-full p-1 transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900
        ${isDark ? "bg-slate-800 shadow-inner" : "bg-gradient-to-r from-sky-300 to-blue-400 shadow-inner"}
      `}
      aria-label="Alternar tema"
    >
      {/* Background decoration (clouds/stars could go here) */}
      <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
        <div className={`transition-opacity duration-300 ${isDark ? "opacity-0" : "opacity-100"}`}>
          {/* Cloud hint or similar if wanted, simpler to keep clean */}
        </div>
      </div>

      {/* Thumb / Slider */}
      <div
        className={`
          absolute top-1 bottom-1 w-6 h-6 rounded-full shadow-md transform transition-transform duration-500 cubic-bezier(0.4, 0.0, 0.2, 1) flex items-center justify-center
          ${isDark ? "translate-x-8 bg-slate-950 border border-slate-700" : "translate-x-0 bg-white border-transparent"}
        `}
      >
        <span className="relative w-4 h-4 overflow-hidden">
          {/* Sun Icon */}
          <Sun
            className={`
              absolute inset-0 w-full h-full text-amber-500 transition-all duration-500
              ${isDark ? "rotate-180 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}
            `}
            fill="currentColor"
          />
          {/* Moon Icon */}
          <Moon
            className={`
              absolute inset-0 w-full h-full text-blue-300 transition-all duration-500
              ${isDark ? "rotate-0 opacity-100 scale-100" : "-rotate-180 opacity-0 scale-50"}
            `}
            fill="currentColor"
          />
        </span>
      </div>
    </button>
  );
}
