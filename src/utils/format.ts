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

const VISUALS: [RegExp, string][] = [
  [/dosa|idli|south indian|udupi|andhra|kerala|chettinad/i, '🥘'],
  [/biryani|hyderabadi|mughlai/i, '🍚'],
  [/north indian|punjabi|thali|paratha|kebab|tandoor/i, '🍛'],
  [/pizza|italian|pasta/i, '🍕'],
  [/burger|fast food|american|fries|sandwich/i, '🍔'],
  [/chinese|momos|noodle|asian|thai|japanese|sushi/i, '🥡'],
  [/dessert|bakery|cake|ice cream|waffle|sweet/i, '🍰'],
  [/cafe|coffee|tea|beverage/i, '☕'],
  [/sea ?food|fish|prawn|mangalorean/i, '🦐'],
  [/bar|pub|beer|cocktail|brew/i, '🍻'],
];

/** Deterministic "photo" for a card: dataset has no images, so pick an emoji + warm gradient from the cuisine. */
export function cardVisual(r: { id: string; cuisines: string[]; dishesLiked: string[]; restType: string }) {
  const hay = [...r.dishesLiked.slice(0, 3), ...r.cuisines, r.restType].join(' ');
  const emoji = VISUALS.find(([re]) => re.test(hay))?.[1] ?? '🍽';
  let h = 0;
  for (const ch of r.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = 14 + (h % 30); // oranges → ambers
  return { emoji, background: `linear-gradient(135deg, hsl(${hue} 70% 22%), hsl(${hue + 12} 78% 46%))` };
}
