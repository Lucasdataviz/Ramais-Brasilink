import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Wrench, ExternalLink, Search, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  search: string;
  setSearch: (value: string) => void;
}

export const Header = ({ search, setSearch }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all duration-300">
      <div className="w-full px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo e Nome */}
          <div className="flex items-center gap-4 bg-white/50 dark:bg-gray-800/50 px-5 py-3 rounded-2xl shadow-sm border border-gray-100/50 dark:border-gray-700/50 backdrop-blur-md">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20 shadow-lg transform transition-transform hover:scale-105">
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 693 893"
                className="h-7 w-7 fill-white"
                preserveAspectRatio="xMidYMid meet"
              >
                <g transform="translate(0,893) scale(0.1,-0.1)" fill="currentColor" stroke="none">
                  <path fill="white" d="M3 5928 c3 -2696 5 -3004 19 -3103 59 -398 227 -870 439 -1232 311-531 745 -941 1290 -1218 630 -321 1311 -437 1969 -335 567 87 1062 296 1489 628 616 480 1094 1176 1241 1808 19 81 50 291 50 340 l0 24 -747 0 -748 0 -40 -128 c-48 -155 -151 -364 -240 -487 -413 -574 -1135 -853 -1849 -715 -542 105 -1032 473 -1276 960 -330 658 -222 1459 272 2017 153 173 296 278 543 398 206 101 405 165 511 165 l34 0 0 750 c0 739 0 750 -20 750 -44 0 -254 -33 -385 -61 -413 -87 -714 -209 -1052 -426 l-83 -53 0 1455 0 1455 -710 0 -711 0 4 -2992z"/>
                  <path fill="#f1364fff" d="M3335 6528 c-4 -230 -3 -392 4 -466 17 -182 16 -182 251 -181 179 0 273 -11 430 -51 439 -112 855 -359 1191 -707 426 -442 671 -993 705 -1584 l7 -116 -134 24 c-74 13 -174 32 -224 41 l-90 17 -13 70 c-7 39 -24 124 -38 190 -128 600 -485 1104 -993 1403 -197 115 -398 190 -726 267 -279 66 -318 60 -352 -54 -14 -48 -17 -111 -17 -421 -1 -381 3 -420 42 -435 10 -3 69 -11 132 -16 323 -28 520 -115 710 -315 84 -88 148 -181 208 -299 48 -98 108 -253 99 -261 -10 -10 -270 15 -472 46 -104 15 -219 31 -255 35 -123 11 -205 27 -365 68 -138 36 -174 42 -265 42 -92 0 -112 -4 -160 -26 -270 -127 -373 -409 -245 -674 62 -127 156 -212 286 -255 54 -18 80 -21 164 -18 86 4 112 9 185 40 47 20 108 41 135 47 28 6 680 90 1450 187 1186 149 1434 177 1620 185 242 11 251 14 290 80 29 49 27 258 -3 421 -47 249 -184 704 -297 979 -276 676 -807 1249 -1520 1642 -484 267 -1148 447 -1646 447 l-87 0 -7 -352z m-23 -2998 l64 -20 24 -81 c23 -80 23 -83 7 -145 -28 -103 -32 -111 -68 -118 -235 -47 -384 25 -366 176 9 74 58 151 122 189 40 25 134 25 217 -1z"/>
                </g>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Ramais Brasilink
              </h1>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="flex-1 max-w-2xl w-full mx-auto lg:mx-0 order-3 lg:order-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-white dark:bg-gray-900 rounded-xl">
                <Search className="absolute left-4 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Buscar por nome, ramal ou departamento..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 py-6 text-base border-0 shadow-sm rounded-xl focus-visible:ring-0 bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 order-2 lg:order-3">
            <Button variant="outline" size="sm" asChild className="hidden sm:flex shadow-sm hover:shadow-md transition-all border-gray-200/60 dark:border-gray-700/60">
              <Link to="/tecnicos" className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="hidden xl:inline">Técnicos</span>
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" asChild className="hidden sm:flex shadow-sm hover:shadow-md transition-all border-gray-200/60 dark:border-gray-700/60">
              <a 
                href="http://10.29.29.136/fop2" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="hidden xl:inline">Painel</span>
              </a>
            </Button>
            
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 mx-1"></div>
            
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" asChild className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <Link to="/admin/login" title="Admin">
                <Lock className="h-4 w-4 text-gray-500" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
