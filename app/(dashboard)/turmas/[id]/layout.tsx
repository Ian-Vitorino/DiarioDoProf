import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getTurma } from "@/actions/turmas";
import { Badge } from "@/components/ui/badge";
import { TurmaTabNav } from "@/components/turmas/tab-nav";
import { TurmaActions } from "@/components/turmas/turma-actions";
import { NIVEL_LABEL } from "@/lib/turma-format";

export default async function TurmaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const turma = await getTurma(params.id);
  if (!turma) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/turmas"
          className="inline-flex items-center text-sm text-default-600 hover:text-default-900 mb-3"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Turmas
        </Link>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-default-900 truncate">
                {turma.nome}
              </h1>
              <Badge
                color={turma.status === "ATIVA" ? "success" : "default"}
                variant="soft"
              >
                {turma.status === "ATIVA" ? "Ativa" : "Concluída"}
              </Badge>
            </div>
            <p className="text-sm text-default-600">
              {turma.disciplina} · {NIVEL_LABEL[turma.nivel] ?? turma.nivel} · {turma.ano}
            </p>
          </div>
          <TurmaActions
            turmaId={turma.id}
            turmaNome={turma.nome}
            status={turma.status}
          />
        </div>
      </div>

      <TurmaTabNav turmaId={turma.id} />

      <div>{children}</div>
    </div>
  );
}
