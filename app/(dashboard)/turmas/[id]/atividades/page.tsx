import { listPeriodosComAtividades } from "@/actions/atividades";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NovaAtividadeButton } from "@/components/atividades/nova-atividade-button";
import { AtividadeActions } from "@/components/atividades/atividade-actions";
import { ModoCalculoToggle } from "@/components/atividades/modo-toggle";
import { bimestreNome } from "@/lib/turma-format";
import { formatBrazilDate } from "@/lib/dates";

export default async function AtividadesTabPage({
  params,
}: {
  params: { id: string };
}) {
  const periodos = await listPeriodosComAtividades(params.id);

  const periodoOptions = periodos.map((p) => ({
    id: p.id,
    nome: bimestreNome(p.ordem),
    modo: p.modoCalculo as "MEDIA" | "SOMA",
    dataInicio: p.dataInicio,
    dataFim: p.dataFim,
  }));

  return (
    <div className="space-y-6">
      {periodos.map((periodo) => {
        const modo = periodo.modoCalculo as "MEDIA" | "SOMA";
        return (
          <div key={periodo.id} className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-default-900">
                  {bimestreNome(periodo.ordem)}
                </h3>
                <ModoCalculoToggle periodoId={periodo.id} modo={modo} />
              </div>
              <NovaAtividadeButton
                periodoId={periodo.id}
                periodoNome={bimestreNome(periodo.ordem)}
                modo={modo}
                dataInicio={periodo.dataInicio}
                dataFim={periodo.dataFim}
                turmaId={params.id}
              />
            </div>

            {periodo.atividades.length === 0 ? (
              <Card className="p-6 text-center text-sm text-default-500">
                Nenhuma atividade neste período ainda.
              </Card>
            ) : (
              <Card className="p-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-32">Data</TableHead>
                      <TableHead className="w-32">
                        {modo === "SOMA" ? "Peso" : "Valor máximo"}
                      </TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periodo.atividades.map((atividade) => (
                      <TableRow key={atividade.id}>
                        <TableCell className="font-medium">{atividade.nome}</TableCell>
                        <TableCell className="text-default-600">
                          {formatBrazilDate(atividade.data)}
                        </TableCell>
                        <TableCell className="text-default-600">
                          {modo === "SOMA" ? atividade.valorMaximo : 10}
                        </TableCell>
                        <TableCell>
                          <AtividadeActions
                            atividade={atividade}
                            periodos={periodoOptions}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        );
      })}
    </div>
  );
}
