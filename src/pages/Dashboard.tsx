import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import GlobalFilters from "@/components/dashboard/GlobalFilters";
import SemaforoPanel from "@/components/dashboard/SemaforoPanel";
import KpiTable from "@/components/dashboard/KpiTable";
import { useDashboardData, type Filters } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const [filters, setFilters] = useState<Filters>({
    periodo: "2026-T1",
    projeto: "Todos",
    area: "Todas",
  });

  const { kpis, isLoading } = useDashboardData(filters);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Estratégico</h1>

        <GlobalFilters filters={filters} onChange={setFilters} />

        {isLoading ? (
          <p className="text-muted-foreground text-center py-12">Carregando dados...</p>
        ) : (
          <>
            <SemaforoPanel kpis={kpis} />
            <KpiTable kpis={kpis} />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
