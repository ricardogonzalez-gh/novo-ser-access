import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Download } from "lucide-react";
import type { Filters } from "@/hooks/useDashboardData";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onExport: () => void;
}

const GlobalFilters = ({ filters, onChange, onExport }: Props) => {
  const set = (key: keyof Filters, value: string | boolean) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Período</span>
        <Select value={filters.periodo} onValueChange={(v) => set("periodo", v)}>
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
        <span className="text-sm font-medium text-muted-foreground">Projeto</span>
        <Select value={filters.projeto} onValueChange={(v) => set("projeto", v)}>
          <SelectTrigger className="w-28 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="PPT">PPT</SelectItem>
            <SelectItem value="CNS">CNS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Área</span>
        <Select value={filters.area} onValueChange={(v) => set("area", v)}>
          <SelectTrigger className="w-32 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas</SelectItem>
            <SelectItem value="Financeiro">Financeiro</SelectItem>
            <SelectItem value="Projetos">Projetos</SelectItem>
            <SelectItem value="Comunicação">Comunicação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
          <Switch
            checked={filters.comparar}
            onCheckedChange={(v) => set("comparar", v)}
          />
          Comparar
        </label>

        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Exportar
        </Button>
      </div>
    </div>
  );
};

export default GlobalFilters;
