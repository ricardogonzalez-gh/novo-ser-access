import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import GlobalFilters from "@/components/dashboard/GlobalFilters";
import SemaforoPanel from "@/components/dashboard/SemaforoPanel";
import KpiTable from "@/components/dashboard/KpiTable";
import KpiDetailDrawer from "@/components/dashboard/KpiDetailDrawer";
import { useDashboardData, type Filters, type KpiRow } from "@/hooks/useDashboardData";
import { exportKpisCsv } from "@/lib/exportCsv";
import { exportKpisPdf } from "@/lib/exportPdf";
import { exportKpisXlsx } from "@/lib/exportXlsx";

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
          onExportPdf={() => exportKpisPdf(kpis, filters.periodo)}
          onExportXlsx={() => exportKpisXlsx(kpis, filters.periodo)}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <div className="animate-spin h-8 w-8 border-4 border-[#ad93bf] border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground text-sm">Carregando indicadores...</p>
            </div>
          </div>
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

      <KpiDetailDrawer
        kpi={selectedKpi}
        open={!!selectedKpi}
        onClose={() => setSelectedKpi(null)}
      />
    </AppLayout>
  );
};

export default Dashboard;
