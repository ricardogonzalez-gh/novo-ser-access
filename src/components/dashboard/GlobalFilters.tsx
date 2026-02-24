import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Filters } from "@/hooks/useDashboardData";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const GlobalFilters = ({ filters, onChange }: Props) => {
  const set = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Período</span>
        <Select value={filters.periodo} onValueChange={(v) => set("periodo", v)}>
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
    </div>
  );
};

export default GlobalFilters;
