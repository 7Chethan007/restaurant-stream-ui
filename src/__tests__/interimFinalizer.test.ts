import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFinalizer } from '../utils/interimFinalizer';

describe('createFinalizer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('promotes interim text that stays stable, once', () => {
    const sent: string[] = [];
    const f = createFinalizer((t) => sent.push(t), 1500);
    f.partial('biryani in');
    vi.advanceTimersByTime(1000);
    f.partial('biryani in Indiranagar');
    vi.advanceTimersByTime(1499);
    expect(sent).toEqual([]);
    vi.advanceTimersByTime(2);
    expect(sent).toEqual(['biryani in Indiranagar']);
    f.final('Biryani in Indiranagar.'); // the real final repeats it: ignored
    f.partial('biryani in indiranagar');
    vi.advanceTimersByTime(5000);
    expect(sent).toHaveLength(1);
  });

  it('sends a real final immediately and cancels the pending timer', () => {
    const sent: string[] = [];
    const f = createFinalizer((t) => sent.push(t), 1500);
    f.partial('under 300');
    f.final('under 300 for two');
    vi.advanceTimersByTime(5000);
    expect(sent).toEqual(['under 300 for two']);
  });
});
