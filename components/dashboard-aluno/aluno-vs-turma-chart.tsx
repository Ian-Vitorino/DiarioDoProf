"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { bimestreNome } from "@/lib/turma-format";

interface Point {
  ordem: number;
  media: number | null;
}

interface Props {
  aluno: Point[];
  turma: Point[];
}

export function AlunoVsTurmaChart({ aluno, turma }: Props) {
  const data = aluno.map((p, i) => ({
    label: `${p.ordem}º Bim`,
    aluno: p.media === null ? null : Number(p.media.toFixed(1)),
    turma:
      turma[i]?.media === null || turma[i]?.media === undefined
        ? null
        : Number(turma[i].media!.toFixed(1)),
  }));

  const temDados = data.some((d) => d.aluno !== null);

  return (
    <Card className="p-5">
      <div className="mb-3">
        <h3 className="font-semibold text-default-900">Aluno vs Turma</h3>
        <p className="text-xs text-default-500 mt-0.5">
          Média por bimestre comparada com a média da turma
        </p>
      </div>
      {!temDados ? (
        <div className="h-[240px] flex items-center justify-center text-sm text-default-500">
          Sem médias calculadas ainda
        </div>
      ) : (
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 16, right: 16, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="label"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload as { label: string } | undefined;
                  return p?.label ?? "";
                }}
                formatter={(v: any, name: any) => [
                  v === null || v === undefined ? "—" : Number(v).toFixed(1),
                  name === "aluno" ? "Aluno" : "Turma",
                ]}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                formatter={(v) => (v === "aluno" ? "Aluno" : "Turma")}
              />
              <Line
                type="monotone"
                dataKey="aluno"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: "#10b981", r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="turma"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ fill: "#9ca3af", r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
