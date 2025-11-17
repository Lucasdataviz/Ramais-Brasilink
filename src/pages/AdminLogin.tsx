import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAdmin } from '@/lib/supabase';
import { toast } from 'sonner';
import { Eye, EyeOff, Phone, Shield, ArrowRight, Mail, Lock, Settings, Database, Network, Home } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await loginAdmin(email, password);
      
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
        toast.success('Login realizado com sucesso!');
        navigate('/admin');
      } else {
        toast.error('Email ou senha inválidos');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Background Pattern - Código binário e linhas de telefonia */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59, 130, 246, 0.1) 2px, rgba(59, 130, 246, 0.1) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(59, 130, 246, 0.1) 2px, rgba(59, 130, 246, 0.1) 4px)
          `
        }}></div>
        
        {/* Código binário decorativo */}
        <div className="absolute top-20 left-10 text-blue-400/20 font-mono text-xs space-y-2">
          <div>01001000 01100101</div>
          <div>01101100 01101100</div>
          <div>01101111 00100000</div>
          <div>01010100 01100101</div>
          <div>01101100 01100101</div>
          <div>01100110 01101111</div>
          <div>01101110 01101001</div>
          <div>01100001 00100000</div>
        </div>
        
        <div className="absolute bottom-20 right-10 text-cyan-400/20 font-mono text-xs space-y-2">
          <div>01010010 01100001</div>
          <div>01101101 01100001</div>
          <div>01101001 01110011</div>
          <div>00100000 01000010</div>
          <div>01110010 01100001</div>
          <div>01110011 01101001</div>
          <div>01101100 01101001</div>
          <div>01101110 01101011</div>
        </div>

        {/* Linhas de conexão animadas */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path
            d="M 0,150 Q 200,100 400,150 T 800,150 T 1200,150"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
          <path
            d="M 0,300 Q 300,250 600,300 T 1200,300"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <path
            d="M 0,450 Q 250,400 500,450 T 1000,450 T 1500,450"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            className="animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </svg>

        {/* Elementos 3D animados no background - Telefonia, Gerenciamento e Tecnologia */}
        <div className="absolute top-20 right-20 w-40 h-40 opacity-10 animate-float-rotate">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl animate-glow-pulse"></div>
            <Phone className="relative w-full h-full text-blue-400 transform rotate-12" />
          </div>
        </div>
        <div className="absolute bottom-20 left-20 w-32 h-32 opacity-10 animate-float-delayed">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-2xl animate-glow-pulse" style={{ animationDelay: '1s' }}></div>
            <Settings className="relative w-full h-full text-cyan-400 transform -rotate-12 animate-spin" style={{ animationDuration: '15s' }} />
          </div>
        </div>
        <div className="absolute top-1/2 right-10 w-24 h-24 opacity-8 animate-float-slow">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl"></div>
            <Network className="relative w-full h-full text-purple-400" />
          </div>
        </div>
        <div className="absolute bottom-32 right-1/4 w-20 h-20 opacity-6 animate-float">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg"></div>
            <Database className="relative w-full h-full text-blue-300" />
          </div>
        </div>
        <div className="absolute top-1/3 left-10 w-28 h-28 opacity-8 animate-float-delayed">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
            <Phone className="relative w-full h-full text-green-400 transform rotate-45" />
          </div>
        </div>
        <div className="absolute bottom-1/3 left-1/4 w-16 h-16 opacity-6 animate-float-slow">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-lg"></div>
            <Settings className="relative w-full h-full text-cyan-300" />
          </div>
        </div>
        <div className="absolute top-1/4 right-1/3 w-16 h-16 opacity-7 animate-float">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-lg"></div>
            <Network className="relative w-full h-full text-purple-300" />
          </div>
        </div>
      </div>

      {/* Painel Esquerdo - Informações com elementos 3D */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 relative z-10">
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-8">
            <Settings className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Painel Administrativo</span>
          </div>

          {/* Título */}
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            Gerenciamento de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Telefonia</span>
          </h1>

          {/* Descrição */}
          <p className="text-lg text-gray-300 mb-12 max-w-md">
            Controle completo do sistema de ramais. Gerencie departamentos, usuários, técnicos e configurações de acesso de forma centralizada e intuitiva.
          </p>

          {/* Elementos 3D - Ícones parados */}
          <div className="grid grid-cols-3 gap-6">
            {/* Telefone 3D */}
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-lg shadow-blue-500/20">
                <Phone className="w-8 h-8 text-blue-400 mx-auto" />
              </div>
            </div>

            {/* Database 3D */}
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                <Database className="w-8 h-8 text-cyan-400 mx-auto" />
              </div>
            </div>

            {/* Network 3D */}
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-500/30 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-lg shadow-purple-500/20">
                <Network className="w-8 h-8 text-purple-400 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Painel Direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Logo/Ícone 3D */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 transform hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Título do Formulário */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo</h2>
              <p className="text-gray-400">Acesse o painel administrativo</p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent text-gray-400 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Entrar
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Link de acesso e botão voltar */}
            <div className="mt-6 space-y-3">
              <Button
                variant="outline"
                className="w-full border-slate-700 text-gray-300 hover:bg-slate-700/50 hover:text-white"
                asChild
              >
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div className="text-center">
                <Link 
                  to="/" 
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Não tem uma conta? <span className="text-blue-400 font-medium">Acessar dashboard público</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Badge de segurança */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Sistema protegido e seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
