import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";

interface LogEntry {
    id: string;
    created_at: string;
    usuario_id: string;
    tabela: string;
    acao: string;
    registro_id: string;
    dados_anteriores: unknown;
    dados_novos: unknown;
    profiles: { email: string } | null;
}

const Historico = () => {
    const [tabela, setTabela] = useState("Todas");
    const [periodo, setPeriodo] = useState("7");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { data: logs, isLoading } = useQuery({
        queryKey: ["log-atualizacoes", tabela, periodo],
        queryFn: async () => {
            let query = supabase
                .from("log_atualizacoes")
                .select("*, profiles!log_atualizacoes_usuario_id_fkey(email)")
                .order("created_at", { ascending: false })
                .limit(100);

            if (tabela !== "Todas") {
                query = query.eq("tabela", tabela);
            }

            if (periodo !== "Todos") {
                const date = new Date();
                date.setDate(date.getDate() - parseInt(periodo));
                query = query.gte("created_at", date.toISOString());
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as LogEntry[];
        },
    });

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <AppLayout>
            <div className="space-y-6 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-foreground">Histórico de Alterações</h1>

                <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Tabela</span>
                        <Select value={tabela} onValueChange={setTabela}>
                            <SelectTrigger className="w-40 bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Todas">Todas</SelectItem>
                                <SelectItem value="dados_kpis">dados_kpis</SelectItem>
                                <SelectItem value="financeiro">financeiro</SelectItem>
                                <SelectItem value="config_kpis">config_kpis</SelectItem>
                                <SelectItem value="profiles">profiles</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Período</span>
                        <Select value={periodo} onValueChange={setPeriodo}>
                            <SelectTrigger className="w-40 bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Últimos 7 dias</SelectItem>
                                <SelectItem value="30">Últimos 30 dias</SelectItem>
                                <SelectItem value="90">Últimos 90 dias</SelectItem>
                                <SelectItem value="Todos">Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center space-y-3">
                            <div className="animate-spin h-8 w-8 border-4 border-[#ad93bf] border-t-transparent rounded-full mx-auto" />
                            <p className="text-muted-foreground text-sm">Carregando log...</p>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border bg-card overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead>Data/Hora</TableHead>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Tabela</TableHead>
                                    <TableHead>Ação</TableHead>
                                    <TableHead>Registro</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs?.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <TableRow
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleExpand(log.id)}
                                        >
                                            <TableCell>
                                                {expandedId === log.id ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString("pt-BR")}
                                            </TableCell>
                                            <TableCell>{log.profiles?.email || "Sistema"}</TableCell>
                                            <TableCell>{log.tabela}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${log.acao === 'INSERT' ? 'bg-green-100 text-green-700' :
                                                    log.acao === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {log.acao}
                                                </span>
                                            </TableCell>
                                            <TableCell className="truncate max-w-[150px]" title={log.registro_id}>
                                                {log.registro_id}
                                            </TableCell>
                                        </TableRow>
                                        {expandedId === log.id && (
                                            <TableRow className="bg-muted/30">
                                                <TableCell colSpan={6} className="p-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm font-semibold mb-2">Dados Anteriores</p>
                                                            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                                                {JSON.stringify(log.dados_anteriores, null, 2)}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold mb-2">Dados Novos</p>
                                                            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                                                {JSON.stringify(log.dados_novos, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                                {logs?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhum registro encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default Historico;
