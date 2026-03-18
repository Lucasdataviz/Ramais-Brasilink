import { 
  Building2, Wrench, Users, Headphones, Server, 
  Network, CreditCard, Shield, FileText, MessageSquare, HelpCircle, Phone, 
  Radio, Cable, Router, HardDrive, Database, Monitor, Smartphone, Laptop, 
  Mail, Calendar, Clock, Settings, Briefcase, PhoneCall, PhoneIncoming, PhoneOutgoing,
  DollarSign, Receipt, Wallet, TrendingUp, TrendingDown, Banknote, Coins,
  Megaphone, Volume2, AlertCircle, MessageCircle, UserCheck, UserPlus,
  // Novos ícones premium
  Wifi, Globe, Cpu, Zap, BarChart2, PieChart, LineChart,
  Truck, Package, MapPin, Navigation,
  Home, Building, Factory, Warehouse,
  Heart, Activity, Stethoscope,
  GraduationCap, BookOpen, Library,
  ShoppingCart, ShoppingBag, Store,
  Camera, Video, Image, Film,
  Lock, Key, Eye, Fingerprint,
  Star, Award, Trophy, Medal,
  Lightbulb, Hammer, Cog, Tool,
  Printer, Scan, QrCode,
  CloudLightning, Cloud, CloudUpload, Download,
  Bell, BellRing, 
  UserCog, Users2, PersonStanding,
  Headset, Mic, Speaker,
  LayoutDashboard, Layers, Grid3x3,
  ChartBar, ChartPie,
  Send, Inbox, AtSign,
  Landmark, PiggyBank, Percent,
  Wrench as WrenchIcon, Plug, Power
} from 'lucide-react';

// Mapeamento de ícones compartilhado entre Index e Admin
export const ICON_MAP: Record<string, any> = {
  // ── Genérico ──
  'Empresa': Building2,
  'Empresa Principal': Building,
  'Matriz': Landmark,
  'Filial': Building2,

  // ── Atendimento & SAC ──
  'Atendimento': Headphones,
  'SAC': MessageCircle,
  'Call Center': Headset,
  'Central de Atendimento': Headset,
  'Suporte': HelpCircle,
  'Suporte Técnico': WrenchIcon,
  'Atendimento ao Cliente': MessageCircle,
  'Atendimento Telefônico': PhoneCall,
  'Ouvidoria': Megaphone,
  'Reclamação': AlertCircle,
  'Atendente': UserCheck,
  'Operador': UserPlus,
  'Receptivo': PhoneIncoming,
  'Ativo': PhoneOutgoing,

  // ── TI & Infraestrutura ──
  'TI': Cpu,
  'Tecnologia': Cpu,
  'Infraestrutura': Server,
  'Rede': Network,
  'Redes': Wifi,
  'NOC': Monitor,
  'DevOps': CloudLightning,
  'Cloud': Cloud,
  'Servidor': Server,
  'Roteador': Router,
  'Banco de Dados': Database,
  'Armazenamento': HardDrive,
  'Monitor': Monitor,
  'Notebook': Laptop,
  'Celular': Smartphone,
  'Impressora': Printer,
  'Scanner': Scan,

  // ── Telecomunicações ──
  'Telefonia': Phone,
  'Telefone': Phone,
  'Chamada': PhoneCall,
  'Entrada': PhoneIncoming,
  'Saída': PhoneOutgoing,
  'Rádio': Radio,
  'Cabo': Cable,
  'Internet': Globe,
  'Fibra': Zap,
  'Wireless': Wifi,

  // ── Financeiro ──
  'Financeiro': DollarSign,
  'Finanças': Coins,
  'Contabilidade': Receipt,
  'Contas': Receipt,
  'Cobrança': Banknote,
  'Receita': TrendingUp,
  'Despesa': TrendingDown,
  'Dinheiro': Banknote,
  'Moeda': Coins,
  'Carteira': Wallet,
  'Faturamento': Receipt,
  'Tesouraria': PiggyBank,
  'Caixa': CreditCard,
  'Banco': Landmark,
  'Juros': Percent,
  'Investimentos': TrendingUp,

  // ── Administrativo & RH ──
  'Administração': Briefcase,
  'Administrativo': Briefcase,
  'RH': Users2,
  'Recursos Humanos': Users2,
  'Pessoal': PersonStanding,
  'Funcionários': Users,
  'Diretoria': Award,
  'Gerência': Star,
  'Presidência': Trophy,
  'Coordenação': Medal,
  'Secretaria': FileText,
  'Juridico': Shield,
  'Jurídico': Shield,
  'Compliance': Shield,

  // ── Vendas & Marketing ──
  'Vendas': ShoppingCart,
  'Comercial': ShoppingBag,
  'Marketing': Megaphone,
  'E-commerce': Store,
  'Loja': Store,
  'Publicidade': Volume2,
  'Comunicação': Send,
  'Mídia': Film,
  'Design': Image,

  // ── Logística & Operações ──
  'Logística': Truck,
  'Estoque': Package,
  'Almoxarifado': Warehouse,
  'Operações': Cog,
  'Entrega': Truck,
  'Localização': MapPin,
  'Rotas': Navigation,
  'Campo': MapPin,

  // ── Análise & BI ──
  'BI': BarChart2,
  'Business Intelligence': BarChart2,
  'Relatórios': PieChart,
  'Analytics': LineChart,
  'Dados': Database,
  'Estatística': ChartBar,

  // ── Segurança ──
  'Segurança': Shield,
  'Segurança da Informação': Fingerprint,
  'Acesso': Key,
  'Monitoramento': Eye,
  'Vigilância': Camera,
  'CFTV': Video,

  // ── Outros setores ──
  'Email': Mail,
  'Agenda': Calendar,
  'Relógio': Clock,
  'Configurações': Settings,
  'Negócios': Briefcase,
  'Treinamento': GraduationCap,
  'Capacitação': BookOpen,
  'Biblioteca': Library,
  'Saúde': Heart,
  'Medicina': Stethoscope,
  'Facilities': Home,
  'Manutenção': Hammer,
  'Elétrica': Plug,
  'Energia': Power,
  'Projetos': Layers,
  'Dashboard': LayoutDashboard,
  'Notificações': BellRing,
  'Alertas': Bell,
  'Integração': Grid3x3,
  'Inbox': Inbox,
  'Contato': AtSign,
};

// Busca inteligente: tenta encontrar ícone por palavra-chave no nome
const KEYWORD_MAP: Array<{ keywords: string[]; icon: any }> = [
  { keywords: ['atend', 'sac', 'call', 'headset', 'suporte'], icon: Headset },
  { keywords: ['ti ', ' ti', 'tecnol', 'infra', 'noc', 'devops'], icon: Cpu },
  { keywords: ['rede', 'network', 'wifi', 'wireless', 'fibra', 'internet'], icon: Wifi },
  { keywords: ['telefon', 'ramal', 'voip', 'pbx', 'pabx', 'chamad'], icon: Phone },
  { keywords: ['financ', 'contab', 'cobran', 'fatur', 'tesour', 'caixa', 'banco'], icon: Coins },
  { keywords: ['rh ', ' rh', 'recursos human', 'pessoal', 'funcionár'], icon: Users2 },
  { keywords: ['admin', 'secretar', 'juridic', 'compli'], icon: Briefcase },
  { keywords: ['vend', 'comerci', 'loja', 'e-comm', 'store'], icon: ShoppingCart },
  { keywords: ['market', 'publicid', 'comunic', 'mídia', 'design'], icon: Megaphone },
  { keywords: ['logíst', 'logist', 'estoque', 'almox', 'entrega', 'caminhão'], icon: Truck },
  { keywords: ['operaç', 'campo', 'manut'], icon: Cog },
  { keywords: ['segur', 'vigilân', 'acesso', 'monitor'], icon: Shield },
  { keywords: ['diretor', 'gerênc', 'president', 'coordena'], icon: Award },
  { keywords: ['dados', 'bi ', ' bi', 'relat', 'analyt', 'estatíst'], icon: BarChart2 },
  { keywords: ['servidor', 'server', 'cloud', 'banco de dado', 'database'], icon: Server },
];

export const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return Building2;
  
  // Busca exata primeiro
  if (ICON_MAP[iconName]) return ICON_MAP[iconName];
  
  // Busca case-insensitive
  const nameLower = iconName.toLowerCase();
  const exactKey = Object.keys(ICON_MAP).find(k => k.toLowerCase() === nameLower);
  if (exactKey) return ICON_MAP[exactKey];
  
  // Busca por palavra-chave inteligente
  for (const { keywords, icon } of KEYWORD_MAP) {
    if (keywords.some(kw => nameLower.includes(kw))) {
      return icon;
    }
  }
  
  return Building2;
};

// Lista de ícones predefinidos para seleção no Admin
export const PREDEFINED_ICONS = [
  { name: 'Empresa', icon: Building2 },
  { name: 'Atendimento', icon: Headset },
  { name: 'SAC', icon: MessageCircle },
  { name: 'Call Center', icon: Headset },
  { name: 'TI', icon: Cpu },
  { name: 'Infraestrutura', icon: Server },
  { name: 'Rede', icon: Wifi },
  { name: 'NOC', icon: Monitor },
  { name: 'Telefonia', icon: Phone },
  { name: 'Internet', icon: Globe },
  { name: 'Fibra', icon: Zap },
  { name: 'Financeiro', icon: Coins },
  { name: 'Faturamento', icon: Receipt },
  { name: 'Cobrança', icon: Banknote },
  { name: 'Tesouraria', icon: PiggyBank },
  { name: 'Caixa', icon: CreditCard },
  { name: 'Administração', icon: Briefcase },
  { name: 'RH', icon: Users2 },
  { name: 'Funcionários', icon: Users },
  { name: 'Diretoria', icon: Award },
  { name: 'Gerência', icon: Star },
  { name: 'Vendas', icon: ShoppingCart },
  { name: 'Comercial', icon: ShoppingBag },
  { name: 'Marketing', icon: Megaphone },
  { name: 'Logística', icon: Truck },
  { name: 'Estoque', icon: Package },
  { name: 'Operações', icon: Cog },
  { name: 'Segurança', icon: Shield },
  { name: 'Suporte', icon: HelpCircle },
  { name: 'Suporte Técnico', icon: Wrench },
  { name: 'Técnico', icon: Wrench },
  { name: 'Ouvidoria', icon: Megaphone },
  { name: 'BI', icon: BarChart2 },
  { name: 'Relatórios', icon: PieChart },
  { name: 'Email', icon: Mail },
  { name: 'Projetos', icon: Layers },
  { name: 'Treinamento', icon: GraduationCap },
  { name: 'Manutenção', icon: Hammer },
  { name: 'Configurações', icon: Settings },
  { name: 'Roteador', icon: Router },
  { name: 'Banco de Dados', icon: Database },
  { name: 'Celular', icon: Smartphone },
  { name: 'Notebook', icon: Laptop },
  { name: 'Monitor', icon: Monitor },
  { name: 'Rádio', icon: Radio },
  { name: 'Cabo', icon: Cable },
  { name: 'Armazenamento', icon: HardDrive },
  { name: 'Agenda', icon: Calendar },
  { name: 'Negócios', icon: Briefcase },
  { name: 'Chamada', icon: PhoneCall },
  { name: 'Entrada', icon: PhoneIncoming },
  { name: 'Saída', icon: PhoneOutgoing },
  { name: 'Juridico', icon: Shield },
  { name: 'Notificações', icon: BellRing },
];
