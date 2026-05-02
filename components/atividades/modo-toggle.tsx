"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { setModoCalculoPeriodo } from "@/actions/periodos";

type Modo = "MEDIA" | "SOMA";

interface Props {
  periodoId: string;
  modo: Modo;
}

export function ModoCalculoToggle({ periodoId, modo }: Props) {
  const [isPending, startTransition] = React.useTransition();
  const [optimistic, setOptimistic] = React.useState<Modo>(modo);

  React.useEffect(() => {
    setOptimistic(modo);
  }, [modo]);

  const change = (next: Modo) => {
    if (next === optimistic) return;
    setOptimistic(next);
    startTransition(async () => {
      try {
        await setModoCalculoPeriodo(periodoId, next);
      } catch (err) {
        toast.error((err as Error)?.message ?? "Erro ao trocar modo");
        setOptimistic(modo);
      }
    });
  };

  const baseClass =
    "px-3 py-1 text-xs font-medium rounded-md transition-colors";

  return (
    <div
      className="inline-flex items-center gap-1 rounded-md border border-default-300 p-0.5 bg-default-50 dark:bg-default-100/50"
      aria-disabled={isPending}
    >
      <button
        type="button"
        onClick={() => change("MEDIA")}
        disabled={isPending}
        className={cn(
          baseClass,
          optimistic === "MEDIA"
            ? "bg-primary text-primary-foreground"
            : "text-default-700 hover:bg-default-100"
        )}
      >
        Média
      </button>
      <button
        type="button"
        onClick={() => change("SOMA")}
        disabled={isPending}
        className={cn(
          baseClass,
          optimistic === "SOMA"
            ? "bg-primary text-primary-foreground"
            : "text-default-700 hover:bg-default-100"
        )}
      >
        Soma
      </button>
    </div>
  );
}
