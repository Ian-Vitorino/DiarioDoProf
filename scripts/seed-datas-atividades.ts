import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PROFESSOR_ID = "b7acd583-8e19-4945-a9a8-e76f1a1151d6"; // Ian vitorino

/**
 * Trunca um timestamp pra UTC midnight do mesmo dia,
 * pra ficar consistente com o resto do app.
 */
function utcMidnight(ms: number): Date {
  const d = new Date(ms);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

async function main() {
  console.log("→ Carregando bimestres e atividades do Ian...");

  const periodos = await prisma.periodo.findMany({
    where: { professorId: PROFESSOR_ID },
    include: { atividades: { orderBy: { createdAt: "asc" } } },
    orderBy: { ordem: "asc" },
  });

  let totalAtualizadas = 0;
  let totalPreservadas = 0;
  let totalSemVigencia = 0;

  for (const periodo of periodos) {
    if (!periodo.dataInicio || !periodo.dataFim) {
      totalSemVigencia += periodo.atividades.length;
      continue;
    }

    const inicio = periodo.dataInicio.getTime();
    const fim = periodo.dataFim.getTime();
    const duracao = fim - inicio;
    const atividades = periodo.atividades;
    const N = atividades.length;
    if (N === 0) continue;

    for (let i = 0; i < N; i++) {
      const atividade = atividades[i];
      if (atividade.data !== null) {
        totalPreservadas++;
        continue;
      }

      // Posição (i+1) dentro de (N+1) segmentos
      const offset = (duracao * (i + 1)) / (N + 1);
      const dataAtividade = utcMidnight(inicio + offset);

      await prisma.atividade.update({
        where: { id: atividade.id },
        data: { data: dataAtividade },
      });
      totalAtualizadas++;
    }
  }

  console.log(
    `\n✅ ${totalAtualizadas} atividades atualizadas, ${totalPreservadas} preservadas, ${totalSemVigencia} sem vigência.`
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
