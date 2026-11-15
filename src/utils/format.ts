export function formatDurationHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/** Same bands as the Flink job: ₹ <=300, ₹₹ <=700, ₹₹₹ <=1500, ₹₹₹₹ above. */
export function priceBand(costForTwo: number | null | undefined): string {
  if (costForTwo == null) return '—';
  if (costForTwo <= 300) return '₹';
  if (costForTwo <= 700) return '₹₹';
  if (costForTwo <= 1500) return '₹₹₹';
  return '₹₹₹₹';
}

export function formatRupees(n: number | null | undefined): string {
  return n == null ? 'n/a' : `₹${n.toLocaleString('en-IN')}`;
}

export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/** The dataset has no photos; the hotel site ships 8 food photos, so each restaurant id picks one, stably. */
export function cardPhoto(id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `/Resources/img/${(h % 8) + 1}.jpg`;
}
