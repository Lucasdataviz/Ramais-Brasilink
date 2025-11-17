import { 
  Building2, Wrench, Users, Headphones, Server, 
  Network, CreditCard, Shield, FileText, MessageSquare, HelpCircle, Phone, 
  Radio, Cable, Router, HardDrive, Database, Monitor, Smartphone, Laptop, 
  Mail, Calendar, Clock, Settings, Briefcase, PhoneCall, PhoneIncoming, PhoneOutgoing,
  DollarSign, Receipt, Wallet, TrendingUp, TrendingDown, Banknote, Coins,
  Megaphone, Volume2, AlertCircle, MessageCircle, UserCheck, UserPlus
} from 'lucide-react';

// Mapeamento de ícones compartilhado entre Index e Admin
export const ICON_MAP: Record<string, any> = {
  'Empresa': Building2,
  'Atendimento': Headphones,
  'TI': Server,
  'Rede': Network,
  'Caixa': CreditCard,
  'Técnico': Wrench,
  'Segurança': Shield,
  'Administração': FileText,
  'SAC': MessageSquare,
  'Funcionários': Users,
  'Suporte': HelpCircle,
  'Telefonia': Phone,
  'Rádio': Radio,
  'Cabo': Cable,
  'Roteador': Router,
  'Armazenamento': HardDrive,
  'Banco de Dados': Database,
  'Monitor': Monitor,
  'Celular': Smartphone,
  'Notebook': Laptop,
  'Email': Mail,
  'Agenda': Calendar,
  'Relógio': Clock,
  'Configurações': Settings,
  'Negócios': Briefcase,
  // Ícones relacionados a telefone
  'Telefone': Phone,
  'Chamada': PhoneCall,
  'Entrada': PhoneIncoming,
  'Saída': PhoneOutgoing,
  // Ícones relacionados a financeiro
  'Financeiro': DollarSign,
  'Finanças': DollarSign,
  'Contas': Receipt,
  'Carteira': Wallet,
  'Receita': TrendingUp,
  'Despesa': TrendingDown,
  'Dinheiro': Banknote,
  'Moeda': Coins,
  // Ícones relacionados a ouvidoria e atendimento
  'Ouvidoria': Megaphone,
  'Reclamação': AlertCircle,
  'Atendimento ao Cliente': MessageCircle,
  'Atendimento Telefônico': PhoneCall,
  'Central de Atendimento': Headphones,
  'Call Center': PhoneCall,
  'Atendente': UserCheck,
  'Operador': UserPlus,
};

export const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return Building2;
  return ICON_MAP[iconName] || Building2;
};

// Lista de ícones predefinidos para seleção
export const PREDEFINED_ICONS = [
  { name: 'Empresa', icon: Building2 },
  { name: 'Atendimento', icon: Headphones },
  { name: 'TI', icon: Server },
  { name: 'Rede', icon: Network },
  { name: 'Caixa', icon: CreditCard },
  { name: 'Técnico', icon: Wrench },
  { name: 'Segurança', icon: Shield },
  { name: 'Administração', icon: FileText },
  { name: 'SAC', icon: MessageSquare },
  { name: 'Funcionários', icon: Users },
  { name: 'Suporte', icon: HelpCircle },
  { name: 'Telefonia', icon: Phone },
  { name: 'Rádio', icon: Radio },
  { name: 'Cabo', icon: Cable },
  { name: 'Roteador', icon: Router },
  { name: 'Armazenamento', icon: HardDrive },
  { name: 'Banco de Dados', icon: Database },
  { name: 'Monitor', icon: Monitor },
  { name: 'Celular', icon: Smartphone },
  { name: 'Notebook', icon: Laptop },
  { name: 'Email', icon: Mail },
  { name: 'Agenda', icon: Calendar },
  { name: 'Relógio', icon: Clock },
  { name: 'Configurações', icon: Settings },
  { name: 'Negócios', icon: Briefcase },
  // Ícones relacionados a telefone
  { name: 'Telefone', icon: Phone },
  { name: 'Chamada', icon: PhoneCall },
  { name: 'Entrada', icon: PhoneIncoming },
  { name: 'Saída', icon: PhoneOutgoing },
  // Ícones relacionados a financeiro
  { name: 'Financeiro', icon: DollarSign },
  { name: 'Finanças', icon: DollarSign },
  { name: 'Contas', icon: Receipt },
  { name: 'Carteira', icon: Wallet },
  { name: 'Receita', icon: TrendingUp },
  { name: 'Despesa', icon: TrendingDown },
  { name: 'Dinheiro', icon: Banknote },
  { name: 'Moeda', icon: Coins },
  // Ícones relacionados a ouvidoria e atendimento
  { name: 'Ouvidoria', icon: Megaphone },
  { name: 'Reclamação', icon: AlertCircle },
  { name: 'Atendimento ao Cliente', icon: MessageCircle },
  { name: 'Atendimento Telefônico', icon: PhoneCall },
  { name: 'Central de Atendimento', icon: Headphones },
  { name: 'Call Center', icon: PhoneCall },
  { name: 'Atendente', icon: UserCheck },
  { name: 'Operador', icon: UserPlus },
];

