import { useRef, useEffect } from 'react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, X, ChevronUp, ChevronDown, User } from 'lucide-react';
import { ExtensionCard } from '@/components/ExtensionCard';
import { Departamento, Extension } from '@/lib/types';
import { getIconComponent as getIcon } from '@/lib/icons';

interface DepartmentSectionProps {
    groupedDepartments: Array<{
        department: string;
        departmentInfo: Departamento;
        extensions: Extension[];
    }>;
    expandedDepartment: string | null;
    toggleDepartment: (id: string) => void;
    filteredExtensions: Extension[];
}

const getIconHelper = (iconName: string | undefined) => {
    if (!iconName) return <Building2 className="h-5 w-5" />;
    const IconComponent = getIcon(iconName);
    if (typeof IconComponent === 'function' || typeof IconComponent === 'object') {
        const Icon = IconComponent as any;
        return <Icon className="h-5 w-5" />; // Keep consistency with size
    }
    return <Building2 className="h-5 w-5" />;
};

const getBackgroundColor = (dept: Departamento | undefined) => {
    if (dept?.cor) {
        return dept.cor;
    }
    return '#6b7280';
};

export const DepartmentSection = ({
    groupedDepartments,
    expandedDepartment,
    toggleDepartment,
}: DepartmentSectionProps) => {
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        if (!expandedDepartment) return;
        // Quando abrir, ir para o card
        requestAnimationFrame(() => {
            cardRefs.current[expandedDepartment]?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    }, [expandedDepartment]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-min">
            {groupedDepartments.map(
                ({ department, departmentInfo, extensions: deptExtensions }) => {
                    if (deptExtensions.length === 0 || departmentInfo?.departamento_pai) return null;

                    const departmentId = departmentInfo?.id || department;
                    const isExpanded = expandedDepartment === departmentId;
                    const IconComponent = getIcon(departmentInfo?.icone) || Building2;
                    const Icon = typeof IconComponent === 'function' ? IconComponent : Building2; // Handle type safety better if needed
                    // Using helper directly inside render for simplicity or using the one from lib directly if simple

                    // Re-implementing the icon render logic from Index.tsx to be safe
                    const renderIcon = () => {
                        const IconFound = getIcon(departmentInfo?.icone);
                        const FinalIcon = (IconFound && (typeof IconFound === 'function' || typeof IconFound === 'object')) ? IconFound : Building2;
                        const Icon = FinalIcon as any;
                        return <Icon className="h-8 w-8" />;
                    }

                    return (
                        <div
                            key={department}
                            className={`relative ${isExpanded ? 'col-span-full' : 'col-span-1'}`}
                            ref={(el) => {
                                cardRefs.current[departmentId] = el;
                            }}
                        >
                            <Card
                                className={`
                  cursor-pointer border-2 shadow-lg transition-all duration-300 ease-in-out
                  ${!isExpanded ? 'hover:shadow-2xl hover:-translate-y-2 hover:scale-105 hover:rotate-1 active:scale-95' : ''}
                  ${isExpanded ? 'ring-2 ring-offset-2' : ''}
                  bg-white dark:bg-gray-900
                `}
                                style={{
                                    borderColor: getBackgroundColor(departmentInfo),
                                    // ringColor is not a valid style prop, handling via class or custom var if needed, but Tailwind ring util uses current color usually or specific class
                                    // Using style for dynamic colors in borders is fine.
                                }}
                                onClick={() => toggleDepartment(departmentId)}
                            >
                                <CardContent className={`p-6 flex flex-col items-center justify-center text-center space-y-3 ${isExpanded ? 'pointer-events-none' : ''}`}>
                                    <div
                                        className={`p-4 rounded-full transition-transform duration-300 ${!isExpanded ? 'hover:scale-110' : ''}`}
                                        style={{
                                            backgroundColor: `${getBackgroundColor(departmentInfo)}20`,
                                            color: getBackgroundColor(departmentInfo)
                                        }}
                                    >
                                        {renderIcon()}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base md:text-lg text-foreground line-clamp-2">
                                            {departmentInfo?.nome || department}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {deptExtensions.length} {deptExtensions.length === 1 ? 'ramal' : 'ramais'}
                                        </p>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Conteúdo expandido */}
                            {isExpanded && (
                                <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                    <Card className="border-2 shadow-lg bg-gray-50 dark:bg-gray-800/50 w-full relative">
                                        {/* Botão de fechar */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleDepartment(departmentId);
                                            }}
                                            className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                                            title="Fechar"
                                        >
                                            <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        </Button>
                                        <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
                                            {/* Supervisor e Coordenador */}
                                            {(departmentInfo?.supervisor || departmentInfo?.coordenador) && (
                                                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
                                                    {departmentInfo.supervisor && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground">Supervisor:</span>
                                                            <span className="font-medium">{departmentInfo.supervisor}</span>
                                                        </div>
                                                    )}
                                                    {departmentInfo.coordenador && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground">Coordenador:</span>
                                                            <span className="font-medium">{departmentInfo.coordenador}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {deptExtensions.map((ext) => (
                                                    <ExtensionCard key={ext.id} extension={ext} showShortNumber={true} />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    );
                }
            )}
        </div>
    );
};
