import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getProfessorIdOrThrow(): Promise<string> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) {
    throw new Error("Não autenticado");
  }
  return id;
}
