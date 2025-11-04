import { Extension, Queue } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ExtensionCardProps {
  extension: Extension;
  queue?: Queue;
}

export const ExtensionCard = ({ extension, queue }: ExtensionCardProps) => {
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
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{extension.name}</h3>
          <p className="text-sm text-muted-foreground">{extension.department}</p>
        </div>
        <Badge className={getStatusColor(extension.status)}>
          {getStatusLabel(extension.status)}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-mono font-semibold text-foreground">
            {extension.number}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(extension.number)}
            className="ml-auto"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {queue && (
          <div className="pt-2 border-t border-border">
            <span
              className="inline-block px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: queue.color + '20',
                color: queue.color,
              }}
            >
              {queue.name}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
