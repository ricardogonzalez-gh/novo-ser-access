import { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { calcularSemaforo, semaforoCores } from "@/lib/semaforo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const currentYear = new Date().getFullYear();
const periodoOptions = [
  { value: `${currentYear}-T1`, label: "T1" },
  { value: `${currentYear}-T2`, label: "T2" },
  { value: `${currentYear}-T3`, label: "T3" },
  { value: `${currentYear}-T4`, label: "T4" },
  { value: `${currentYear}-S1`, label: "S1" },
  { value: `${currentYear}-S2`, label: "S2" },
  { value: `${currentYear}-Anual`, label: "Anual" },
];

const perspectivaLabels: Record<string, string> = {
  A: "A — Sustentabilidade Financeira",
  B: "B — Impacto Social",
  C: "C — Excelência Operacional",
  D: "D — Parcerias e Rede",
  E: "E — Comunicação e Visibilidade",
  OP: "Operacionais",
};

const perspectivaOrder = ["A", "B", "C", "D", "E", "OP"];

interface FormEntry {
  kpi_id: string;
  valor_numerico: string;
  observacoes: string;
  existing_id: string | null;
}

const EntradaDados = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [periodo, setPeriodo] = useState(periodoOptions[0].value);
  const [showAll, setShowAll] = useState(false);
  const [formData, setFormData] = useState<Record<string, FormEntry>>({});
  const [saving, setSaving] = useState(false);

  const isVisualizacao = profile?.role === "visualizacao";

  const kpisQuery = useQuery({
    queryKey: ["entrada-kpis", profile?.area, profile?.role],
    queryFn: async () => {
      let query = supabase.from("config_kpis").select("*").order("codigo");
      if (profile?.role === "equipe" && profile.area) {
        query = query.eq("area", profile.area);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile && !isVisualizacao,
  });

  const dadosQuery = useQuery({
    queryKey: ["entrada-dados", periodo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dados_kpis")
        .select("*")
        .eq("periodo", periodo);
      if (error) throw error;
      return data;
    },
    enabled: !isVisualizacao,
  });

  useEffect(() => {
    if (!kpisQuery.data) return;
    const dados = dadosQuery.data ?? [];
    const entries: Record<string, FormEntry> = {};
    for (const kpi of kpisQuery.data) {
      const existing = dados.find((d) => d.kpi_id === kpi.id);
      entries[kpi.id] = {
        kpi_id: kpi.id,
        valor_numerico: existing?.valor_numerico != null ? String(existing.valor_numerico) : "",
        observacoes: existing?.observacoes ?? "",
        existing_id: existing?.id ?? null,
      };
    }
    setFormData(entries);
  }, [kpisQuery.data, dadosQuery.data, periodo]);

  const filteredKpis = useMemo(() => {
    if (!kpisQuery.data) return [];
    if (showAll) return kpisQuery.data;
    return kpisQuery.data.filter((k) => k.fonte === "Manual" || !k.fonte);
  }, [kpisQuery.data, showAll]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredKpis> = {};
    for (const kpi of filteredKpis) {
      const key = kpi.perspectiva ?? "OP";
      if (!groups[key]) groups[key] = [];
      groups[key].push(kpi);
    }
    return perspectivaOrder
      .filter((k) => groups[k]?.length)
      .map((key) => ({ key, label: perspectivaLabels[key] ?? key, kpis: groups[key] }));
  }, [filteredKpis]);

  const filledCount = useMemo(() => {
    return Object.values(formData).filter((e) => e.valor_numerico !== "").length;
  }, [formData]);

  const totalCount = kpisQuery.data?.length ?? 0;

  // Access control render
  if (isVisualizacao) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <ShieldAlert className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground text-center max-w-md">
            Você não tem permissão para registrar dados. Seu perfil é somente visualização.
          </p>
          <Button onClick={() => navigate("/")}>Voltar ao Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  const updateField = (kpiId: string, field: "valor_numerico" | "observacoes", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toUpsert = Object.values(formData).filter((e) => e.valor_numerico !== "");
      if (toUpsert.length === 0) {
        toast({ title: "Nenhum dado para salvar", description: "Preencha ao menos um KPI." });
        setSaving(false);
        return;
      }

      for (const entry of toUpsert) {
        const kpi = kpisQuery.data?.find((k) => k.id === entry.kpi_id);
        const valor = parseFloat(entry.valor_numerico);
        if (isNaN(valor)) continue;

        const semaforo = calcularSemaforo(
          valor,
          kpi?.meta_valor ?? null,
          kpi?.faixa_verde ?? 80,
          kpi?.faixa_amarela ?? 50
        );

        const record = {
          kpi_id: entry.kpi_id,
          periodo,
          data_registro: new Date().toISOString().split("T")[0],
          valor_numerico: valor,
          observacoes: entry.observacoes || null,
          status_semaforo: semaforo,
          registrado_por: user?.id ?? null,
          fonte_origem: "Manual",
        };

        if (entry.existing_id) {
          const { error } = await supabase
            .from("dados_kpis")
            .update(record)
            .eq("id", entry.existing_id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("dados_kpis").insert(record);
          if (error) throw error;
        }
      }

      toast({ title: "Dados salvos com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["entrada-dados", periodo] });
      queryClient.invalidateQueries({ queryKey: ["dados-kpis"] });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const isLoading = kpisQuery.isLoading || dadosQuery.isLoading;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Entrada de Dados</h1>

        <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Período</span>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-36 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodoOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label} — {currentYear}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Badge variant="secondary" className="text-xs">
            {filledCount} de {totalCount} KPIs preenchidos para {periodo}
          </Badge>

          <div className="flex items-center gap-2 ml-auto">
            <Switch id="show-all" checked={showAll} onCheckedChange={setShowAll} />
            <Label htmlFor="show-all" className="text-sm text-muted-foreground cursor-pointer">
              Mostrar todos
            </Label>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-center py-12">Carregando KPIs...</p>
        ) : (
          <>
            {grouped.map((group) => (
              <Card key={group.key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{group.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {group.kpis.map((kpi) => {
                    const entry = formData[kpi.id];
                    const valor = entry?.valor_numerico ? parseFloat(entry.valor_numerico) : null;
                    const semaforo = calcularSemaforo(
                      valor,
                      kpi.meta_valor,
                      kpi.faixa_verde ?? 80,
                      kpi.faixa_amarela ?? 50
                    );

                    return (
                      <div
                        key={kpi.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-start border-b pb-3 last:border-0 last:pb-0"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">{kpi.codigo}</span>
                            <span className="text-sm text-muted-foreground">{kpi.nome}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {kpi.unidade && (
                              <Badge variant="outline" className="text-xs">{kpi.unidade}</Badge>
                            )}
                            {kpi.fonte && (
                              <Badge variant="secondary" className="text-xs">{kpi.fonte}</Badge>
                            )}
                            {kpi.meta_valor != null && (
                              <span className="text-xs text-muted-foreground">Meta: {kpi.meta_valor}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-center pt-1">
                          <span
                            className="inline-block h-4 w-4 rounded-full shrink-0"
                            style={{ backgroundColor: semaforoCores[semaforo] }}
                            title={semaforo}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Valor"
                            className="w-32"
                            value={entry?.valor_numerico ?? ""}
                            onChange={(e) => updateField(kpi.id, "valor_numerico", e.target.value)}
                            disabled={false}
                          />
                          <Input
                            placeholder="Observações"
                            className="flex-1"
                            value={entry?.observacoes ?? ""}
                            onChange={(e) => updateField(kpi.id, "observacoes", e.target.value)}
                          />
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground">
                          {valor != null && kpi.meta_valor
                            ? `${Math.round((valor / kpi.meta_valor) * 100)}%`
                            : "—"}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="lg">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar todos"}
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default EntradaDados;
