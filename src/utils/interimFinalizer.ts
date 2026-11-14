/**
 * Browsers sometimes hold back the "final" flag. If interim text stops changing for `stableMs`, treat it as
 * final once; a real final that repeats the same sentence is then ignored.
 */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

export function createFinalizer(onFinal: (text: string) => void, stableMs = 1500) {
  let pending: string | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastSent = '';

  const clear = () => { if (timer) clearTimeout(timer); timer = null; pending = null; };
  const emit = (text: string) => { lastSent = norm(text); onFinal(text); };

  return {
    partial(text: string) {
      if (norm(text) === lastSent || text === pending) return;
      pending = text;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { const t = pending; clear(); if (t) emit(t); }, stableMs);
    },
    final(text: string) {
      clear();
      if (norm(text) === lastSent) return; // ponytail: only exact repeats are skipped; an extended sentence is sent again
      emit(text);
    },
    cancel: clear,
  };
}
