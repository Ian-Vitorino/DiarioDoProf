"use server";

import { hash } from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export type SignupInput = z.infer<typeof signupSchema>;

export type SignupResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createAccount(input: SignupInput): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { nome, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.professor.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { ok: false, error: "Este email já está cadastrado" };
  }

  const passwordHash = await hash(password, 10);
  await prisma.professor.create({
    data: {
      nome,
      email: normalizedEmail,
      passwordHash,
    },
  });

  return { ok: true };
}
