import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { calcularSemaforo, semaforoCores } from "@/lib/semaforo";
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
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type SortKey = "codigo" | "nome" | "valor" | "area" | "alimenta_kpi";

const Operacionais = () => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("2026-T1");
  const [areaFilter, setAreaFilter] = useState("Todas");
  const [sortKey, setSortKey] = useState<SortKey>("codigo");
  const [sortAsc, setSortAsc] = useState(true);

  const kpisQuery = useQuery({
    queryKey: ["kpis-operacionais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_kpis")
        .select("*")
        .eq("tipo", "operacional")
        .order("codigo");
      if (error) throw error;
      return data;
    },
  });

  const dadosQuery = useQuery({
    queryKey: ["dados-kpis-op", periodo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dados_kpis")
        .select("*")
        .eq("periodo", periodo);
      if (error) throw error;
      return data;
    },
  });

  const rows = (kpisQuery.data ?? [])
    .filter((k) => areaFilter === "Todas" || k.area === areaFilter)
    .map((k) => {
      const dado = (dadosQuery.data ?? []).find((d) => d.kpi_id === k.id);
      const valor = dado?.valor_numerico ?? null;
      const semaforo = calcularSemaforo(valor, k.meta_valor, k.faixa_verde ?? 80, k.faixa_amarela ?? 50);
      return { ...k, valor, semaforo };
    });

  // Build bar chart data: group operational KPIs by their strategic parent
  const barChartData = useMemo(() => {
    const allOps = (kpisQuery.data ?? []).map((k) => {
      const dado = (dadosQuery.data ?? []).find((d) => d.kpi_id === k.id);
      const valor = dado?.valor_numerico ?? null;
      const semaforo = calcularSemaforo(valor, k.meta_valor, k.faixa_verde ?? 80, k.faixa_amarela ?? 50);
      return { ...k, semaforo };
    });

    const grouped: Record<string, { verde: number; amarelo: number; vermelho: number; cinza: number }> = {};

    for (const op of allOps) {
      const parent = op.alimenta_kpi ?? "Sem vínculo";
      if (!grouped[parent]) grouped[parent] = { verde: 0, amarelo: 0, vermelho: 0, cinza: 0 };
      if (op.semaforo === "verde") grouped[parent].verde++;
      else if (op.semaforo === "amarelo") grouped[parent].amarelo++;
      else if (op.semaforo === "vermelho") grouped[parent].vermelho++;
      else grouped[parent].cinza++;
    }

    return Object.entries(grouped)
      .sort((a, b) => {
        const totalA = a[1].verde + a[1].amarelo + a[1].vermelho + a[1].cinza;
        const totalB = b[1].verde + b[1].amarelo + b[1].vermelho + b[1].cinza;
        return totalB - totalA;
      })
      .slice(0, 5)
      .map(([key, counts]) => ({ kpi: key, ...counts }));
  }, [kpisQuery.data, dadosQuery.data]);

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string" && typeof bv === "string")
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
  });

  const SortHeader = ({ label, col }: { label: string; col: SortKey }) => (
    <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle(col)}>
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </TableHead>
  );

  const isLoading = kpisQuery.isLoading || dadosQuery.isLoading;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">KPIs Operacionais</h1>

        <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Período</span>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-28 bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2026-T1">T1</SelectItem>
                <SelectItem value="2026-T2">T2</SelectItem>
                <SelectItem value="2026-T3">T3</SelectItem>
                <SelectItem value="2026-T4">T4</SelectItem>
                <SelectItem value="2026-Anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Área</span>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-36 bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
                <SelectItem value="Projetos">Projetos</SelectItem>
                <SelectItem value="Comunicação">Comunicação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bar chart */}
        {!isLoading && barChartData.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Saúde dos Indicadores por KPI Estratégico
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={barChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} vertical={true} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="kpi" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="verde" name="Verde" fill="#22c55e" stackId="a" />
                <Bar dataKey="amarelo" name="Amarelo" fill="#eec833" stackId="a" />
                <Bar dataKey="vermelho" name="Vermelho" fill="#d27f7b" stackId="a" />
                <Bar dataKey="cinza" name="Sem meta" fill="#9a999e" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {isLoading ? (
          <p className="text-muted-foreground text-center py-12">Carregando dados...</p>
        ) : (
          <div className="rounded-lg border bg-card overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader label="Código" col="codigo" />
                  <SortHeader label="Nome" col="nome" />
                  <SortHeader label="Valor" col="valor" />
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <SortHeader label="Área" col="area" />
                  <SortHeader label="Alimenta KPI" col="alimenta_kpi" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.codigo}</TableCell>
                    <TableCell>{k.nome}</TableCell>
                    <TableCell>{k.valor != null ? k.valor : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{periodo}</TableCell>
                    <TableCell>
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: semaforoCores[k.semaforo] }}
                        title={k.semaforo}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{k.area ?? "—"}</TableCell>
                    <TableCell>
                      {k.alimenta_kpi ? (
                        <button
                          className="text-sm font-medium text-primary hover:underline"
                          onClick={() => navigate("/")}
                        >
                          {k.alimenta_kpi}
                        </button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum KPI operacional encontrado.
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

export default Operacionais;
