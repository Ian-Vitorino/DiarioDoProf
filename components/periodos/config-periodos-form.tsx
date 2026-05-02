"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import Flatpickr from "react-flatpickr";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { updatePeriodosVigencia } from "@/actions/periodos";
import { bimestreNome } from "@/lib/turma-format";

interface Periodo {
  id: string;
  ordem: number;
  dataInicio: Date | null;
  dataFim: Date | null;
}

// DB armazena datas como UTC midnight (vindo de `new Date("YYYY-MM-DD")`).
// Extraímos os componentes via UTC pra evitar drift por timezone local.
function dbToIsoString(d: Date | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

// Converte string ISO "YYYY-MM-DD" pra Date em LOCAL midnight,
// pra que o Flatpickr exiba a data correta no fuso do usuário.
function isoToLocalDate(iso: string | undefined | null): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

// Flatpickr retorna Date em LOCAL midnight; extraímos componentes locais.
function localToIsoString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface FormBimestre {
  dataInicio: string;
  dataFim: string;
}

interface FormData {
  bimestres: FormBimestre[];
}

interface Props {
  turmaId: string;
  periodos: Periodo[];
}

const inputClass =
  "w-full bg-background border border-default-300 dark:border-default-700 rounded-md px-3 h-9 text-sm placeholder:text-accent-foreground/50 focus:outline-none focus:border-primary transition";

export function ConfigPeriodosForm({ turmaId, periodos }: Props) {
  const [isPending, startTransition] = React.useTransition();

  const { handleSubmit, control } = useForm<FormData>({
    defaultValues: {
      bimestres: periodos.map((p) => ({
        dataInicio: dbToIsoString(p.dataInicio),
        dataFim: dbToIsoString(p.dataFim),
      })),
    },
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      bimestres: periodos.map((p, i) => ({
        id: p.id,
        dataInicio: data.bimestres[i]?.dataInicio || "",
        dataFim: data.bimestres[i]?.dataFim || "",
      })),
    };
    startTransition(async () => {
      try {
        await updatePeriodosVigencia(turmaId, payload);
        toast.success("Vigências salvas");
      } catch (err) {
        toast.error((err as Error)?.message ?? "Erro ao salvar");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-default-600">
        Configure as datas de início e fim de cada bimestre. Campos em branco indicam vigência ainda não definida.
      </p>

      {periodos.map((p, idx) => (
        <Card key={p.id} className="p-5">
          <h3 className="font-semibold text-default-900 mb-4">
            {bimestreNome(p.ordem)}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`inicio-${p.id}`}>Início</Label>
              <Controller
                control={control}
                name={`bimestres.${idx}.dataInicio`}
                render={({ field }) => (
                  <Flatpickr
                    options={{
                      dateFormat: "d/m/Y",
                      locale: Portuguese,
                      allowInput: true,
                      defaultDate: isoToLocalDate(field.value),
                    }}
                    onChange={(dates) =>
                      field.onChange(dates[0] ? localToIsoString(dates[0]) : "")
                    }
                    placeholder="dd/mm/aaaa"
                    className={inputClass}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor={`fim-${p.id}`}>Fim</Label>
              <Controller
                control={control}
                name={`bimestres.${idx}.dataFim`}
                render={({ field }) => (
                  <Flatpickr
                    options={{
                      dateFormat: "d/m/Y",
                      locale: Portuguese,
                      allowInput: true,
                      defaultDate: isoToLocalDate(field.value),
                    }}
                    onChange={(dates) =>
                      field.onChange(dates[0] ? localToIsoString(dates[0]) : "")
                    }
                    placeholder="dd/mm/aaaa"
                    className={inputClass}
                  />
                )}
              />
            </div>
          </div>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar
        </Button>
      </div>
    </form>
  );
}
