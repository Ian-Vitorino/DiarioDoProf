import { redirect } from "next/navigation";

export default function TurmaIndex({ params }: { params: { id: string } }) {
  redirect(`/turmas/${params.id}/alunos`);
}
