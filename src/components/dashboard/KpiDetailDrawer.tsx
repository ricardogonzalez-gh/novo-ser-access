import { useIsMobile } from "@/hooks/use-mobile";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { KpiRow } from "@/hooks/useDashboardData";
import { useKpiEvolution } from "@/hooks/useKpiEvolution";
import { calcularSemaforo, semaforoCores } from "@/lib/semaforo";

interface Props {
    kpi: KpiRow | null;
    open: boolean;
    onClose: () => void;
}

const KpiDetailDrawer = ({ kpi, open, onClose }: Props) => {
    const isMobile = useIsMobile();
    const { data: evolution = [] } = useKpiEvolution(kpi?.id ?? null);

    // Query operacionais vinculados ao KPI selecionado
    const { data: linkedOps = [] } = useQuery({
        queryKey: ["linked-ops", kpi?.codigo],
        enabled: !!kpi?.codigo,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("config_kpis")
                .select("*")
                .like("alimenta_kpi", `%${kpi!.codigo}%`);
            if (error) throw error;
            return data ?? [];
        },
    });

    // Buscar dados atuais dos operacionais para semáforo
    const opIds = linkedOps.map((o) => o.id);
    const { data: opDados = [] } = useQuery({
        queryKey: ["linked-ops-dados", opIds.sort().join(",")],
        enabled: opIds.length > 0,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("dados_kpis")
                .select("kpi_id, valor_numerico")
                .in("kpi_id", opIds);
            if (error) throw error;
            return data ?? [];
        },
    });

    if (!kpi) return null;

    const hasEnoughData = evolution.filter((e) => e.valor != null).length >= 2;

    return (
        <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={
                    isMobile
                        ? "h-[90vh] overflow-auto"
                        : "w-full sm:max-w-[480px] overflow-auto"
                }
            >
                <SheetHeader>
                    <SheetTitle className="text-base font-semibold pr-6">
                        {kpi.codigo} — {kpi.nome}
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Evolução do KPI {kpi.codigo}
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4 pb-6 space-y-6">
                    {kpi.unidade && (
                        <p className="text-xs text-muted-foreground">
                            Unidade: {kpi.unidade}
                        </p>
                    )}

                    {/* Gráfico de evolução */}
                    {!hasEnoughData ? (
                        <p className="text-sm text-muted-foreground text-center py-12">
                            Dados insuficientes para gráfico de evolução
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart
                                data={evolution}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-border"
                                />
                                <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;
                                        const d = payload[0].payload;
                                        const pct =
                                            d.valor != null && kpi.meta_valor
                                                ? Math.round((d.valor / kpi.meta_valor) * 100)
                                                : null;
                                        return (
                                            <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                                                <p className="font-medium">{d.periodo}</p>
                                                <p>Valor: {d.valor ?? "—"}</p>
                                                <p>Meta: {kpi.meta_valor ?? "—"}</p>
                                                {pct != null && <p>% Atingido: {pct}%</p>}
                                            </div>
                                        );
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="valor"
                                    stroke="#ad93bf"
                                    strokeWidth={2.5}
                                    dot={{ r: 4 }}
                                    connectNulls
                                />
                                {kpi.meta_valor != null && (
                                    <ReferenceLine
                                        y={kpi.meta_valor}
                                        stroke="#9a999e"
                                        strokeDasharray="6 4"
                                        label={{
                                            value: "Meta",
                                            position: "right",
                                            fontSize: 11,
                                            fill: "#9a999e",
                                        }}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    )}

                    {/* Indicadores operacionais vinculados */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground border-t pt-4">
                            Indicadores operacionais vinculados
                        </h3>
                        {linkedOps.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                                Nenhum indicador operacional vinculado.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {linkedOps.map((op) => {
                                    const dado = opDados.find((d) => d.kpi_id === op.id);
                                    const valor = dado?.valor_numerico ?? null;
                                    const semaforo = calcularSemaforo(
                                        valor,
                                        op.meta_valor,
                                        op.faixa_verde ?? 80,
                                        op.faixa_amarela ?? 50
                                    );
                                    return (
                                        <li
                                            key={op.id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-muted-foreground truncate">
                                                <span className="font-medium text-foreground">
                                                    {op.codigo}
                                                </span>{" "}
                                                — {op.nome}
                                            </span>
                                            <span
                                                className="inline-block h-3 w-3 rounded-full shrink-0 ml-2"
                                                style={{ backgroundColor: semaforoCores[semaforo] }}
                                                title={semaforo}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default KpiDetailDrawer;
