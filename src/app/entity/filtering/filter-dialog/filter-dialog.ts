import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FilterItem, FilterOperator, ListField } from '../../entity-types';
import { FilterValueEditor } from '../filter-value-editor/filter-value-editor';
import { MAX_FILTER_ITEMS, MAX_SERIALIZED_FILTER_LENGTH } from '../filter-constraints';
import { ListFilterScope, serializeListFilter } from '../filter-serialization';

export interface FilterDialogData {
  fields: ListField[];
  filters: FilterItem[];
  scope: ListFilterScope;
}

interface DraftFilter extends Partial<FilterItem> {
  field?: string;
  operator?: FilterOperator;
  value?: string;
}

@Component({
  selector: 'app-filter-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatInputModule, MatSelectModule, FilterValueEditor],
  templateUrl: './filter-dialog.html',
  styleUrl: './filter-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterDialog {
  protected readonly maxFilterItems = MAX_FILTER_ITEMS;
  private readonly dialogRef = inject(MatDialogRef<FilterDialog, FilterItem[] | undefined>);
  readonly data = inject<FilterDialogData>(MAT_DIALOG_DATA);
  readonly stringFields = this.data.fields.filter(field => field.type === 'string');
  readonly operators: { value: FilterOperator; label: string }[] = [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' }
  ];

  readonly draft = signal<DraftFilter[]>(this.data.filters.length
    ? this.data.filters.map(filter => ({ ...filter }))
    : [{ }]);
  private readonly filterRows = viewChild<ElementRef<HTMLDivElement>>('filterRows');

  protected readonly hasIncompleteFilter = computed(() =>
    this.draft().some(item => !item.field || !item.operator || !item.value?.trim())
  );
  protected readonly hasTooManyFilters = computed(() => this.draft().length > MAX_FILTER_ITEMS);
  protected readonly hasReachedFilterLimit = computed(() => this.draft().length >= MAX_FILTER_ITEMS);
  protected readonly hasOversizedFilter = computed(() => {
    if (this.hasIncompleteFilter() || this.hasTooManyFilters()) {
      return false;
    }

    const items = this.draft().map(item => ({
      field: item.field!,
      operator: item.operator!,
      value: item.value!.trim()
    }));

    return serializeListFilter(items, this.data.scope).length > MAX_SERIALIZED_FILTER_LENGTH;
  });
  protected readonly cannotApply = computed(() =>
    this.hasIncompleteFilter() || this.hasTooManyFilters() || this.hasOversizedFilter()
  );

  protected fieldFor(item: DraftFilter): ListField | undefined {
    return this.stringFields.find(field => field.name === item.field);
  }

  protected updateField(index: number, field: string): void {
    this.update(index, { field, value: '' });
  }

  protected updateOperator(index: number, operator: FilterOperator): void {
    this.update(index, { operator });
  }

  protected updateValue(index: number, value: unknown): void {
    this.update(index, { value: typeof value === 'string' ? value : '' });
  }

  protected addFilter(): void {
    if (this.draft().length >= MAX_FILTER_ITEMS) {
      return;
    }

    this.draft.update(items => [...items, {}]);
    setTimeout(() => {
      const rows = this.filterRows()?.nativeElement;
      rows?.scrollTo({ top: rows.scrollHeight, behavior: 'smooth' });
    });
  }

  protected removeFilter(index: number): void {
    this.draft.update(items => items.filter((_, itemIndex) => itemIndex !== index));
  }

  protected clearAll(): void {
    this.draft.set([]);
  }

  protected cancel(): void {
    this.dialogRef.close(undefined);
  }

  protected apply(): void {
    if (this.cannotApply()) {
      return;
    }

    this.dialogRef.close(this.draft().map(item => ({
      field: item.field!,
      operator: item.operator!,
      value: item.value!.trim()
    })));
  }

  private update(index: number, changes: DraftFilter): void {
    this.draft.update(items => items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...changes } : item
    ));
  }
}
