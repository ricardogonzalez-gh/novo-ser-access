import type { KpiRow } from "@/hooks/useDashboardData";

export function exportKpisCsv(kpis: KpiRow[], periodo: string) {
  const BOM = "\uFEFF";
  const header = "Código;Nome;Valor;Meta;% Atingido;Status;Área";
  const rows = kpis.map((k) =>
    [
      k.codigo,
      k.nome,
      k.valor != null ? String(k.valor) : "",
      k.meta_valor != null ? String(k.meta_valor) : "",
      k.percentual != null ? `${k.percentual}%` : "",
      k.semaforo,
      k.area ?? "",
    ].join(";")
  );
  const csv = BOM + [header, ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `INS_KPIs_${periodo}_${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
