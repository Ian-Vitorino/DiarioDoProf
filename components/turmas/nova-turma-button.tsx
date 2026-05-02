"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { createTurma } from "@/actions/turmas";

const schema = z.object({
  serie: z.string().min(1, "Série é obrigatória"),
  turma: z.string().min(1, "Turma é obrigatória").max(10),
  nivel: z.enum(["FUNDAMENTAL_I", "FUNDAMENTAL_II", "MEDIO"]),
  disciplina: z.string().min(1, "Disciplina é obrigatória"),
  ano: z.coerce.number().int().min(2000).max(2100),
});

type FormData = z.infer<typeof schema>;

export function NovaTurmaButton() {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      serie: "",
      turma: "",
      nivel: "FUNDAMENTAL_II",
      disciplina: "",
      ano: new Date().getFullYear(),
    },
  });

  const nivel = watch("nivel");

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        await createTurma(data);
        toast.success("Turma criada");
        reset();
        setOpen(false);
      } catch (err) {
        toast.error((err as Error)?.message ?? "Erro ao criar turma");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova turma
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova turma</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="serie">Série</Label>
              <div className="relative">
                <Input
                  id="serie"
                  type="number"
                  min={1}
                  {...register("serie")}
                  placeholder="1"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-default-500 pointer-events-none select-none">
                  º
                </span>
              </div>
              {errors.serie && (
                <p className="text-destructive text-sm mt-1">{errors.serie.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="turma">Turma</Label>
              <Input
                id="turma"
                {...register("turma")}
                placeholder="Ex: A"
                maxLength={10}
              />
              {errors.turma && (
                <p className="text-destructive text-sm mt-1">{errors.turma.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="nivel">Ensino</Label>
            <Select
              value={nivel}
              onValueChange={(v: "FUNDAMENTAL_I" | "FUNDAMENTAL_II" | "MEDIO") =>
                setValue("nivel", v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FUNDAMENTAL_I">Fundamental I</SelectItem>
                <SelectItem value="FUNDAMENTAL_II">Fundamental II</SelectItem>
                <SelectItem value="MEDIO">Médio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ano">Ano</Label>
            <Input id="ano" type="number" {...register("ano")} />
            {errors.ano && (
              <p className="text-destructive text-sm mt-1">{errors.ano.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="disciplina">Disciplina</Label>
            <Input
              id="disciplina"
              {...register("disciplina")}
              placeholder="Ex: Matemática"
            />
            {errors.disciplina && (
              <p className="text-destructive text-sm mt-1">{errors.disciplina.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
