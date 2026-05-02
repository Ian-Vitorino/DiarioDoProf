// Helpers para lidar com datas "calendário" (sem hora) entre DB, form e UI.
// Convenção: DB armazena como UTC midnight; form usa string ISO "YYYY-MM-DD";
// Flatpickr usa Date em LOCAL midnight pra exibir corretamente no fuso do usuário.

export function dbToIsoString(d: Date | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function isoToLocalDate(iso: string | undefined | null): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

export function localToIsoString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Converte uma Date vinda do banco (UTC midnight) numa Date local-midnight
 * com o mesmo dia/mês/ano. Use ao passar limites de data pro Flatpickr,
 * que interpreta valores em horário local.
 */
export function dbDateToLocalDate(
  d: Date | null | undefined
): Date | undefined {
  return isoToLocalDate(dbToIsoString(d));
}

export function formatBrazilDate(d: Date | null | undefined): string {
  if (!d) return "—";
  const iso = dbToIsoString(d);
  const [y, m, day] = iso.split("-");
  return `${day}/${m}/${y}`;
}
