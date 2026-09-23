import { catchError, map, Observable, of, OperatorFunction, startWith, throwError } from 'rxjs';

/**
 * State used by entity resource reads.
 *
 * By default, resource request failures become `error` states, preserving the
 * existing UI behavior of entity components. Callers with a stricter boundary
 * can rethrow non-expected errors and optionally log expected failures.
 */
export type ResourceLoadState<T> =
  { status: 'loading' } | { status: 'loaded'; data: T } | { status: 'error'; cause: unknown };

export interface ResourceLoadStateOptions {
  readonly isExpectedError?: (cause: unknown) => boolean;
  readonly onExpectedError?: (cause: unknown) => void;
}

export function withResourceLoadState<T>(
  options: ResourceLoadStateOptions = {},
): OperatorFunction<T, ResourceLoadState<T>> {
  return (source: Observable<T>) =>
    source.pipe(
      map((data) => ({ status: 'loaded', data }) as ResourceLoadState<T>),
      startWith({ status: 'loading' } as ResourceLoadState<T>),
      catchError((cause: unknown) => {
        if (options.isExpectedError && !options.isExpectedError(cause)) {
          return throwError(() => cause);
        }

        options.onExpectedError?.(cause);
        return of<ResourceLoadState<T>>({ status: 'error', cause });
      }),
    );
}
