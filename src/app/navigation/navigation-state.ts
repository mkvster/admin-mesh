import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, throwError } from 'rxjs';
import { NavigationApi } from './navigation-api';
import { AdminNode, NavigationResponse, NavigationSection } from './navigation-types';

export interface NavigationSelection {
  section: NavigationSection;
  node: AdminNode;
}

export type NavigationLoadState =
  | { status: 'loading' }
  | { status: 'loaded'; data: NavigationResponse }
  | { status: 'error'; message: string; cause: unknown };

@Injectable({ providedIn: 'root' })
export class NavigationState {
  private readonly api = inject(NavigationApi);

  private readonly requestedNode = signal<{
    sectionId: string | null;
    nodeId: string | null;
  } | null>(null);

  readonly navigationState = toSignal<NavigationLoadState, NavigationLoadState>(
    this.api.getNavigation().pipe(
      startWith({ status: 'loading' } as NavigationLoadState),
      map((data) =>
        'sections' in data ? ({ status: 'loaded', data } as NavigationLoadState) : data,
      ),
      // Navigation is a feature-level request, so expose a user-facing error state.
      catchError((cause: unknown) => {
        if (!(cause instanceof HttpErrorResponse)) {
          return throwError(() => cause);
        }

        console.error('Navigation loading failed', cause);
        return of<NavigationLoadState>({
          status: 'error',
          message: 'Failed to load navigation',
          cause,
        });
      }),
    ),
    { initialValue: { status: 'loading' } },
  );

  readonly navigation = computed(() => {
    const state = this.navigationState();
    return state.status === 'loaded' ? state.data : { sections: [] };
  });

  readonly selected = signal<NavigationSelection | null>(null);

  select(section: NavigationSection, node: AdminNode): void {
    this.requestedNode.set(null);
    this.selected.set({ section, node });
  }

  clear(): void {
    this.requestedNode.set(null);
    this.selected.set(null);
  }
}
