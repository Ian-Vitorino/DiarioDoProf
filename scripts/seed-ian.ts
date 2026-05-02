import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PROFESSOR_ID = "b7acd583-8e19-4945-a9a8-e76f1a1151d6"; // Ian vitorino

const NOMES = [
  "Ana Beatriz Silva", "André Lopes Costa", "Beatriz Almeida Souza", "Bruno Castro Lima",
  "Camila Rocha Santos", "Carlos Eduardo Pereira", "Daniela Mendes Cunha", "Diego Ribeiro Carvalho",
  "Eduarda Cardoso Vieira", "Eduardo Martins Barros", "Fabiana Gomes Reis", "Felipe Cavalcanti Dias",
  "Fernanda Nunes Barbosa", "Gabriel Souza Araújo", "Helena Oliveira Castro", "Henrique Pinto Mendes",
  "Isabela Cardoso Reis", "João Pedro Silva", "Júlia Lima Costa", "Júlio César Almeida",
  "Larissa Pereira Souza", "Laura Martins Lima", "Leonardo Teixeira Carvalho", "Letícia Cunha Ribeiro",
  "Lucas Almeida Costa", "Luiza Vieira Marques", "Manuela Araújo Silva", "Mariana Freitas Santos",
  "Mateus Rodrigues Oliveira", "Maria Eduarda Santos", "Murilo Pinto Cavalcanti", "Natália Castro Lopes",
  "Otávio Lopes Reis", "Pedro Henrique Oliveira", "Rafael Ferreira Costa", "Renata Souza Lima",
  "Ricardo Almeida Pereira", "Sara Marques Santos", "Sofia Carvalho Mendes", "Thiago Barros Cunha",
  "Valentina Reis Silva", "Vinícius Cardoso Souza", "Vitor Hugo Andrade", "Yasmin Paula Rocha",
  "Caio Correia Castro", "Davi Oliveira Lima", "Enzo Souza Costa", "Gabriela Reis Mendes",
  "Gustavo Dias Ferreira", "Pietro Silva Almeida",
];

// Bimestres 2026 (datas típicas do calendário escolar brasileiro)
const VIGENCIAS_2026 = [
  { ordem: 1, dataInicio: new Date("2026-02-03"), dataFim: new Date("2026-04-17") },
  { ordem: 2, dataInicio: new Date("2026-04-27"), dataFim: new Date("2026-07-10") },
  { ordem: 3, dataInicio: new Date("2026-07-27"), dataFim: new Date("2026-10-02") },
  { ordem: 4, dataInicio: new Date("2026-10-13"), dataFim: new Date("2026-12-18") },
];

const TURMAS = [
  {
    nome: "5º A",
    serie: "5",
    turma: "A",
    nivel: "FUNDAMENTAL_I" as const,
    disciplina: "Ciências",
    qtdAlunos: 38,
  },
  {
    nome: "9º B",
    serie: "9",
    turma: "B",
    nivel: "FUNDAMENTAL_II" as const,
    disciplina: "Matemática",
    qtdAlunos: 42,
  },
  {
    nome: "2º A",
    serie: "2",
    turma: "A",
    nivel: "MEDIO" as const,
    disciplina: "História",
    qtdAlunos: 35,
  },
];

const ATIVIDADES_POR_BIMESTRE = [
  { nome: "Prova mensal", valorMaximo: 10 },
  { nome: "Trabalho em grupo", valorMaximo: 10 },
  { nome: "Avaliação bimestral", valorMaximo: 10 },
];

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function main() {
  console.log("→ Limpando turmas existentes do Ian...");
  const deleted = await prisma.turma.deleteMany({
    where: { professorId: PROFESSOR_ID },
  });
  console.log(`  ${deleted.count} turma(s) removida(s) (cascade levou alunos/períodos/atividades)`);

  for (const t of TURMAS) {
    console.log(`\n→ Criando turma "${t.nome} - ${t.disciplina}"...`);

    // 1) Cria turma + 4 períodos com vigências
    const turma = await prisma.turma.create({
      data: {
        nome: t.nome,
        serie: t.serie,
        turma: t.turma,
        nivel: t.nivel,
        disciplina: t.disciplina,
        ano: 2026,
        professorId: PROFESSOR_ID,
        periodos: {
          create: VIGENCIAS_2026.map((v) => ({
            ordem: v.ordem,
            dataInicio: v.dataInicio,
            dataFim: v.dataFim,
            professorId: PROFESSOR_ID,
          })),
        },
      },
      include: { periodos: { orderBy: { ordem: "asc" } } },
    });
    console.log(`  ✓ Turma ${turma.id}`);
    console.log(`  ✓ ${turma.periodos.length} bimestres com vigências`);

    // 2) Cria alunos (numeração é derivada da ordem alfabética em runtime)
    const nomesEscolhidos = shuffled(NOMES).slice(0, t.qtdAlunos);
    await prisma.aluno.createMany({
      data: nomesEscolhidos.map((nome) => ({
        nome,
        turmaId: turma.id,
        professorId: PROFESSOR_ID,
      })),
    });
    console.log(`  ✓ ${t.qtdAlunos} alunos`);

    // 3) Cria atividades para cada bimestre
    const atividadesData = turma.periodos.flatMap((p) =>
      ATIVIDADES_POR_BIMESTRE.map((a) => ({
        nome: a.nome,
        valorMaximo: a.valorMaximo,
        periodoId: p.id,
        professorId: PROFESSOR_ID,
      }))
    );
    await prisma.atividade.createMany({ data: atividadesData });
    console.log(`  ✓ ${atividadesData.length} atividades (${ATIVIDADES_POR_BIMESTRE.length} por bimestre)`);
  }

  console.log("\n✅ Seed concluído.");
}

main()
  .catch((e) => {
    console.error("ERRO:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
