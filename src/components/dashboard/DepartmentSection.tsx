import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, X, ChevronDown, ChevronUp, Users, UserCog, Star } from 'lucide-react';
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

export const DepartmentSection = ({
    groupedDepartments,
    expandedDepartment,
    toggleDepartment,
}: DepartmentSectionProps) => {
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        if (!expandedDepartment) return;
        requestAnimationFrame(() => {
            cardRefs.current[expandedDepartment]?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    }, [expandedDepartment]);

    const getBackgroundColor = (dept: Departamento | undefined) => {
        return dept?.cor || '#6366f1';
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 auto-rows-min">
            {groupedDepartments.map(({ department, departmentInfo, extensions: deptExtensions }) => {
                if (deptExtensions.length === 0 || departmentInfo?.departamento_pai) return null;

                const departmentId = departmentInfo?.id || department;
                const isExpanded = expandedDepartment === departmentId;
                const deptColor = getBackgroundColor(departmentInfo);

                const renderIcon = () => {
                    const IconFound = getIcon(departmentInfo?.icone);
                    const FinalIcon = (IconFound && (typeof IconFound === 'function' || typeof IconFound === 'object')) ? IconFound : Building2;
                    const Icon = FinalIcon as any;
                    return <Icon className="h-8 w-8" />;
                };

                return (
                    <div
                        key={department}
                        className={`relative ${isExpanded ? 'col-span-full' : 'col-span-1'}`}
                        ref={(el) => { cardRefs.current[departmentId] = el; }}
                    >
                        {/* Department Card */}
                        {!isExpanded ? (
                            <div
                                className="group relative rounded-2xl overflow-hidden glass-card card-lift cursor-pointer select-none"
                                onClick={() => toggleDepartment(departmentId)}
                                style={{ transition: 'box-shadow 0.3s, transform 0.3s' }}
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 2px ${deptColor}60, 0 8px 30px ${deptColor}25`;
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                                }}
                            >
                                {/* Top gradient accent */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                                    style={{ background: `linear-gradient(90deg, ${deptColor}99, ${deptColor})` }}
                                />

                                {/* Clickable indicator — top right corner */}
                                <div
                                    className="absolute top-2.5 right-2.5 p-1 rounded-lg opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                                    style={{ backgroundColor: `${deptColor}20`, color: deptColor }}
                                >
                                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300" />
                                </div>

                                {/* Background color blob */}
                                <div
                                    className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2"
                                    style={{ backgroundColor: deptColor }}
                                />

                                <div className="p-6 flex flex-col items-center text-center space-y-3 relative z-10">
                                    {/* Icon container */}
                                    <div
                                        className="p-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110"
                                        style={{
                                            backgroundColor: `${deptColor}18`,
                                            color: deptColor,
                                            boxShadow: `0 4px 20px ${deptColor}25`,
                                        }}
                                    >
                                        {renderIcon()}
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-bold text-sm md:text-base text-foreground line-clamp-2 leading-snug">
                                            {departmentInfo?.nome || department}
                                        </h3>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Users className="h-3 w-3 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {deptExtensions.length} {deptExtensions.length === 1 ? 'ramal' : 'ramais'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bottom expand hint — always slightly visible */}
                                    <div className="flex items-center gap-1 text-xs opacity-30 group-hover:opacity-100 transition-opacity duration-300" style={{ color: deptColor }}>
                                        <ChevronDown className="h-3 w-3" />
                                        <span className="font-medium">Ver ramais</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Compact collapsed card when another is expanded */
                            null
                        )}

                        {/* Expanded Panel */}
                        {isExpanded && (
                            <div className="animate-in slide-in-from-top-3 duration-300 fade-in">
                                <div
                                    className="relative rounded-2xl overflow-hidden glass-card"
                                    style={{ borderTop: `3px solid ${deptColor}` }}
                                >
                                        <div className="flex items-start justify-between px-6 py-5"
                                         style={{ background: `linear-gradient(135deg, ${deptColor}12, ${deptColor}04)` }}
                                        >
                                            {/* Left: icon + name + meta */}
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="p-3 rounded-xl shadow-md shrink-0"
                                                    style={{
                                                        backgroundColor: `${deptColor}18`,
                                                        color: deptColor,
                                                        boxShadow: `0 4px 16px ${deptColor}30`,
                                                    }}
                                                >
                                                    {renderIcon()}
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <h2 className="text-xl font-bold text-foreground leading-tight">
                                                        {departmentInfo?.nome || department}
                                                    </h2>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {/* Ramal count badge */}
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                                                            <Users className="h-3 w-3" />
                                                            {deptExtensions.length} {deptExtensions.length === 1 ? 'ramal' : 'ramais'}
                                                        </span>
                                                        {/* Supervisor badge */}
                                                        {departmentInfo?.supervisor && (
                                                            <span
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                                                                style={{
                                                                    backgroundColor: `${deptColor}12`,
                                                                    color: deptColor,
                                                                    borderColor: `${deptColor}30`,
                                                                }}
                                                            >
                                                                <UserCog className="h-3 w-3" />
                                                                Supervisor: {departmentInfo.supervisor}
                                                            </span>
                                                        )}
                                                        {/* Coordenador badge */}
                                                        {departmentInfo?.coordenador && (
                                                            <span
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                                                                style={{
                                                                    backgroundColor: `${deptColor}18`,
                                                                    color: deptColor,
                                                                    borderColor: `${deptColor}30`,
                                                                }}
                                                            >
                                                                <Star className="h-3 w-3" />
                                                                Coord: {departmentInfo.coordenador}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Close button */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDepartment(departmentId);
                                                }}
                                                className="h-9 w-9 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
                                                title="Fechar"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>

                                    {/* Extension cards grid */}
                                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                                            {deptExtensions.map((ext) => (
                                                <ExtensionCard key={ext.id} extension={ext} showShortNumber={true} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Collapse button at bottom */}
                                    <div className="px-6 pb-4 flex justify-center border-t border-border/30 pt-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleDepartment(departmentId)}
                                            className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
                                        >
                                            <ChevronUp className="h-3.5 w-3.5" />
                                            Recolher
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
