import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
import type { KpiRow } from "@/hooks/useDashboardData";
import { useKpiEvolution } from "@/hooks/useKpiEvolution";

interface Props {
  kpi: KpiRow | null;
  open: boolean;
  onClose: () => void;
}

const KpiEvolutionDrawer = ({ kpi, open, onClose }: Props) => {
  const { data: evolution = [] } = useKpiEvolution(kpi?.id ?? null);

  if (!kpi) return null;

  const hasEnoughData = evolution.filter((e) => e.valor != null).length >= 2;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="fixed inset-y-0 right-0 left-auto w-full md:w-[480px] rounded-none rounded-l-lg mt-0 h-full">
        <DrawerHeader className="flex items-start justify-between">
          <DrawerTitle className="text-base font-semibold">
            {kpi.codigo} — {kpi.nome}
          </DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-4 pb-6 flex-1 overflow-auto">
          {kpi.unidade && (
            <p className="text-xs text-muted-foreground mb-4">Unidade: {kpi.unidade}</p>
          )}

          {!hasEnoughData ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Dados insuficientes para gráfico de evolução
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
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
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                />
                {kpi.meta_valor != null && (
                  <ReferenceLine
                    y={kpi.meta_valor}
                    stroke="#ef4444"
                    strokeDasharray="6 4"
                    label={{ value: "Meta", position: "right", fontSize: 11, fill: "#ef4444" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default KpiEvolutionDrawer;
