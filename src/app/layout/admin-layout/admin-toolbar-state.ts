import { computed, Injectable, signal } from '@angular/core';

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

export interface AdminToolbarAction {
  readonly id: 'add-filter' | 'clear-filters' | 'add' | 'filter';
  readonly cssClass: string;
  readonly icon: string;
  readonly iconFontSet: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly handler: () => void;
}

const noop = (): void => undefined;

@Injectable({ providedIn: 'root' })
export class AdminToolbarState {
  readonly actions = signal<AdminToolbarActions | null>(null);
  readonly visibleActions = computed<AdminToolbarAction[]>(() => {
    const actions = this.actions();
    if (!actions) return [];

    if (actions.filterEditing) {
      return [
        {
          id: 'add-filter',
          cssClass: 'add-filter-action',
          icon: 'add',
          iconFontSet: 'material-icons',
          label: 'Add filter',
          ariaLabel: 'Add filter',
          handler: actions.addFilter ?? noop,
        },
        {
          id: 'clear-filters',
          cssClass: 'clear-filter-action',
          icon: 'filter_alt_off',
          iconFontSet: 'material-icons',
          label: 'Clear filters',
          ariaLabel: 'Clear filters',
          handler: actions.clearFilters,
        },
      ];
    }

    return [
      ...(actions.canAdd
        ? [
            {
              id: 'add' as const,
              cssClass: 'add-action',
              icon: 'add',
              iconFontSet: 'material-icons',
              label: actions.addLabel,
              ariaLabel: actions.addLabel,
              handler: actions.add,
            },
          ]
        : []),
      {
        id: 'filter',
        cssClass: 'filter-action',
        icon: 'filter_alt',
        iconFontSet: actions.filterCount > 0 ? 'material-icons' : 'material-icons-outlined',
        label: 'Filter',
        ariaLabel: actions.filterCount ? `Filter, ${actions.filterCount} active` : 'Filter',
        handler: actions.editFilters,
      },
    ];
  });

  setActions(actions: AdminToolbarActions): void {
    this.actions.set(actions);
  }

  clearActions(actions?: AdminToolbarActions): void {
    if (!actions || this.actions() === actions) {
      this.actions.set(null);
    }
  }
}
