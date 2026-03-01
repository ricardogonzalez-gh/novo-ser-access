import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { KpiRow } from "@/hooks/useDashboardData";

export function exportKpisPdf(kpis: KpiRow[], periodo: string) {
    const doc = new jsPDF({ orientation: "landscape" });
    const today = new Date().toLocaleDateString("pt-BR");

    // Header
    doc.setFontSize(16);
    doc.setTextColor(61, 44, 94); // roxo escuro #3d2c5e
    doc.text("Instituto Novo Ser", 14, 15);
    doc.setFontSize(11);
    doc.setTextColor(74, 74, 74);
    doc.text(`Painel Estratégico de KPIs — ${periodo}`, 14, 22);
    doc.setFontSize(8);
    doc.setTextColor(154, 153, 158);
    doc.text(`Gerado em ${today}`, 14, 27);

    // Resumo semáforo
    const verde = kpis.filter(k => k.semaforo === "verde").length;
    const amarelo = kpis.filter(k => k.semaforo === "amarelo").length;
    const vermelho = kpis.filter(k => k.semaforo === "vermelho").length;
    const semMeta = kpis.filter(k => k.semaforo === "sem_meta").length;

    doc.setFontSize(9);
    doc.setTextColor(74, 74, 74);
    doc.text(`Resumo: ${verde} verde | ${amarelo} amarelo | ${vermelho} vermelho | ${semMeta} sem meta`, 14, 33);

    // Tabela
    const headers = [["Código", "Nome", "Valor", "Meta", "% Atingido", "Status", "Perspectiva", "Área"]];
    const rows = kpis.map(k => [
        k.codigo,
        k.nome,
        k.valor != null ? String(k.valor) : "—",
        k.meta_valor != null ? String(k.meta_valor) : "—",
        k.percentual != null ? `${k.percentual}%` : "—",
        k.semaforo === "verde" ? "●" : k.semaforo === "amarelo" ? "●" : k.semaforo === "vermelho" ? "●" : "○",
        k.perspectiva,
        k.area ?? "—",
    ]);

    autoTable(doc, {
        head: headers,
        body: rows,
        startY: 38,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [61, 44, 94], textColor: [255, 255, 255], fontSize: 8 },
        alternateRowStyles: { fillColor: [250, 251, 252] },
        columnStyles: {
            0: { cellWidth: 18 },
            1: { cellWidth: 60 },
            5: { halign: "center" },
        },
        didParseCell: (data) => {
            // Colorir o status na coluna 5
            if (data.section === "body" && data.column.index === 5) {
                const kpi = kpis[data.row.index];
                if (kpi) {
                    if (kpi.semaforo === "verde") data.cell.styles.textColor = [34, 197, 94];
                    else if (kpi.semaforo === "amarelo") data.cell.styles.textColor = [238, 200, 51];
                    else if (kpi.semaforo === "vermelho") data.cell.styles.textColor = [210, 127, 123];
                    else data.cell.styles.textColor = [154, 153, 158];
                }
            }
        },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(154, 153, 158);
        doc.text(
            `Instituto Novo Ser — Documento interno — Página ${i}/${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 7,
            { align: "center" }
        );
    }

    doc.save(`INS_KPIs_${periodo}_${today.replace(/\//g, "-")}.pdf`);
}
