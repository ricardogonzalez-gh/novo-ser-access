import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import GlobalFilters from "@/components/dashboard/GlobalFilters";
import SemaforoPanel from "@/components/dashboard/SemaforoPanel";
import KpiTable from "@/components/dashboard/KpiTable";
import KpiEvolutionDrawer from "@/components/dashboard/KpiEvolutionDrawer";
import { useDashboardData, type Filters, type KpiRow } from "@/hooks/useDashboardData";
import { exportKpisCsv } from "@/lib/exportCsv";

const Dashboard = () => {
  const [filters, setFilters] = useState<Filters>({
    periodo: "2026-T1",
    projeto: "Todos",
    area: "Todas",
    comparar: false,
  });

  const [selectedKpi, setSelectedKpi] = useState<KpiRow | null>(null);

  const { kpis, isLoading } = useDashboardData(filters);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Estratégico</h1>

        <GlobalFilters
          filters={filters}
          onChange={setFilters}
          onExport={() => exportKpisCsv(kpis, filters.periodo)}
        />

        {isLoading ? (
          <p className="text-muted-foreground text-center py-12">Carregando dados...</p>
        ) : (
          <>
            <SemaforoPanel kpis={kpis} />
            <KpiTable
              kpis={kpis}
              showComparison={filters.comparar}
              onRowClick={setSelectedKpi}
            />
          </>
        )}
      </div>

      <KpiEvolutionDrawer
        kpi={selectedKpi}
        open={!!selectedKpi}
        onClose={() => setSelectedKpi(null)}
      />
    </AppLayout>
  );
};

export default Dashboard;
