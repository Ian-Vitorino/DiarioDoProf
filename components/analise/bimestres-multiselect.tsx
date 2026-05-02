"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { bimestreNome } from "@/lib/turma-format";

interface Props {
  turmaId: string;
  selecionados: number[]; // ordens 1-4
}

export function BimestresMultiselect({ turmaId, selecionados }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const allSelected =
    selecionados.length === 4 ||
    selecionados.length === 0;

  const navigateWith = (next: number[]) => {
    const params = new URLSearchParams();
    params.set("turma", turmaId);
    if (next.length > 0 && next.length < 4) {
      params.set("bimestres", next.sort((a, b) => a - b).join(","));
    }
    router.push(`/analise-turma?${params.toString()}`);
  };

  const toggle = (ordem: number) => {
    const current = allSelected ? [] : selecionados;
    let next: number[];
    if (allSelected) {
      // Estava em "todos" → começa com só o clicado fora
      next = [1, 2, 3, 4].filter((n) => n !== ordem);
    } else if (current.includes(ordem)) {
      next = current.filter((n) => n !== ordem);
    } else {
      next = [...current, ordem];
    }
    navigateWith(next);
  };

  const label = (() => {
    if (allSelected) return "Todos os bimestres";
    const names = selecionados
      .sort((a, b) => a - b)
      .map((o) => `${o}º`);
    return names.join(", ");
  })();

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-default-700 block">
        Bimestres
      </label>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-64 justify-between font-normal"
          >
            <span className="truncate text-default-800">{label}</span>
            <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel>Selecione</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {[1, 2, 3, 4].map((ordem) => (
            <DropdownMenuCheckboxItem
              key={ordem}
              checked={allSelected || selecionados.includes(ordem)}
              onCheckedChange={() => toggle(ordem)}
              onSelect={(e) => e.preventDefault()}
            >
              {bimestreNome(ordem)}
            </DropdownMenuCheckboxItem>
          ))}
          {!allSelected && (
            <>
              <DropdownMenuSeparator />
              <button
                type="button"
                className="w-full text-left text-xs text-default-600 hover:text-default-900 px-2 py-1.5"
                onClick={() => navigateWith([])}
              >
                Limpar (selecionar todos)
              </button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
