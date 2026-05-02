import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PROFESSOR_ID = "b7acd583-8e19-4945-a9a8-e76f1a1151d6"; // Ian vitorino

/**
 * Gera uma nota realista para um aluno em uma atividade.
 *
 * `skill` (0.4 a 1.0) é a habilidade base do aluno.
 * `drift` (-0.3 a 0.3) é o quanto o aluno está acima/abaixo da base naquele bimestre.
 * Adiciona um ruído pequeno por atividade e limita o resultado a [0, valorMaximo].
 */
function gerarNota(valorMaximo: number, skill: number, drift: number): number {
  const ruido = (Math.random() - 0.5) * 0.2; // ±0.1
  const fator = Math.max(0, Math.min(1, skill + drift + ruido));
  const nota = valorMaximo * fator;
  return Math.round(nota * 10) / 10;
}

async function main() {
  console.log("→ Carregando turmas do Ian...");
  const turmas = await prisma.turma.findMany({
    where: { professorId: PROFESSOR_ID },
    include: {
      alunos: { orderBy: { nome: "asc" } },
      periodos: {
        orderBy: { ordem: "asc" },
        include: { atividades: true },
      },
    },
  });

  // Pega todas as notas existentes do Ian de uma vez
  const notasExistentes = await prisma.nota.findMany({
    where: { professorId: PROFESSOR_ID },
    select: { alunoId: true, atividadeId: true },
  });
  const existingKeys = new Set(
    notasExistentes.map((n) => `${n.alunoId}_${n.atividadeId}`)
  );
  console.log(`  ${notasExistentes.length} notas já existem (serão preservadas)`);

  let totalCriadas = 0;
  let totalPuladas = 0;

  for (const turma of turmas) {
    console.log(`\n→ ${turma.nome} - ${turma.disciplina}`);
    console.log(
      `  ${turma.alunos.length} alunos × ${turma.periodos.flatMap((p) => p.atividades).length} atividades`
    );

    // Skill base por aluno
    const skills = new Map<string, number>();
    for (const a of turma.alunos) {
      skills.set(a.id, 0.4 + Math.random() * 0.6);
    }

    // Drift por bimestre (random walk pra criar tendências de melhoria/queda)
    const drifts = new Map<string, number[]>();
    for (const a of turma.alunos) {
      const arr: number[] = [];
      let curr = 0;
      for (let i = 0; i < 4; i++) {
        curr += (Math.random() - 0.5) * 0.2;
        curr = Math.max(-0.3, Math.min(0.3, curr));
        arr.push(curr);
      }
      drifts.set(a.id, arr);
    }

    const toCreate: {
      valor: number;
      alunoId: string;
      atividadeId: string;
      professorId: string;
    }[] = [];

    let puladasTurma = 0;
    for (const periodo of turma.periodos) {
      const driftIdx = periodo.ordem - 1;
      for (const atividade of periodo.atividades) {
        for (const aluno of turma.alunos) {
          const key = `${aluno.id}_${atividade.id}`;
          if (existingKeys.has(key)) {
            puladasTurma++;
            continue;
          }
          const skill = skills.get(aluno.id)!;
          const drift = drifts.get(aluno.id)![driftIdx];
          toCreate.push({
            valor: gerarNota(atividade.valorMaximo, skill, drift),
            alunoId: aluno.id,
            atividadeId: atividade.id,
            professorId: PROFESSOR_ID,
          });
        }
      }
    }

    if (toCreate.length > 0) {
      await prisma.nota.createMany({ data: toCreate });
    }

    console.log(
      `  ✓ ${toCreate.length} criadas, ${puladasTurma} preservadas`
    );
    totalCriadas += toCreate.length;
    totalPuladas += puladasTurma;
  }

  console.log(
    `\n✅ Total: ${totalCriadas} notas criadas, ${totalPuladas} preservadas.`
  );
}

main()
  .catch((e) => {
    console.error("ERRO:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
