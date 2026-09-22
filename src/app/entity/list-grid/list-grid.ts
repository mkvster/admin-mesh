import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ConnectedPosition, CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  FieldDisplay,
  FieldMetadata,
  FilterItem,
  ListMetadata,
  ListRowAction,
  ListSort,
} from '../entity-types';
import { EntityFieldValue } from '../entity-field-value/entity-field-value';
import { ReferencePreviewOverlay } from '../reference-preview-overlay/reference-preview-overlay';
import { HoverIntentTimer } from '../hover-intent-timer';
import { normalizePageNumber, normalizePageSize } from '../pagination';
import { parseDateValue } from '../filtering/date-serialization';
import { operatorLabel } from '../filtering/filter-serialization';

const ROW_ACTIONS_COLUMN = '__rowActions';
const SELECTION_COLUMN = '__selection';
const ROW_ACTION_WIDTH = 56;

export interface ListPageChange {
  page: number;
  pageSize: number;
}

export interface ListSortChange {
  sort: ListSort[];
}

export interface ListGridRowAction {
  action: 'delete' | 'view-form' | 'edit';
  row: Record<string, unknown>;
  id?: string | number;
  formId?: string;
}

interface ReferencePreviewTarget {
  origin: CdkOverlayOrigin;
  resource: string;
  formId: string;
  id: string | number;
}

@Component({
  selector: 'app-list-grid',
  imports: [
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    EntityFieldValue,
    OverlayModule,
    ReferencePreviewOverlay,
  ],
  templateUrl: './list-grid.html',
  styleUrl: './list-grid.scss',
  providers: [HoverIntentTimer],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListGrid {
  readonly metadata = input.required<ListMetadata>();
  readonly rows = input.required<Record<string, unknown>[]>();
  readonly totalCount = input.required<number>();
  readonly page = input(1);
  readonly pageSize = input(25);
  protected readonly normalizedPageSize = computed(() => normalizePageSize(this.pageSize()));
  protected readonly normalizedPage = computed(() => {
    const lastPage = Math.max(1, Math.ceil(this.totalCount() / this.normalizedPageSize()));
    return Math.min(normalizePageNumber(this.page()), lastPage);
  });
  protected readonly pageSizeOptions = computed(() =>
    [...new Set([10, 25, 50, 100, this.normalizedPageSize()])].sort((left, right) => left - right),
  );
  readonly pageChange = output<ListPageChange>();
  readonly sort = input<ListSort[]>([]);
  readonly filters = input<FilterItem[]>([]);
  readonly idField = input('id');
  readonly sortChange = output<ListSortChange>();
  readonly showDeleteAction = input(false);
  readonly showEditAction = input(false);
  readonly highlightedId = input<string | number | null>(null);
  readonly rowAction = output<ListGridRowAction>();
  readonly selectionMode = input<'none' | 'single' | 'multiple'>('none');
  readonly selectionControl = input(true);
  readonly selectedIds = input<(string | number)[]>([]);
  readonly rowSelected = output<Record<string, unknown>>();
  readonly enableRowActions = input(true);

  protected readonly overlayPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
  ];
  protected readonly activeReference = signal<ReferencePreviewTarget | null>(null);

  protected readonly pageRange = computed(() => {
    const total = this.totalCount();
    if (total === 0) return '';

    const start = (this.normalizedPage() - 1) * this.normalizedPageSize() + 1;
    const end = Math.min(this.normalizedPage() * this.normalizedPageSize(), total);
    return `${start}–${end} of ${total}`;
  });

  protected readonly canGoToPreviousPage = computed(() => this.normalizedPage() > 1);
  protected readonly canGoToNextPage = computed(
    () => this.normalizedPage() * this.normalizedPageSize() < this.totalCount(),
  );

  private readonly hoverIntentTimer = inject(HoverIntentTimer);

  protected readonly displayedColumns = computed(() => [
    ...(this.selectionMode() !== 'none' && this.selectionControl() ? [SELECTION_COLUMN] : []),
    ...this.metadata().columns.map((column) => column.field),
    ...(this.hasRowActions() ? [ROW_ACTIONS_COLUMN] : []),
  ]);

  protected isSelected(row: Record<string, unknown>): boolean {
    const id = row[this.idField()];
    return (typeof id === 'string' || typeof id === 'number') && this.selectedIds().includes(id);
  }

  protected selectRow(row: Record<string, unknown>): void {
    this.rowSelected.emit(row);
  }

  protected selectionLabel(row: Record<string, unknown>): string {
    return `Select ${String(row[this.idField()] ?? 'row')}`;
  }

  protected readonly rowActions = computed(() =>
    this.enableRowActions() ? (this.metadata().rowActions ?? []) : [],
  );

  protected readonly hasRowActions = computed(
    () =>
      this.showDeleteAction() ||
      this.showEditAction() ||
      (this.enableRowActions() && this.rowActions().length > 0),
  );

  protected readonly rowActionsColumnWidth = computed(
    () =>
      (this.rowActions().length +
        (this.showDeleteAction() ? 1 : 0) +
        (this.showEditAction() ? 1 : 0)) *
      ROW_ACTION_WIDTH,
  );

  protected readonly columns = computed(() => {
    const metadata = this.metadata();

    const fields = new Map(metadata.fields.map((field) => [field.name, field]));

    return metadata.columns.map((column) => ({
      column,
      field: fields.get(column.field),
    }));
  });

  protected fieldLabel(fieldName: string): string {
    return this.metadata().fields.find((field) => field.name === fieldName)?.label ?? fieldName;
  }

  protected sortFor(field: string): ListSort | undefined {
    return this.sort().find((item) => item.field === field);
  }

  protected sortPriority(field: string): number | undefined {
    const index = this.sort().findIndex((item) => item.field === field);
    return index >= 0 ? index + 1 : undefined;
  }

  protected sortLabel(field: string): string {
    const item = this.sortFor(field);
    const priority = this.sortPriority(field);

    return item
      ? `Sort ${this.fieldLabel(field)}, currently ${item.direction}, priority ${priority}`
      : `Sort ${this.fieldLabel(field)}`;
  }

  protected filtersFor(field: string): FilterItem[] {
    return this.filters().filter((item) => item.field === field);
  }

  protected filterSummary(field: string): string {
    const fieldMetadata = this.metadata().fields.find((item) => item.name === field);
    return this.filtersFor(field)
      .map((item) => this.filterSummaryItem(item, fieldMetadata))
      .join('\nAND ');
  }

  private filterSummaryItem(
    item: FilterItem,
    fieldMetadata: ListMetadata['fields'][number] | undefined,
  ): string {
    if (fieldMetadata?.type === 'boolean') {
      return item.value === true ? 'Yes' : 'No';
    }

    if (fieldMetadata?.type === 'enum') {
      const values = Array.isArray(item.value) ? item.value : [item.value];
      const labels = values.map(
        (value) =>
          fieldMetadata.values?.find((option) => option.value === value)?.label ?? String(value),
      );
      const summary = labels.join(', ');
      return item.operator === 'notEquals'
        ? `Not ${summary}`
        : `${operatorLabel(item.operator)} ${summary}`;
    }

    if (item.operator === 'inThePast') {
      return this.relativePeriodLabel(item.value);
    }

    const value = Array.isArray(item.value)
      ? `${this.formatFilterValue(item.value[0], fieldMetadata?.type)} and ${this.formatFilterValue(item.value[1], fieldMetadata?.type)}`
      : typeof item.value === 'boolean'
        ? item.value
          ? 'Yes'
          : 'No'
        : this.formatFilterValue(item.value, fieldMetadata?.type);
    return item.operator === 'between'
      ? `Between ${value}`
      : `${operatorLabel(item.operator)} ${value}`;
  }

  private formatFilterValue(value: string | number, fieldType: string | undefined): string {
    if (fieldType !== 'date' && fieldType !== 'datetime') {
      return String(value);
    }

    const date = parseDateValue(value, fieldType);
    return date === null
      ? String(value)
      : new Intl.DateTimeFormat(
          undefined,
          fieldType === 'datetime'
            ? { dateStyle: 'medium', timeStyle: 'short' }
            : { dateStyle: 'medium' },
        ).format(date);
  }

  private relativePeriodLabel(value: FilterItem['value']): string {
    switch (value) {
      case 'hour':
        return 'Past hour';
      case '24hours':
        return 'Past 24 hours';
      case 'week':
        return 'Past week';
      case 'month':
        return 'Past month';
      case 'year':
        return 'Past year';
      default:
        return 'In the past';
    }
  }

  protected onSort(field: string, event: MouseEvent): void {
    const column = this.metadata().columns.find((item) => item.field === field);
    if (column?.disableSorting) {
      return;
    }

    const current = this.sortFor(field);
    const nextDirection = current ? (current.direction === 'asc' ? 'desc' : undefined) : 'asc';

    if (!event.shiftKey) {
      this.sortChange.emit({
        sort: nextDirection ? [{ field, direction: nextDirection }] : [],
      });
      return;
    }

    const currentIndex = this.sort().findIndex((item) => item.field === field);
    const nextSort = this.sort().filter((item) => item.field !== field);
    if (nextDirection) {
      const nextItem: ListSort = { field, direction: nextDirection };
      if (currentIndex >= 0) {
        nextSort.splice(currentIndex, 0, nextItem);
      } else {
        nextSort.push(nextItem);
      }
    }

    this.sortChange.emit({ sort: nextSort });
  }

  protected onPageChange(page: number): void {
    this.pageChange.emit({
      page,
      pageSize: this.normalizedPageSize(),
    });
  }

  protected onPageSizeChange(event: Event): void {
    const requestedPageSize = Number((event.target as HTMLSelectElement).value);
    const pageSize = normalizePageSize(requestedPageSize);
    if (pageSize !== requestedPageSize || !this.pageSizeOptions().includes(pageSize)) return;

    const firstItemIndex = (this.normalizedPage() - 1) * this.normalizedPageSize();
    this.pageChange.emit({
      page: Math.floor(firstItemIndex / pageSize) + 1,
      pageSize,
    });
  }

  protected onDelete(row: Record<string, unknown>): void {
    this.rowAction.emit({ action: 'delete', row });
  }

  protected onEdit(row: Record<string, unknown>): void {
    const id = row[this.idField()];
    if (typeof id === 'string' || typeof id === 'number')
      this.rowAction.emit({ action: 'edit', row, id });
  }

  protected isHighlighted(row: Record<string, unknown>): boolean {
    return (
      this.highlightedId() !== null && String(row[this.idField()]) === String(this.highlightedId())
    );
  }

  protected onRowAction(action: ListRowAction, row: Record<string, unknown>): void {
    const id = row[this.idField()];
    if ((typeof id !== 'string' && typeof id !== 'number') || action.type !== 'view-form') {
      return;
    }

    this.rowAction.emit({ action: 'view-form', formId: action.formId, id, row });
  }

  protected rowActionLabel(action: ListRowAction): string {
    return action.label ?? 'View';
  }

  protected rowActionIcon(action: ListRowAction): string {
    return action.icon;
  }

  protected rowActionIconSet(action: ListRowAction): string {
    return action.iconSet ?? 'material-icons';
  }

  protected rowActionColor(action: ListRowAction): string | undefined {
    return action.iconColor;
  }

  protected referencePreview(
    field: FieldMetadata,
    display: FieldDisplay | undefined,
    row: Record<string, unknown>,
  ): Omit<ReferencePreviewTarget, 'origin'> | undefined {
    if (display?.type !== 'reference' || !display.previewForm || !field.reference) {
      return undefined;
    }

    const id = row[field.name];
    if (typeof id !== 'string' && typeof id !== 'number') {
      return undefined;
    }

    return { resource: field.reference.resource, formId: display.previewForm, id };
  }

  protected onReferenceEnter(
    origin: CdkOverlayOrigin,
    field: FieldMetadata,
    display: FieldDisplay | undefined,
    row: Record<string, unknown>,
  ): void {
    const preview = this.referencePreview(field, display, row);
    if (!preview) return;

    this.hoverIntentTimer.clear();
    this.hoverIntentTimer.scheduleOpen(() => {
      this.activeReference.set({ origin, ...preview });
    });
  }

  protected onReferenceLeave(): void {
    this.hoverIntentTimer.clearOpen();
    this.schedulePreviewClose();
  }

  protected onPreviewEnter(): void {
    this.hoverIntentTimer.clearClose();
  }

  protected onPreviewLeave(): void {
    this.schedulePreviewClose();
  }

  protected closePreview(): void {
    this.hoverIntentTimer.clear();
    this.activeReference.set(null);
  }

  private schedulePreviewClose(): void {
    this.hoverIntentTimer.scheduleClose(() => {
      this.activeReference.set(null);
    });
  }
}
