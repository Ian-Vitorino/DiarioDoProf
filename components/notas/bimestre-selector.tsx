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
import { bimestreNome } from "@/lib/turma-format";

interface Props {
  turmaId: string;
  value: string;
}

export function BimestreSelector({ turmaId, value }: Props) {
  const router = useRouter();

  return (
    <div className="max-w-xs">
      <Label className="mb-2 block">Bimestre</Label>
      <Select
        value={value}
        onValueChange={(v) => router.push(`/notas?turma=${turmaId}&bimestre=${v}`)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um bimestre" />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4].map((n) => (
            <SelectItem key={n} value={String(n)}>
              {bimestreNome(n)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
