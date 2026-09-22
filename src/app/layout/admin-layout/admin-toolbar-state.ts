import { Injectable, signal } from '@angular/core';

export interface AdminToolbarActions {
  filterEditing?: boolean;
  addLabel: string;
  canAdd: boolean;
  filterCount: number;
  add(): void;
  editFilters(): void;
  clearFilters(): void;
  addFilter?(): void;
}

@Injectable({ providedIn: 'root' })
export class AdminToolbarState {
  readonly actions = signal<AdminToolbarActions | null>(null);

  setActions(actions: AdminToolbarActions): void {
    this.actions.set(actions);
  }

  clearActions(actions?: AdminToolbarActions): void {
    if (!actions || this.actions() === actions) {
      this.actions.set(null);
    }
  }
}
