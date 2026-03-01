import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

interface ImportRow {
    codigo_kpi: string;
    periodo: string;
    valor_numerico: number | string;
    observacao?: string;
}

interface ImportResult {
    total: number;
    inseridos: number;
    atualizados: number;
    erros: { linha: number; mensagem: string }[];
}

export async function importKpisFromFile(file: File): Promise<ImportResult> {
    const result: ImportResult = { total: 0, inseridos: 0, atualizados: 0, erros: [] };

    // Ler arquivo
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: ImportRow[] = XLSX.utils.sheet_to_json(sheet);

    result.total = rows.length;

    // Buscar mapa de codigo -> id dos KPIs
    const { data: kpis } = await supabase.from("config_kpis").select("id, codigo");
    const kpiMap = new Map((kpis ?? []).map(k => [k.codigo, k.id]));

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const lineNum = i + 2; // +2 por causa do header e index 0

        // Validar campos obrigatórios
        if (!row.codigo_kpi || !row.periodo) {
            result.erros.push({ linha: lineNum, mensagem: "codigo_kpi e periodo são obrigatórios" });
            continue;
        }

        const kpiId = kpiMap.get(row.codigo_kpi.trim());
        if (!kpiId) {
            result.erros.push({ linha: lineNum, mensagem: `KPI "${row.codigo_kpi}" não encontrado` });
            continue;
        }

        const valorNum = typeof row.valor_numerico === "string"
            ? parseFloat(row.valor_numerico.replace(",", "."))
            : row.valor_numerico;

        if (isNaN(valorNum)) {
            result.erros.push({ linha: lineNum, mensagem: `Valor "${row.valor_numerico}" não é numérico` });
            continue;
        }

        // Verificar se já existe registro para este KPI + período
        const { data: existing } = await supabase
            .from("dados_kpis")
            .select("id")
            .eq("kpi_id", kpiId)
            .eq("periodo", row.periodo.trim())
            .maybeSingle();

        if (existing) {
            // Atualizar
            const { error } = await supabase
                .from("dados_kpis")
                .update({
                    valor_numerico: valorNum,
                    observacao: row.observacao ?? null,
                    atualizado_em: new Date().toISOString()
                })
                .eq("id", existing.id);

            if (error) {
                result.erros.push({ linha: lineNum, mensagem: error.message });
            } else {
                result.atualizados++;
            }
        } else {
            // Inserir
            const { error } = await supabase
                .from("dados_kpis")
                .insert({
                    kpi_id: kpiId,
                    periodo: row.periodo.trim(),
                    valor_numerico: valorNum,
                    observacao: row.observacao ?? null,
                });

            if (error) {
                result.erros.push({ linha: lineNum, mensagem: error.message });
            } else {
                result.inseridos++;
            }
        }
    }

    return result;
}
