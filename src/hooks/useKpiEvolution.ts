import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface KpiPeriodData {
  periodo: string;
  valor: number | null;
}

export function useKpiEvolution(kpiId: string | null) {
  return useQuery({
    queryKey: ["kpi-evolution", kpiId],
    enabled: !!kpiId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dados_kpis")
        .select("periodo, valor_numerico")
        .eq("kpi_id", kpiId!)
        .order("periodo");
      if (error) throw error;
      return (data ?? []).map((d) => ({
        periodo: d.periodo.replace(/^\d{4}-/, ""),
        valor: d.valor_numerico,
      })) as KpiPeriodData[];
    },
  });
}

/** Fetch sparkline data for multiple KPIs at once */
export function useSparklineData(kpiIds: string[]) {
  return useQuery({
    queryKey: ["sparklines", kpiIds.sort().join(",")],
    enabled: kpiIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dados_kpis")
        .select("kpi_id, periodo, valor_numerico")
        .in("kpi_id", kpiIds)
        .order("periodo");
      if (error) throw error;
      const map: Record<string, { periodo: string; valor: number | null }[]> = {};
      for (const d of data ?? []) {
        if (!d.kpi_id) continue;
        if (!map[d.kpi_id]) map[d.kpi_id] = [];
        map[d.kpi_id].push({ periodo: d.periodo, valor: d.valor_numerico });
      }
      return map;
    },
  });
}
