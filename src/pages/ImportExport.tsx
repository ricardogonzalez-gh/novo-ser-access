import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { exportKpisXlsx, exportImportTemplate } from "@/lib/exportXlsx";
import { importKpisFromFile } from "@/lib/importXlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet } from "lucide-react";
import type { KpiRow } from "@/hooks/useDashboardData";
import { calcularSemaforo } from "@/lib/semaforo";

interface ImportResult {
    total: number;
    inseridos: number;
    atualizados: number;
    erros: { linha: number; mensagem: string }[];
}

const ImportExport = () => {
    const [periodo, setPeriodo] = useState("2026-T1");
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const { toast } = useToast();
    const { profile } = useAuth();

    // Apenas admin pode importar
    const canImport = profile?.role === "admin";

    // Query KPIs para export
    const { data: kpis } = useQuery({
        queryKey: ["kpis-export", periodo],
        queryFn: async () => {
            // 1. fetch config_kpis
            const { data: configKpis, error: errKpi } = await supabase
                .from("config_kpis")
                .select("*")
                .eq("tipo", "estrategico")
                .order("codigo");
            if (errKpi) throw errKpi;

            // 2. fetch dados_kpis do periodo
            const isAnual = periodo.endsWith("-Anual");
            const year = periodo.split("-")[0];

            let query = supabase.from("dados_kpis").select("*");
            if (isAnual) {
                query = query.like("periodo", `${year}-T%`).order("periodo", { ascending: true });
            } else {
                query = query.eq("periodo", periodo);
            }
            const { data: dadosKpis, error: errDados } = await query;
            if (errDados) throw errDados;

            // 3. consolidar
            const rows: KpiRow[] = configKpis.map((k) => {
                const kpiDados = dadosKpis.filter((d) => d.kpi_id === k.id);
                let valor: number | null = null;

                if (isAnual) {
                    const valores = kpiDados.map((d) => d.valor_numerico).filter((v): v is number => v !== null);
                    if (valores.length > 0) {
                        if (k.unidade === "R$" || k.unidade === "nº") {
                            valor = valores.reduce((acc, curr) => acc + curr, 0);
                        } else if (k.unidade === "%" || k.unidade === "1-5") {
                            const sum = valores.reduce((acc, curr) => acc + curr, 0);
                            valor = Number((sum / valores.length).toFixed(2));
                        } else if (k.unidade === "S/N") {
                            valor = valores[valores.length - 1];
                        } else {
                            valor = valores.reduce((acc, curr) => acc + curr, 0);
                        }
                    }
                } else {
                    valor = kpiDados.length > 0 ? kpiDados[0].valor_numerico : null;
                }

                const semaforo = calcularSemaforo(valor, k.meta_valor, k.faixa_verde ?? 80, k.faixa_amarela ?? 50);

                return {
                    id: k.id,
                    codigo: k.codigo,
                    nome: k.nome,
                    perspectiva: k.perspectiva ?? "",
                    area: k.area,
                    unidade: k.unidade,
                    meta_valor: k.meta_valor,
                    faixa_verde: k.faixa_verde,
                    faixa_amarela: k.faixa_amarela,
                    valor,
                    percentual: valor != null && k.meta_valor ? Math.round((valor / k.meta_valor) * 100) : null,
                    semaforo,
                    valorAnterior: null,
                    tendencia: null,
                } as KpiRow;
            });

            return rows;
        }
    });

    const handleImport = async () => {
        if (!file) return;
        setImporting(true);
        try {
            const res = await importKpisFromFile(file);
            setResult(res);
            if (res.erros.length === 0) {
                toast({ title: "Importação concluída", description: `${res.inseridos} inseridos, ${res.atualizados} atualizados` });
            } else {
                toast({ title: "Importação com erros", description: `${res.erros.length} erros encontrados`, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Erro na importação", description: String(e), variant: "destructive" });
        }
        setImporting(false);
    };

    return (
        <AppLayout>
            <div className="space-y-8 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold">Importar / Exportar Dados</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Exportar Dados</CardTitle>
                        <CardDescription>Exporte os KPIs do período selecionado para planilha</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select value={periodo} onValueChange={setPeriodo}>
                            <SelectTrigger className="w-36 bg-[#fafbfc] border-[#f0f0f0] rounded-lg h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2026-T1">2026 — T1</SelectItem>
                                <SelectItem value="2026-T2">2026 — T2</SelectItem>
                                <SelectItem value="2026-T3">2026 — T3</SelectItem>
                                <SelectItem value="2026-T4">2026 — T4</SelectItem>
                                <SelectItem value="2026-Anual">2026 — Anual</SelectItem>
                                <SelectItem value="2025-T1">2025 — T1</SelectItem>
                                <SelectItem value="2025-T2">2025 — T2</SelectItem>
                                <SelectItem value="2025-T3">2025 — T3</SelectItem>
                                <SelectItem value="2025-T4">2025 — T4</SelectItem>
                                <SelectItem value="2025-Anual">2025 — Anual</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex gap-3">
                            <Button onClick={() => kpis && exportKpisXlsx(kpis, periodo)}>
                                <Download className="h-4 w-4 mr-2" /> Exportar XLSX
                            </Button>
                            <Button variant="outline" onClick={exportImportTemplate}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" /> Baixar Template
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {canImport && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Importar Dados</CardTitle>
                            <CardDescription>
                                Importe valores de KPIs a partir de uma planilha XLSX ou CSV.
                                Use o template acima como referência para o formato correto.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input type="file" accept=".xlsx,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                            {file && (
                                <div className="flex gap-3">
                                    <Button onClick={handleImport} disabled={importing}>
                                        {importing ? "Importando..." : "Importar"}
                                    </Button>
                                    <Button variant="ghost" onClick={() => { setFile(null); setResult(null); }}>
                                        Limpar
                                    </Button>
                                </div>
                            )}
                            {result && (
                                <div className="rounded-lg border p-4 space-y-2">
                                    <p className="text-sm font-medium">
                                        Total: {result.total} | Inseridos: {result.inseridos} | Atualizados: {result.atualizados} | Erros: {result.erros.length}
                                    </p>
                                    {result.erros.length > 0 && (
                                        <ul className="text-xs text-destructive space-y-1 max-h-40 overflow-auto">
                                            {result.erros.map((e, i) => (
                                                <li key={i}>Linha {e.linha}: {e.mensagem}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
};

export default ImportExport;
