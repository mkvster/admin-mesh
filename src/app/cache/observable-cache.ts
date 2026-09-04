import { Observable, catchError, shareReplay, throwError } from 'rxjs';

export class ObservableCache<K, V> {
  private readonly cache = new Map<K, Observable<V>>();

  getOrCreate(key: K, factory: () => Observable<V>): Observable<V> {
    const existing = this.cache.get(key);

    if (existing) {
      return existing;
    }

    const value = factory().pipe(
      catchError((error) => {
        this.cache.delete(key);
        return throwError(() => error);
      }),
      shareReplay(1),
    );

    this.cache.set(key, value);

    return value;
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
