import * as XLSX from "xlsx";
import type { KpiRow } from "@/hooks/useDashboardData";

export function exportKpisXlsx(kpis: KpiRow[], periodo: string) {
    const today = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");

    const data = kpis.map(k => ({
        "Código": k.codigo,
        "Nome": k.nome,
        "Valor": k.valor ?? "",
        "Meta": k.meta_valor ?? "",
        "% Atingido": k.percentual != null ? `${k.percentual}%` : "",
        "Status": k.semaforo,
        "Perspectiva": k.perspectiva,
        "Área": k.area ?? "",
        "Unidade": k.unidade ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar largura das colunas
    ws["!cols"] = [
        { wch: 8 },  // Código
        { wch: 35 }, // Nome
        { wch: 12 }, // Valor
        { wch: 12 }, // Meta
        { wch: 12 }, // % Atingido
        { wch: 12 }, // Status
        { wch: 25 }, // Perspectiva
        { wch: 15 }, // Área
        { wch: 8 },  // Unidade
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KPIs Estratégicos");
    XLSX.writeFile(wb, `INS_KPIs_${periodo}_${today}.xlsx`);
}

// Gerar template de importação vazio
export function exportImportTemplate() {
    const headers = [
        { "codigo_kpi": "A1", "periodo": "2026-T1", "valor_numerico": "", "observacao": "" },
    ];

    const ws = XLSX.utils.json_to_sheet(headers);
    ws["!cols"] = [
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 40 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Importação");
    XLSX.writeFile(wb, "INS_KPI_Template_Importacao.xlsx");
}
