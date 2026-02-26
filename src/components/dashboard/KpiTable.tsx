import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KpiRow } from "@/hooks/useDashboardData";
import { semaforoCores } from "@/lib/semaforo";

type SortKey = "codigo" | "nome" | "valor" | "meta_valor" | "percentual" | "area";

interface Props {
  kpis: KpiRow[];
  showComparison: boolean;
  onRowClick: (kpi: KpiRow) => void;
}

const TrendIcon = ({ trend }: { trend: KpiRow["tendencia"] }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  if (trend === "equal") return <Minus className="h-4 w-4 text-muted-foreground" />;
  return null;
};

const KpiTable = ({ kpis, showComparison, onRowClick }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("codigo");
  const [sortAsc, setSortAsc] = useState(true);

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sorted = [...kpis].sort((a, b) => {
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
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap"
      onClick={() => toggle(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </TableHead>
  );

  return (
    <div className="rounded-lg border bg-card overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHeader label="Código" col="codigo" />
            <SortHeader label="Nome" col="nome" />
            <SortHeader label="Valor" col="valor" />
            <SortHeader label="Meta" col="meta_valor" />
            <SortHeader label="% Atingido" col="percentual" />
            <TableHead className="w-12">Status</TableHead>
            {showComparison && <TableHead className="whitespace-nowrap">Anterior</TableHead>}
            {showComparison && <TableHead className="w-12">Tend.</TableHead>}
            <SortHeader label="Área" col="area" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((k) => (
            <TableRow
              key={k.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(k)}
            >
              <TableCell className="font-medium">{k.codigo}</TableCell>
              <TableCell>{k.nome}</TableCell>
              <TableCell>{k.valor != null ? k.valor : "—"}</TableCell>
              <TableCell>{k.meta_valor != null ? k.meta_valor : "—"}</TableCell>
              <TableCell>{k.percentual != null ? `${k.percentual}%` : "—"}</TableCell>
              <TableCell>
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: semaforoCores[k.semaforo] }}
                  title={k.semaforo}
                />
              </TableCell>
              {showComparison && (
                <TableCell className="text-muted-foreground">
                  {k.valorAnterior != null ? k.valorAnterior : "—"}
                </TableCell>
              )}
              {showComparison && (
                <TableCell>
                  <TrendIcon trend={k.tendencia} />
                </TableCell>
              )}
              <TableCell className="text-muted-foreground">{k.area ?? "—"}</TableCell>
            </TableRow>
          ))}
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={showComparison ? 9 : 7} className="text-center text-muted-foreground py-8">
                Nenhum KPI encontrado para os filtros selecionados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default KpiTable;
