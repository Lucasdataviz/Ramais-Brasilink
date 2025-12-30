import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Ramal, Departamento } from "@/lib/types";

interface DashboardChartsProps {
    ramais: Ramal[];
    departamentos: Departamento[];
}

export const DashboardCharts = ({ ramais, departamentos }: DashboardChartsProps) => {
    // Data for Ramais per Status (Pie Chart)
    const ativos = ramais.filter(r => r.status === 'ativo').length;
    const inativos = ramais.filter(r => r.status === 'inativo').length;

    const statusData = [
        { name: 'Ativos', value: ativos, color: '#22c55e' },
        { name: 'Inativos', value: inativos, color: '#ef4444' },
    ];

    // Data for Ramais per Department (Bar Chart) - Top 5
    const deptData = departamentos.map(dept => {
        const count = ramais.filter(r => r.departamento === dept.id || r.departamento === dept.nome).length;
        return {
            name: dept.nome,
            ramais: count
        };
    })
        .sort((a, b) => b.ramais - a.ramais)
        .slice(0, 5);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
            <Card className="col-span-4 border-2 shadow-md">
                <CardHeader>
                    <CardTitle>Ramais por Departamento</CardTitle>
                    <CardDescription>Top 5 departamentos com mais ramais</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="ramais" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-3 border-2 shadow-md">
                <CardHeader>
                    <CardTitle>Status dos Ramais</CardTitle>
                    <CardDescription>Distribuição Ativos vs Inativos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
