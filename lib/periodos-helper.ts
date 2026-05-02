import { prisma } from "@/lib/prisma";
import { BIMESTRES_FIXOS } from "@/lib/turma-format";

/**
 * Garante que a turma tenha os 4 bimestres criados.
 * Idempotente: se já existem todos, não faz nada.
 * Útil pra backfillar turmas criadas antes da regra de "4 fixos".
 */
export async function ensure4Periodos(turmaId: string, professorId: string) {
  const existing = await prisma.periodo.findMany({
    where: { turmaId, professorId },
    select: { ordem: true },
  });
  const existingOrdens = new Set(existing.map((p) => p.ordem));
  const missing = BIMESTRES_FIXOS.filter((o) => !existingOrdens.has(o));
  if (missing.length > 0) {
    await prisma.periodo.createMany({
      data: missing.map((ordem) => ({
        turmaId,
        professorId,
        ordem,
      })),
    });
  }
}
