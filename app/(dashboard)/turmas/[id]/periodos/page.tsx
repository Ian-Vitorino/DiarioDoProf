import { listPeriodosByTurma } from "@/actions/periodos";
import { ConfigPeriodosForm } from "@/components/periodos/config-periodos-form";

export default async function PeriodosTabPage({
  params,
}: {
  params: { id: string };
}) {
  const periodos = await listPeriodosByTurma(params.id);

  return <ConfigPeriodosForm turmaId={params.id} periodos={periodos} />;
}
