import { lastValueFrom, of, throwError, toArray } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { withResourceLoadState } from './resource-load-state';

describe('withResourceLoadState', () => {
  it('emits loading and loaded states for a successful source', async () => {
    await expect(
      lastValueFrom(of('value').pipe(withResourceLoadState(), toArray())),
    ).resolves.toEqual([{ status: 'loading' }, { status: 'loaded', data: 'value' }]);
  });

  it('converts request errors to an error state', async () => {
    const cause = new Error('network failure');

    await expect(
      lastValueFrom(throwError(() => cause).pipe(withResourceLoadState(), toArray())),
    ).resolves.toEqual([{ status: 'loading' }, { status: 'error', cause }]);
  });

  it('keeps the original error as the cause', async () => {
    const cause = new Error('programming failure');

    await expect(
      lastValueFrom(throwError(() => cause).pipe(withResourceLoadState(), toArray())),
    ).resolves.toEqual([{ status: 'loading' }, { status: 'error', cause }]);
  });

  it('can rethrow non-expected errors and observe expected ones', async () => {
    const cause = new Error('unexpected failure');
    const onExpectedError = vi.fn();

    await expect(
      lastValueFrom(
        throwError(() => cause).pipe(
          withResourceLoadState({
            isExpectedError: () => false,
            onExpectedError,
          }),
        ),
      ),
    ).rejects.toBe(cause);
    expect(onExpectedError).not.toHaveBeenCalled();

    const expectedCause = new Error('expected failure');
    await expect(
      lastValueFrom(
        throwError(() => expectedCause).pipe(
          withResourceLoadState({
            isExpectedError: () => true,
            onExpectedError,
          }),
          toArray(),
        ),
      ),
    ).resolves.toEqual([{ status: 'loading' }, { status: 'error', cause: expectedCause }]);
    expect(onExpectedError).toHaveBeenCalledWith(expectedCause);
  });
});
