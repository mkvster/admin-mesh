import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOCK_DELAY_MAX_MS, MOCK_DELAY_MIN_MS, randomMockDelay } from './random-mock-delay';

describe('randomMockDelay', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns a duration inside the shared inclusive range', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.999999);

    expect(randomMockDelay()).toBe(MOCK_DELAY_MIN_MS);
    expect(randomMockDelay()).toBe(MOCK_DELAY_MAX_MS);
  });
});
