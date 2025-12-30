import { useState } from 'react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Users, ChevronUp, ChevronDown, UserCheck, User } from 'lucide-react';
import { SupervisorCoordenadorCard } from '@/components/SupervisorCoordenadorCard';
import { Extension } from '@/lib/types';

interface SupervisorsCardProps {
    extensions: Extension[];
}

export const SupervisorsCard = ({ extensions }: SupervisorsCardProps) => {
    const [expanded, setExpanded] = useState(false);

    const supervisores = extensions.filter(ext => ext.metadata?.supervisor === true);
    const coordenadores = extensions.filter(ext => ext.metadata?.coordenador === true);

    if (supervisores.length === 0 && coordenadores.length === 0) return null;

    return (
        <div className="mb-8">
            <Card
                className="border border-gray-200/50 dark:border-gray-800/50 shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
                onClick={() => setExpanded(!expanded)}
            >
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-200/30 dark:border-blue-800/30">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    Supervisores e Coordenadores
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {supervisores.length} {supervisores.length === 1 ? 'supervisor' : 'supervisores'} • {coordenadores.length} {coordenadores.length === 1 ? 'coordenador' : 'coordenadores'}
                                </p>
                            </div>
                        </div>
                        {expanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                </CardContent>
            </Card>

            {expanded && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Card de Supervisores */}
                    <Card className="border border-blue-200/30 dark:border-blue-800/30 shadow-lg bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/20 dark:to-transparent backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                                    <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                Supervisores
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {supervisores.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Nenhum supervisor cadastrado
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {supervisores.map((ext) => (
                                        <SupervisorCoordenadorCard
                                            key={ext.id}
                                            extension={ext}
                                            tipo="supervisor"
                                            showShortNumber={true}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card de Coordenadores */}
                    <Card className="border border-purple-200/30 dark:border-purple-800/30 shadow-lg bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-950/20 dark:to-transparent backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                Coordenadores
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {coordenadores.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Nenhum coordenador cadastrado
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {coordenadores.map((ext) => (
                                        <SupervisorCoordenadorCard
                                            key={ext.id}
                                            extension={ext}
                                            tipo="coordenador"
                                            showShortNumber={true}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
