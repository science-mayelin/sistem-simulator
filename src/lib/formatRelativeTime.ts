/** Spanish relative time for ISO timestamps (client or server). */
export function formatRelativeTime(isoString: string | undefined): string {
  if (!isoString) return "desconocido";
  const t = new Date(isoString).getTime();
  if (isNaN(t)) return "desconocido";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "justo ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} días`;
}
