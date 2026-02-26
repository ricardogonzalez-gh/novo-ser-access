import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calcularSemaforo, type SemaforoStatus } from "@/lib/semaforo";

export interface Filters {
  periodo: string;
  projeto: string;
  area: string;
  comparar: boolean;
}

export interface KpiRow {
  id: string;
  codigo: string;
  nome: string;
  perspectiva: string;
  area: string | null;
  unidade: string | null;
  meta_valor: number | null;
  faixa_verde: number | null;
  faixa_amarela: number | null;
  valor: number | null;
  percentual: number | null;
  semaforo: SemaforoStatus;
  valorAnterior: number | null;
  tendencia: "up" | "down" | "equal" | null;
}

const PERIODOS_ORDER = ["T1", "T2", "T3", "T4"];

function periodoAnterior(periodo: string): string | null {
  const match = periodo.match(/^(\d{4})-(T[1-4])$/);
  if (!match) return null;
  const [, yearStr, tri] = match;
  const idx = PERIODOS_ORDER.indexOf(tri);
  if (idx > 0) return `${yearStr}-${PERIODOS_ORDER[idx - 1]}`;
  return `${Number(yearStr) - 1}-T4`;
}

export function useDashboardData(filters: Filters) {
  const kpisQuery = useQuery({
    queryKey: ["kpis-estrategicos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_kpis")
        .select("*")
        .eq("tipo", "estrategico")
        .order("codigo");
      if (error) throw error;
      return data;
    },
  });

  const dadosQuery = useQuery({
    queryKey: ["dados-kpis", filters.periodo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dados_kpis")
        .select("*")
        .eq("periodo", filters.periodo);
      if (error) throw error;
      return data;
    },
  });

  const prevPeriodo = filters.comparar ? periodoAnterior(filters.periodo) : null;

  const prevQuery = useQuery({
    queryKey: ["dados-kpis-prev", prevPeriodo],
    enabled: !!prevPeriodo,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dados_kpis")
        .select("*")
        .eq("periodo", prevPeriodo!);
      if (error) throw error;
      return data;
    },
  });

  const kpis: KpiRow[] = (kpisQuery.data ?? [])
    .filter((k) => {
      if (filters.area !== "Todas" && k.area !== filters.area) return false;
      if (filters.projeto !== "Todos" && k.projeto !== filters.projeto) return false;
      return true;
    })
    .map((k) => {
      const dado = (dadosQuery.data ?? []).find((d) => d.kpi_id === k.id);
      const valor = dado?.valor_numerico ?? null;
      const meta = k.meta_valor;
      const percentual =
        valor != null && meta && meta !== 0
          ? Math.round((valor / meta) * 100)
          : null;
      const semaforo = calcularSemaforo(
        valor,
        meta,
        k.faixa_verde ?? 80,
        k.faixa_amarela ?? 50
      );

      let valorAnterior: number | null = null;
      let tendencia: "up" | "down" | "equal" | null = null;
      if (filters.comparar && prevQuery.data) {
        const prev = prevQuery.data.find((d) => d.kpi_id === k.id);
        valorAnterior = prev?.valor_numerico ?? null;
        if (valor != null && valorAnterior != null) {
          if (valor > valorAnterior) tendencia = "up";
          else if (valor < valorAnterior) tendencia = "down";
          else tendencia = "equal";
        }
      }

      return {
        id: k.id,
        codigo: k.codigo,
        nome: k.nome,
        perspectiva: k.perspectiva ?? "",
        area: k.area,
        unidade: k.unidade,
        meta_valor: meta,
        faixa_verde: k.faixa_verde,
        faixa_amarela: k.faixa_amarela,
        valor,
        percentual,
        semaforo,
        valorAnterior,
        tendencia,
      };
    });

  return {
    kpis,
    isLoading: kpisQuery.isLoading || dadosQuery.isLoading,
  };
}
