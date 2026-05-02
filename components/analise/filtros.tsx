"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { bimestreNome } from "@/lib/turma-format";

interface Props {
  turmaId: string;
  bim1: string;
  bim2: string;
}

export function AnaliseFiltros({ turmaId, bim1, bim2 }: Props) {
  const router = useRouter();

  const navigate = (b1: string, b2: string) => {
    const params = new URLSearchParams();
    params.set("turma", turmaId);
    if (b1) params.set("bimestre1", b1);
    if (b2) params.set("bimestre2", b2);
    router.push(`/analise-turma?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-40">
        <Label className="mb-2 block">Bimestre 1</Label>
        <Select value={bim1} onValueChange={(v) => navigate(v === "_" ? "" : v, bim2)}>
          <SelectTrigger>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">Geral</SelectItem>
            {[1, 2, 3, 4].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {bimestreNome(n)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-40">
        <Label className="mb-2 block">Bimestre 2</Label>
        <Select value={bim2} onValueChange={(v) => navigate(bim1, v === "_" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">Geral</SelectItem>
            {[1, 2, 3, 4].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {bimestreNome(n)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {(bim1 || bim2) && (
        <Button variant="outline" size="sm" onClick={() => navigate("", "")}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
