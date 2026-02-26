import { useState } from "react";
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

type SortKey = "codigo" | "nome" | "valor" | "area" | "alimenta_kpi";

const Operacionais = () => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("T1");
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
                <SelectItem value="T1">T1</SelectItem>
                <SelectItem value="T2">T2</SelectItem>
                <SelectItem value="T3">T3</SelectItem>
                <SelectItem value="T4">T4</SelectItem>
                <SelectItem value="Anual">Anual</SelectItem>
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
