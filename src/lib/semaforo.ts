export type SemaforoStatus = "verde" | "amarelo" | "vermelho" | "sem_meta";

export function calcularSemaforo(
  valor: number | null | undefined,
  meta: number | null | undefined,
  faixaVerde = 80,
  faixaAmarela = 50
): SemaforoStatus {
  if (!meta || meta === 0 || valor == null) return "sem_meta";
  const percentual = (valor / meta) * 100;
  if (percentual >= faixaVerde) return "verde";
  if (percentual >= faixaAmarela) return "amarelo";
  return "vermelho";
}

export const semaforoCores: Record<SemaforoStatus, string> = {
  verde: "#22c55e",
  amarelo: "#eab308",
  vermelho: "#ef4444",
  sem_meta: "#9ca3af",
};
