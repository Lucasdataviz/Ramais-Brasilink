import { Extension } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ExtensionCardProps {
  extension: Extension;
}

export const ExtensionCard = ({ extension }: ExtensionCardProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      case 'maintenance':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'maintenance':
        return 'Manutenção';
      default:
        return status;
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">
            {extension.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 truncate">{extension.department}</p>
        </div>
        <Badge className={`${getStatusColor(extension.status)} ml-2 shrink-0`}>
          {getStatusLabel(extension.status)}
        </Badge>
      </div>

      <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <span className="text-lg font-mono font-semibold text-foreground flex-1">
          {extension.number}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(extension.number);
          }}
          className="shrink-0 h-7 w-7 p-0"
          title="Copiar ramal"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
};
