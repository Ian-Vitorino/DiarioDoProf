import { listAlunosByTurma } from "@/actions/alunos";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NovoAlunoButton } from "@/components/alunos/novo-aluno-button";
import { AlunoActions } from "@/components/alunos/aluno-actions";

export default async function AlunosTabPage({ params }: { params: { id: string } }) {
  const alunos = await listAlunosByTurma(params.id);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <NovoAlunoButton turmaId={params.id} />
      </div>

      {alunos.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-default-700 mb-2 text-lg font-medium">
            Nenhum aluno cadastrado
          </p>
          <p className="text-sm text-default-500">
            Clique em <strong>Adicionar aluno</strong> para começar.
          </p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Nº</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alunos.map((aluno, index) => (
                <TableRow key={aluno.id}>
                  <TableCell className="text-default-600">{index + 1}</TableCell>
                  <TableCell className="font-medium">{aluno.nome}</TableCell>
                  <TableCell>
                    <AlunoActions aluno={aluno} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
