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

interface AtividadeRank {
  id: string;
  nome: string;
  bimestre: number;
  media: number;
}

interface Props {
  data: AtividadeRank[];
}

function corDaMedia(m: number) {
  if (m < 6) return "#ef4444";
  if (m < 7) return "#f59e0b";
  return "#10b981";
}

export function AtividadesChart({ data }: Props) {
  // Recharts horizontal precisa de altura ~ qtde * 32px + padding
  const altura = Math.max(220, data.length * 36 + 30);

  const points = data.map((d) => ({
    ...d,
    label: `${d.nome}  ·  ${d.bimestre}º bim`,
    media: Number(d.media.toFixed(1)),
  }));

  return (
    <Card className="p-5">
      <div className="mb-3">
        <h3 className="font-semibold text-default-900">Atividades por desempenho</h3>
        <p className="text-xs text-default-500 mt-0.5">
          Média da turma por atividade (normalizada 0–10)
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-sm text-default-500">
          Sem atividades nos bimestres selecionados
        </div>
      ) : (
        <div style={{ height: altura }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={points}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis
                type="number"
                domain={[0, 10]}
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                stroke="#6b7280"
                fontSize={12}
                width={200}
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
                formatter={(v: number) => [v.toFixed(1), "Média da turma"]}
              />
              <Bar dataKey="media" radius={[0, 6, 6, 0]}>
                {points.map((p, i) => (
                  <Cell key={i} fill={corDaMedia(p.media)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
