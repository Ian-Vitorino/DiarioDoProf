import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  tone?: "default" | "success" | "warning" | "destructive";
}

const TONE: Record<string, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  destructive: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function StatCard({ icon, value, label, tone = "default" }: Props) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={cn("rounded-lg p-3", TONE[tone])}>{icon}</div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-default-900 leading-tight">
          {value}
        </div>
        <div className="text-xs text-default-600">{label}</div>
      </div>
    </Card>
  );
}
