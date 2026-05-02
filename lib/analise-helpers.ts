// Funções puras de cálculo usadas pelo dashboard de Análise.

export interface AtividadeMin {
  id: string;
  valorMaximo: number;
  periodoId: string;
}

export interface NotaMin {
  alunoId: string;
  atividadeId: string;
  valor: number;
}

export interface PeriodoMin {
  id: string;
  ordem: number;
  modoCalculo: "MEDIA" | "SOMA";
}

/**
 * Média de um aluno num bimestre específico (sempre 0-10).
 * Retorna `null` se o bimestre não tem atividades.
 * Vazio (sem nota lançada) conta como 0.
 *
 * - Modo MEDIA: average simples das notas (cap efetivo 10 por célula).
 * - Modo SOMA: soma das notas, com teto em 10.
 */
export function mediaBimestre(
  alunoId: string,
  periodo: PeriodoMin,
  atividades: AtividadeMin[],
  notas: NotaMin[]
): number | null {
  const ativsDoBim = atividades.filter((a) => a.periodoId === periodo.id);
  if (ativsDoBim.length === 0) return null;

  if (periodo.modoCalculo === "SOMA") {
    let sum = 0;
    for (const a of ativsDoBim) {
      const nota = notas.find(
        (n) => n.alunoId === alunoId && n.atividadeId === a.id
      );
      sum += nota?.valor ?? 0;
    }
    return Math.min(sum, 10);
  }

  // MEDIA: average simples
  let totalValor = 0;
  for (const a of ativsDoBim) {
    const nota = notas.find(
      (n) => n.alunoId === alunoId && n.atividadeId === a.id
    );
    totalValor += nota?.valor ?? 0;
  }
  return totalValor / ativsDoBim.length;
}

/**
 * Média anual: média das médias dos bimestres que têm atividades.
 * Retorna `null` se nenhum bimestre tem atividades.
 */
export function mediaAnual(
  alunoId: string,
  periodos: PeriodoMin[],
  atividades: AtividadeMin[],
  notas: NotaMin[]
): number | null {
  const medias: number[] = [];
  for (const p of periodos) {
    const m = mediaBimestre(alunoId, p, atividades, notas);
    if (m !== null) medias.push(m);
  }
  if (medias.length === 0) return null;
  return medias.reduce((s, m) => s + m, 0) / medias.length;
}
