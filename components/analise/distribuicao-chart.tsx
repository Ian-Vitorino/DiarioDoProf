"use client";

import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  vermelha: number;
  alerta: number;
  azul: number;
}

const COLORS = {
  vermelha: "#ef4444",
  alerta: "#f59e0b",
  azul: "#10b981",
};

export function DistribuicaoChart({ vermelha, alerta, azul }: Props) {
  const total = vermelha + alerta + azul;
  const data = [
    { name: "Em risco (< 6)", value: vermelha, color: COLORS.vermelha },
    { name: "Alerta (6 a 7)", value: alerta, color: COLORS.alerta },
    { name: "Bom (≥ 7)", value: azul, color: COLORS.azul },
  ];

  const legenda = [
    { label: "Em risco", count: vermelha, color: COLORS.vermelha, range: "< 6" },
    { label: "Alerta", count: alerta, color: COLORS.alerta, range: "6 a 7" },
    { label: "Bom", count: azul, color: COLORS.azul, range: "≥ 7" },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-default-900">Distribuição de notas</h3>
          <p className="text-xs text-default-500 mt-0.5">
            Alunos por faixa de média
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-default-500">
          Sem notas suficientes
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={85}
                  strokeWidth={2}
                >
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid hsl(var(--default-300))",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v} alunos`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5">
            {legenda.map((l) => (
              <div key={l.label} className="flex items-center gap-3">
                <span
                  className="inline-block w-3 h-3 rounded-sm shrink-0"
                  style={{ background: l.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-default-900">
                    {l.label}
                  </div>
                  <div className="text-xs text-default-500">{l.range}</div>
                </div>
                <div className="text-sm font-semibold text-default-900">
                  {l.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
