"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { bimestreNome } from "@/lib/turma-format";

interface Point {
  ordem: number;
  media: number | null;
}

interface Props {
  data: Point[];
}

function corDaMedia(m: number) {
  if (m < 6) return "#ef4444";
  if (m < 7) return "#f59e0b";
  return "#10b981";
}

export function MediaBimestreChart({ data }: Props) {
  const points = data.map((p) => ({
    ordem: p.ordem,
    label: `${p.ordem}º`,
    media: p.media === null ? 0 : Number(p.media.toFixed(1)),
    isNull: p.media === null,
  }));

  const temDados = points.some((p) => !p.isNull);

  return (
    <Card className="p-5">
      <div className="mb-3">
        <h3 className="font-semibold text-default-900">Média da turma</h3>
        <p className="text-xs text-default-500 mt-0.5">
          Por bimestre selecionado (0 a 10)
        </p>
      </div>

      {!temDados ? (
        <div className="h-[220px] flex items-center justify-center text-sm text-default-500">
          Sem dados nos bimestres selecionados
        </div>
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} tickLine={false} />
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
                  border: "1px solid hsl(var(--default-300))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelFormatter={(_l, payload) => {
                  const p = payload?.[0]?.payload as { ordem: number };
                  return p ? bimestreNome(p.ordem) : "";
                }}
                formatter={(v: number) => [v.toFixed(1), "Média da turma"]}
              />
              <Bar dataKey="media" radius={[6, 6, 0, 0]}>
                {points.map((p, i) => (
                  <Cell key={i} fill={p.isNull ? "#d1d5db" : corDaMedia(p.media)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
