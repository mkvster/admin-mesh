import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FilterDialog, FilterDialogData } from '../filtering/filter-dialog/filter-dialog';
import { ListDataSource } from '../list-data-source';
import { EntityApi } from '../entity-api';
import { AdminToolbarState } from '../../layout/admin-layout/admin-toolbar-state';
import { ListGrid, ListPageChange, ListSortChange } from '../list-grid/list-grid';
import {
  FieldMetadata,
  FilterItem,
  ListMetadata,
  ListQuery,
  ListQueryResult,
} from '../entity-types';

export interface ReferenceLookupSelection {
  id: string | number;
  displayValue: string;
}

export interface ReferenceLookupViewData {
  field: FieldMetadata;
  mode: 'single' | 'multiple';
  selectedValues: ReferenceLookupSelection[];
}

type LookupState =
  | { status: 'loading' }
  | { status: 'loaded'; idField: string; metadata: ListMetadata; result: ListQueryResult }
  | { status: 'error'; cause: unknown };

@Component({
  selector: 'app-reference-lookup-view',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ListGrid,
    FilterDialog,
  ],
  templateUrl: './reference-lookup-view.html',
  styleUrl: './reference-lookup-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceLookupView {
  readonly data = input.required<ReferenceLookupViewData>();
  readonly selected = output<ReferenceLookupSelection[]>();
  readonly cancelled = output<void>();
  private readonly dataSource = inject(ListDataSource);
  private readonly api = inject(EntityApi);
  private readonly toolbarState = inject(AdminToolbarState);
  protected readonly query = signal<ListQuery>({ page: 1, pageSize: 25 });
  protected readonly selectedValues = signal<ReferenceLookupSelection[]>([]);
  protected readonly selectedIds = computed(() => this.selectedValues().map((item) => item.id));
  protected readonly filterMode = signal(false);
  protected readonly draftFilters = signal<FilterItem[]>([]);
  private readonly filterEditor = viewChild(FilterDialog);
  protected readonly filterEditorData = computed<FilterDialogData | null>(() => {
    const current = this.state();
    if (current.status !== 'loaded') return null;
    return {
      fields: current.metadata.fields,
      filters: this.filters(),
      scope: { resource: this.resource(), listId: this.listId() },
    };
  });

  protected readonly state = toSignal(
    toObservable(this.query).pipe(
      switchMap((query) =>
        this.dataSource.load(this.resource(), this.listId(), query).pipe(
          map(
            (list) =>
              ({
                status: 'loaded',
                idField: list.entityMetadata.idField,
                metadata: list.metadata,
                result: list.result,
              }) as LookupState,
          ),
          startWith({ status: 'loading' } as LookupState),
          catchError((cause: unknown) => of<LookupState>({ status: 'error', cause })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as LookupState },
  );

  constructor() {
    queueMicrotask(() => {
      this.selectedValues.set([...this.data().selectedValues]);
      this.locateInitialSelection();
    });
    effect((onCleanup) => {
      const filterEditing = this.filterMode();
      const actions = {
        filterEditing,
        addLabel: '',
        canAdd: false,
        filterCount: this.filters().length,
        add: () => undefined,
        editFilters: () => this.openFilters(),
        clearFilters: () => this.applyFilters([]),
        ...(filterEditing ? { addFilter: () => this.filterEditor()?.addFilter() } : {}),
      };
      this.toolbarState.setActions(actions);
      onCleanup(() => this.toolbarState.clearActions(actions));
    });
  }

  private locateInitialSelection(): void {
    const selected = this.data().selectedValues[0];
    if (!selected) return;
    this.api
      .locateEntity(this.resource(), this.listId(), {
        id: selected.id,
        pageSize: this.query().pageSize,
        sort: this.query().sort,
      })
      .subscribe({
        next: (located) => {
          if (located.found && located.page && located.page > 0) {
            this.query.update((query) => ({ ...query, page: located.page! }));
          }
        },
        error: (cause: unknown) => {
          console.error('Reference lookup locate failed', cause);
        },
      });
  }

  protected resource(): string {
    return this.data().field.reference!.resource;
  }
  protected listId(): string {
    return this.data().field.reference!.listId;
  }
  protected page(): number {
    return this.query().page;
  }
  protected pageSize(): number {
    return this.query().pageSize;
  }
  protected sort() {
    return this.query().sort ?? [];
  }
  protected filters() {
    return this.query().filter?.items ?? [];
  }

  protected isSelected(row: Record<string, unknown>): boolean {
    const current = this.state();
    if (current.status !== 'loaded') return false;
    const id = row[current.idField];
    return this.selectedValues().some((item) => item.id === id);
  }

  protected selectRow(row: Record<string, unknown>): void {
    const current = this.state();
    if (current.status !== 'loaded') return;
    const id = row[current.idField];
    if (typeof id !== 'string' && typeof id !== 'number') return;
    const displayField = this.data().field.reference!.displayField;
    const existing = this.selectedValues();
    if (existing.some((item) => item.id === id)) {
      this.selectedValues.set(existing.filter((item) => item.id !== id));
      return;
    }
    const item = { id, displayValue: String(row[displayField] ?? id) };
    this.selectedValues.set(this.data().mode === 'single' ? [item] : [...existing, item]);
  }

  protected remove(selection: ReferenceLookupSelection): void {
    this.selectedValues.update((items) => items.filter((item) => item.id !== selection.id));
  }

  protected onPageChange(change: ListPageChange): void {
    this.query.update((q) => ({ ...q, ...change }));
  }
  protected onSortChange(change: ListSortChange): void {
    this.query.update((q) => ({ ...q, page: 1, sort: change.sort }));
  }

  protected openFilters(): void {
    const current = this.state();
    if (current.status !== 'loaded') return;
    this.draftFilters.set([...this.filters()]);
    this.filterMode.set(true);
  }

  protected applyFilters(filters: FilterItem[]): void {
    this.filterMode.set(false);
    this.query.update((q) => ({
      ...q,
      page: 1,
      filter: filters.length ? { operator: 'and', items: filters } : undefined,
    }));
  }

  protected cancelFilters(): void {
    this.filterMode.set(false);
  }
  protected select(): void {
    this.selected.emit(this.selectedValues());
  }
}
