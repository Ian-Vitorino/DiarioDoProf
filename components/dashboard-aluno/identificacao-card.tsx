import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Image from "next/image";
import avatarPlaceholder from "@/public/images/avatar/avatar-5.jpg";
import { NIVEL_LABEL } from "@/lib/turma-format";
import type { Trend } from "@/actions/dashboard-aluno";

interface Props {
  aluno: { nome: string; numeroChamada: number };
  turma: { nome: string; disciplina: string; nivel: string; ano: number };
  trend: Trend;
}

const trendConfig = {
  evolucao: {
    icon: TrendingUp,
    label: "Evoluindo",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  estavel: {
    icon: Minus,
    label: "Estável",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  queda: {
    icon: TrendingDown,
    label: "Em queda",
    className:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  },
};

export function IdentificacaoCard({ aluno, turma, trend }: Props) {
  const t = trendConfig[trend];
  const Icon = t.icon;

  return (
    <Card className="p-6 flex items-center gap-5">
      <div className="relative shrink-0">
        <Image
          src={avatarPlaceholder}
          alt={aluno.nome}
          width={64}
          height={64}
          className="rounded-full ring-2 ring-default-200"
        />
        <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
          {aluno.numeroChamada}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-bold text-default-900 truncate">
          {aluno.nome}
        </h2>
        <p className="text-sm text-default-600">
          {turma.nome} · {turma.disciplina} ·{" "}
          {NIVEL_LABEL[turma.nivel] ?? turma.nivel} · {turma.ano}
        </p>
      </div>
      <Badge
        variant="outline"
        className={`gap-1.5 px-3 py-1.5 text-sm ${t.className}`}
      >
        <Icon className="w-4 h-4" />
        {t.label}
      </Badge>
    </Card>
  );
}
