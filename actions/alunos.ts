"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getProfessorIdOrThrow } from "@/lib/session";

const alunoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

export async function listAlunosByTurma(turmaId: string) {
  const professorId = await getProfessorIdOrThrow();
  return prisma.aluno.findMany({
    where: { turmaId, professorId },
    orderBy: { nome: "asc" },
  });
}

export async function createAluno(turmaId: string, input: unknown) {
  const professorId = await getProfessorIdOrThrow();
  const data = alunoSchema.parse(input);

  const turma = await prisma.turma.findFirst({
    where: { id: turmaId, professorId },
    select: { id: true },
  });
  if (!turma) throw new Error("Turma não encontrada");

  const aluno = await prisma.aluno.create({
    data: {
      nome: data.nome,
      turmaId,
      professorId,
    },
  });
  revalidatePath(`/turmas/${turmaId}/alunos`);
  return aluno;
}

export async function updateAluno(id: string, input: unknown) {
  const professorId = await getProfessorIdOrThrow();
  const data = alunoSchema.parse(input);

  const found = await prisma.aluno.findFirst({
    where: { id, professorId },
    select: { id: true, turmaId: true },
  });
  if (!found) throw new Error("Aluno não encontrado");

  await prisma.aluno.update({
    where: { id },
    data: { nome: data.nome },
  });
  revalidatePath(`/turmas/${found.turmaId}/alunos`);
}

export async function removeAluno(id: string) {
  const professorId = await getProfessorIdOrThrow();
  const found = await prisma.aluno.findFirst({
    where: { id, professorId },
    select: { id: true, turmaId: true },
  });
  if (!found) throw new Error("Aluno não encontrado");

  await prisma.aluno.delete({ where: { id } });
  revalidatePath(`/turmas/${found.turmaId}/alunos`);
}
