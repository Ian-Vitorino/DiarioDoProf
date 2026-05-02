"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Dot,
} from "recharts";
import { cn } from "@/lib/utils";
import { bimestreNome } from "@/lib/turma-format";
import { formatBrazilDate } from "@/lib/dates";
import type { AtividadePonto, Trend } from "@/actions/dashboard-aluno";

interface Props {
  pontos: AtividadePonto[];
  trend: Trend;
}

const TREND_COLORS: Record<Trend, { stroke: string; fill: string }> = {
  evolucao: { stroke: "#10b981", fill: "#10b981" },
  estavel: { stroke: "#10b981", fill: "#10b981" },
  queda: { stroke: "#ef4444", fill: "#ef4444" },
};

function dotColor(valor: number) {
  if (valor < 6) return "#ef4444";
  if (valor < 7) return "#f59e0b";
  return "#10b981";
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (cx === null || cy === null || cx === undefined || cy === undefined) return null;
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill={dotColor(payload.nota)}
      stroke="#fff"
      strokeWidth={2}
    />
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-default-200 bg-white dark:bg-default-50 shadow-sm px-3 py-2 text-sm">
      <div className="font-semibold text-default-900">{p.nome}</div>
      <div className="text-xs text-default-500 mb-1.5">
        {bimestreNome(p.bimestre)} · {formatBrazilDate(p.data)}
      </div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: dotColor(p.nota) }}
        />
        <span className="font-semibold text-default-900">
          {p.nota.toFixed(1)}
        </span>
        <span className="text-xs text-default-500">
          ({p.valor} / {p.valorMaximo})
        </span>
      </div>
    </div>
  );
};

export function CronologicaChart({ pontos, trend }: Props) {
  const [bimAtivos, setBimAtivos] = React.useState<Set<number>>(
    new Set([1, 2, 3, 4])
  );

  const toggleBim = (n: number) => {
    setBimAtivos((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next.size === 0 ? new Set([1, 2, 3, 4]) : next;
    });
  };

  const filtrados = pontos.filter((p) => bimAtivos.has(p.bimestre));
  const dados = filtrados.map((p, i) => ({
    x: i,
    nota: Number(p.valorNormalizado.toFixed(1)),
    nome: p.nome,
    bimestre: p.bimestre,
    data: p.data,
    valor: p.valor,
    valorMaximo: p.valorMaximo,
    temNota: p.temNota,
  }));

  // Posições (índices) onde acontecem mudanças de bimestre — pra desenhar
  // linhas verticais separando os blocos.
  const dividers: { x: number; bim: number }[] = [];
  for (let i = 1; i < dados.length; i++) {
    if (dados[i].bimestre !== dados[i - 1].bimestre) {
      dividers.push({ x: i - 0.5, bim: dados[i].bimestre });
    }
  }

  const colors = TREND_COLORS[trend];
  const gradientId = `cronoFill-${trend}`;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h3 className="font-semibold text-default-900">
            Desempenho cronológico
          </h3>
          <p className="text-xs text-default-500 mt-0.5">
            Cada ponto é uma atividade, em ordem por data
          </p>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((n) => {
            const ativo = bimAtivos.has(n);
            return (
              <Button
                key={n}
                size="sm"
                variant={ativo ? undefined : "outline"}
                className={cn(
                  "h-8 px-3 text-xs",
                  !ativo && "text-default-600"
                )}
                onClick={() => toggleBim(n)}
              >
                {n}º Bim
              </Button>
            );
          })}
        </div>
      </div>

      {dados.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-sm text-default-500">
          Sem atividades nos bimestres selecionados
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dados}
              margin={{ top: 16, right: 16, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.fill} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colors.fill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis dataKey="x" hide />
              <YAxis
                domain={[0, 10]}
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              {dividers.map((d, i) => (
                <ReferenceLine
                  key={i}
                  x={d.x}
                  stroke="#d1d5db"
                  strokeDasharray="3 3"
                  label={{
                    value: `${d.bim}º`,
                    position: "insideTop",
                    fill: "#9ca3af",
                    fontSize: 11,
                  }}
                />
              ))}
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="nota"
                stroke={colors.stroke}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={<CustomDot />}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
