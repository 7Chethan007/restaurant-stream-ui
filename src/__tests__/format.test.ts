import { describe, expect, it } from 'vitest';
import { formatDurationHMS, formatRupees, priceBand } from '../utils/format';

describe('formatDurationHMS', () => {
  it('pads hours, minutes and seconds', () => {
    expect(formatDurationHMS(0)).toBe('00:00:00');
    expect(formatDurationHMS(65)).toBe('00:01:05');
    expect(formatDurationHMS(3725)).toBe('01:02:05');
  });
  it('clamps negatives', () => expect(formatDurationHMS(-4)).toBe('00:00:00'));
});

describe('priceBand', () => {
  it('matches the Flink job bands', () => {
    expect(priceBand(300)).toBe('₹');
    expect(priceBand(301)).toBe('₹₹');
    expect(priceBand(700)).toBe('₹₹');
    expect(priceBand(1500)).toBe('₹₹₹');
    expect(priceBand(1501)).toBe('₹₹₹₹');
    expect(priceBand(null)).toBe('—');
  });
});

describe('formatRupees', () => {
  it('formats with Indian grouping', () => {
    expect(formatRupees(150000)).toBe('₹1,50,000');
    expect(formatRupees(null)).toBe('n/a');
  });
});
