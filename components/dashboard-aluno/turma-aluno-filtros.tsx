"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TurmaOption {
  id: string;
  nome: string;
  disciplina: string;
}

interface AlunoOption {
  id: string;
  nome: string;
}

interface Props {
  turmas: TurmaOption[];
  alunos: AlunoOption[];
  turmaId: string | null;
  alunoId: string | null;
}

export function TurmaAlunoFiltros({ turmas, alunos, turmaId, alunoId }: Props) {
  const router = useRouter();

  const onTurmaChange = (id: string) => {
    router.push(`/dashboard-aluno?turma=${id}`);
  };

  const onAlunoChange = (id: string) => {
    router.push(`/dashboard-aluno?turma=${turmaId}&aluno=${id}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <Label className="mb-2 block">Turma</Label>
        <Select value={turmaId ?? ""} onValueChange={onTurmaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma turma" />
          </SelectTrigger>
          <SelectContent>
            {turmas.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nome} · {t.disciplina}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-2 block">Aluno</Label>
        <Select
          value={alunoId ?? ""}
          onValueChange={onAlunoChange}
          disabled={!turmaId}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                turmaId ? "Selecione um aluno" : "Selecione uma turma primeiro"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {alunos.map((a, i) => (
              <SelectItem key={a.id} value={a.id}>
                {i + 1}. {a.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
