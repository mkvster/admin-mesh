import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationApi } from './navigation-api';
import { AdminNode, NavigationSection } from './navigation-types';

export interface NavigationSelection {
  section: NavigationSection;
  node: AdminNode;
}

@Injectable({ providedIn: 'root' })
export class NavigationState {
  private readonly api = inject(NavigationApi);

  private readonly requestedNode = signal<{
    sectionId: string | null;
    nodeId: string | null;
  } | null>(null);

  readonly navigation = toSignal(this.api.getNavigation(), {
    initialValue: { sections: [] },
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
