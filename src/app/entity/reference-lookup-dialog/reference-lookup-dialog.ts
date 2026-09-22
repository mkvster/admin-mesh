import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import type { FilterDialogData } from '../filtering/filter-dialog/filter-dialog';
import { ListDataSource } from '../list-data-source';
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

export interface ReferenceLookupDialogData {
  field: FieldMetadata;
  mode: 'single' | 'multiple';
  selectedIds?: (string | number)[];
  selectedValues?: ReferenceLookupSelection[];
}

type LookupState =
  | { status: 'loading' }
  | {
      status: 'loaded';
      idField: string;
      metadata: ListMetadata;
      result: ListQueryResult;
    }
  | { status: 'error'; cause: unknown };

@Component({
  selector: 'app-reference-lookup-dialog',
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule, ListGrid],
  templateUrl: './reference-lookup-dialog.html',
  styleUrl: './reference-lookup-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceLookupDialog {
  private readonly data = inject<ReferenceLookupDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ReferenceLookupDialog>);
  private readonly dialog = inject(MatDialog);
  private readonly dataSource = inject(ListDataSource);
  private readonly query = signal<ListQuery>({ page: 1, pageSize: 10 });
  protected readonly selectedIds = signal<(string | number)[]>(this.data.selectedIds ?? []);
  private readonly selectedRows = new Map<string | number, Record<string, unknown>>();
  private readonly selectedDisplayValues = new Map(
    (this.data.selectedValues ?? []).map((selection) => [selection.id, selection.displayValue]),
  );
  protected readonly mode = this.data.mode;
  protected readonly title = this.data.field.label;
  protected readonly filterError = signal(false);

  protected queryPage(): number {
    return this.query().page;
  }

  protected queryPageSize(): number {
    return this.query().pageSize;
  }

  protected querySort() {
    return this.query().sort ?? [];
  }

  protected queryFilters() {
    return this.query().filter?.items ?? [];
  }

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

  private resource(): string {
    return this.data.field.reference!.resource;
  }

  private listId(): string {
    return this.data.field.reference!.listId;
  }

  protected async openFilters(): Promise<void> {
    const current = this.state();
    if (current.status !== 'loaded') return;
    const filters = this.query().filter?.items ?? [];
    const filterData: FilterDialogData = {
      fields: current.metadata.fields,
      filters,
      scope: { resource: this.resource(), listId: this.listId() },
    };
    try {
      const { FilterDialog } = await import('../filtering/filter-dialog/filter-dialog');
      const ref = this.dialog.open(FilterDialog, {
        data: filterData,
        width: 'min(960px, 95vw)',
        maxHeight: '90vh',
        ariaLabel: 'Filter lookup list',
      });
      ref.afterClosed().subscribe((items: FilterItem[] | undefined) => {
        if (!items) return;
        this.patchQuery({ page: 1, filter: items.length ? { operator: 'and', items } : undefined });
      });
      this.filterError.set(false);
    } catch (cause) {
      console.error('Lookup filter editor failed to load', cause);
      this.filterError.set(true);
    }
  }

  protected onPageChange(change: ListPageChange): void {
    this.patchQuery({ page: change.page, pageSize: change.pageSize });
  }

  protected onSortChange(change: ListSortChange): void {
    this.patchQuery({ page: 1, sort: change.sort });
  }

  protected onRowSelected(row: Record<string, unknown>): void {
    const state = this.state();
    if (state.status !== 'loaded') return;
    const id = row[state.idField];
    if (typeof id !== 'string' && typeof id !== 'number') return;
    const selected = this.selectedIds();
    if (this.mode === 'single') {
      if (selected.includes(id)) {
        this.selectedRows.delete(id);
        this.selectedIds.set([]);
        return;
      }
      this.selectedRows.set(id, row);
      this.selectedIds.set([id]);
      return;
    }
    if (selected.includes(id)) {
      this.selectedRows.delete(id);
      this.selectedIds.set(selected.filter((item) => item !== id));
    } else {
      this.selectedRows.set(id, row);
      this.selectedIds.set([...selected, id]);
    }
  }

  protected confirm(): void {
    const reference = this.data.field.reference!;
    const state = this.state();
    const selections = this.selectedIds().map((id) => {
      const currentPageRow =
        state.status === 'loaded'
          ? state.result.items.find((row) => row[state.idField] === id)
          : undefined;
      const row = this.selectedRows.get(id) ?? currentPageRow;
      return {
        id,
        displayValue: String(
          row?.[reference.displayField] ?? this.selectedDisplayValues.get(id) ?? id,
        ),
      };
    });
    this.dialogRef.close(this.mode === 'single' ? (selections[0] ?? null) : selections);
  }

  protected canConfirm(): boolean {
    return this.selectedIds().length > 0;
  }

  private patchQuery(changes: Partial<ListQuery>): void {
    this.query.update((query) => {
      const next = { ...query, ...changes };
      if (changes.filter === undefined && 'filter' in changes) delete next.filter;
      if (changes.sort === undefined && 'sort' in changes) delete next.sort;
      return next;
    });
  }
}
