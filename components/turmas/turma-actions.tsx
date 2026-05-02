"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2, Archive, ArchiveRestore, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { archiveTurma, reactivateTurma, removeTurma } from "@/actions/turmas";

interface Props {
  turmaId: string;
  turmaNome: string;
  status: "ATIVA" | "CONCLUIDA";
}

export function TurmaActions({ turmaId, turmaNome, status }: Props) {
  const router = useRouter();
  const [removeOpen, setRemoveOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const onArchive = () => {
    startTransition(async () => {
      try {
        await archiveTurma(turmaId);
        toast.success("Turma concluída");
      } catch (err) {
        toast.error((err as Error)?.message ?? "Erro ao concluir");
      }
    });
  };

  const onReactivate = () => {
    startTransition(async () => {
      try {
        await reactivateTurma(turmaId);
        toast.success("Turma reativada");
      } catch (err) {
        toast.error((err as Error)?.message ?? "Erro ao reativar");
      }
    });
  };

  const onRemove = () => {
    startTransition(async () => {
      try {
        await removeTurma(turmaId);
        toast.success("Turma removida");
        router.push("/turmas");
      } catch (err) {
        toast.error((err as Error)?.message ?? "Erro ao remover");
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={isPending}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status === "ATIVA" ? (
            <DropdownMenuItem onSelect={onArchive}>
              <Archive className="w-4 h-4 mr-2" />
              Concluir turma
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={onReactivate}>
              <ArchiveRestore className="w-4 h-4 mr-2" />
              Reativar turma
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setRemoveOpen(true)}
            className="text-destructive"
          >
            <Trash className="w-4 h-4 mr-2" />
            Excluir turma
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir turma</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{turmaNome}</strong>?
              Todos os alunos, períodos, atividades e notas vinculados serão
              apagados permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onRemove();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
