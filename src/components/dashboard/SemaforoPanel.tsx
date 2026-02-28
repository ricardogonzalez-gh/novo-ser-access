import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Heart, Settings, Handshake, Megaphone, ChevronDown, ChevronUp } from "lucide-react";
import type { KpiRow } from "@/hooks/useDashboardData";
import { semaforoCores, type SemaforoStatus } from "@/lib/semaforo";
import { useSparklineData } from "@/hooks/useKpiEvolution";
import SparklineChart from "./SparklineChart";

const perspectivas = [
  { key: "A", label: "Sustentabilidade Financeira", icon: DollarSign, color: "#eec833" },
  { key: "B", label: "Impacto Social", icon: Heart, color: "#d27f7b" },
  { key: "C", label: "Excelência Operacional", icon: Settings, color: "#8dbb9d" },
  { key: "D", label: "Parcerias e Rede", icon: Handshake, color: "#ad93bf" },
  { key: "E", label: "Comunicação e Visibilidade", icon: Megaphone, color: "#9a999e" },
];

function countByStatus(kpis: KpiRow[], status: SemaforoStatus) {
  return kpis.filter((k) => k.semaforo === status).length;
}

const Dot = ({ color, count }: { color: string; count: number }) => (
  <div className="flex items-center gap-1.5 bg-muted/30 rounded-full px-2 py-0.5 border border-border/50">
    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-sm font-semibold">{count}</span>
  </div>
);

const SemaforoPanel = ({ kpis }: { kpis: KpiRow[] }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const expandedKpiIds = expanded
    ? kpis.filter((k) => k.perspectiva === expanded).map((k) => k.id)
    : [];

  const { data: sparkData } = useSparklineData(expandedKpiIds);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {perspectivas.map((p) => {
        const pKpis = kpis.filter((k) => k.perspectiva === p.key);
        const isOpen = expanded === p.key;
        const Icon = p.icon;

        return (
          <Card
            key={p.key}
            className="cursor-pointer bg-white shadow-sm border border-[#f0f0f0] rounded-xl hover:shadow-md hover:scale-[1.01] transition-all duration-200"
            style={{ borderLeftWidth: "4px", borderLeftColor: p.color }}
            onClick={() => setExpanded(isOpen ? null : p.key)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm font-semibold font-heading text-[#2d2d2d] leading-none">{p.label}</CardTitle>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Dot color={semaforoCores.verde} count={countByStatus(pKpis, "verde")} />
                <Dot color={semaforoCores.amarelo} count={countByStatus(pKpis, "amarelo")} />
                <Dot color={semaforoCores.vermelho} count={countByStatus(pKpis, "vermelho")} />
                {countByStatus(pKpis, "sem_meta") > 0 && (
                  <Dot color={semaforoCores.sem_meta} count={countByStatus(pKpis, "sem_meta")} />
                )}
              </div>

              {isOpen && (
                <div className="mt-4 space-y-2 border-t pt-3">
                  {pKpis.map((k) => (
                    <div key={k.id} className="flex items-center justify-between text-sm gap-2">
                      <span className="text-muted-foreground truncate">
                        <span className="font-medium text-foreground">{k.codigo}</span> — {k.nome}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <SparklineChart data={sparkData?.[k.id] ?? []} />
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: semaforoCores[k.semaforo] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SemaforoPanel;
