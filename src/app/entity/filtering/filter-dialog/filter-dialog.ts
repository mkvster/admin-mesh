import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { FilterItem, FilterOperator, FilterValue, ListField } from '../../entity-types';
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
  value?: FilterValue;
}

@Component({
  selector: 'app-filter-dialog',
  imports: [
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatDatepickerModule, 
    MatIconModule, 
    MatInputModule, 
    MatSelectModule, 
    MatTimepickerModule, 
    FilterValueEditor],
  templateUrl: './filter-dialog.html',
  styleUrl: './filter-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterDialog {
  protected readonly maxFilterItems = MAX_FILTER_ITEMS;
  protected value = new Date(2026, 8, 3, 10, 30);
  private readonly dialogRef = inject(MatDialogRef<FilterDialog, FilterItem[] | undefined>);
  readonly data = inject<FilterDialogData>(MAT_DIALOG_DATA);
  readonly filterableFields = this.data.fields.filter(field =>
    ['string', 'integer', 'decimal', 'boolean', 'date', 'datetime', 'enum'].includes(field.type)
  );
  readonly draft = signal<DraftFilter[]>(this.data.filters.length
    ? this.data.filters.map(filter => ({ ...filter }))
    : [{ }]);
  private readonly filterRows = viewChild<ElementRef<HTMLDivElement>>('filterRows');

  protected readonly hasIncompleteFilter = computed(() => this.draft().some(item => {
    const field = item.field ? this.fieldForName(item.field) : undefined;
    return !field || !item.operator || !this.isComplete(field, item.operator, item.value);
  }));
  protected readonly hasRowError = computed(() => this.draft().some(item => this.showValueError(item)));
  protected readonly hasTooManyFilters = computed(() => this.draft().length > MAX_FILTER_ITEMS);
  protected readonly hasReachedFilterLimit = computed(() => this.draft().length >= MAX_FILTER_ITEMS);
  protected readonly hasOversizedFilter = computed(() => {
    if (this.hasIncompleteFilter() || this.hasTooManyFilters()) {
      return false;
    }

    const items = this.completedItems();

    return serializeListFilter(items, this.data.scope).length > MAX_SERIALIZED_FILTER_LENGTH;
  });
  protected readonly cannotApply = computed(() =>
    this.hasIncompleteFilter() || this.hasTooManyFilters() || this.hasOversizedFilter()
  );

  protected operatorsFor(item: DraftFilter): { value: FilterOperator; label: string }[] {
    const field = item.field ? this.fieldForName(item.field) : undefined;
    if (!field) {
      return [];
    }

    const values: FilterOperator[] = field.type === 'string'
      ? ['contains', 'equals', 'startsWith', 'endsWith']
      : field.type === 'integer' || field.type === 'decimal'
        ? ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual', 'between']
        : field.type === 'boolean'
          ? ['equals']
          : field.type === 'enum'
            ? ['equals', 'notEquals', 'in', 'notIn']
          : ['equals', 'before', 'after', 'between', 'inThePast'];

    return values.map(value => ({ value, label: this.operatorLabel(value) }));
  }

  protected fieldFor(item: DraftFilter): ListField | undefined {
    return item.field ? this.fieldForName(item.field) : undefined;
  }

  protected showValueError(item: DraftFilter): boolean {
    const field = item.field ? this.fieldForName(item.field) : undefined;
    return !!field && !!item.operator && !this.isComplete(field, item.operator, item.value);
  }

  protected valueErrorMessage(item: DraftFilter): string {
    const field = item.field ? this.fieldForName(item.field) : undefined;
    if (this.isInvalidDateRange(item)) {
      return 'The From date must be before or equal to the To date.';
    }

    return field?.type === 'integer' || field?.type === 'decimal'
      ? item.operator === 'between'
        ? this.isInvalidNumericRange(item)
          ? 'The first number must be less than or equal to the second one.'
          : 'Enter valid range boundaries'
        : 'Enter a valid number'
      : field?.type === 'date'
        ? item.operator === 'between' ? 'Enter valid range boundaries' : 'Enter a valid date'
        : field?.type === 'datetime'
          ? item.operator === 'between' ? 'Enter valid range boundaries' : 'Enter a valid date and times'
        : field?.type === 'enum'
          ? item.operator === 'in' || item.operator === 'notIn'
            ? 'Choose a value(s)'
            : 'Choose a value'
        : field?.type === 'string'
          ? 'Enter a value'
          : 'Enter a valid value';
  }

  protected updateField(index: number, field: string): void {
    const selectedField = this.fieldForName(field);
    this.update(index, {
      field,
      operator: selectedField?.type === 'boolean' ? 'equals' : undefined,
      value: selectedField?.type === 'boolean' ? true : undefined
    });
  }

  protected updateOperator(index: number, operator: FilterOperator): void {
    this.update(index, { operator, value: operator === 'inThePast' ? '24hours' : undefined });
  }

  protected updateValue(index: number, value: unknown): void {
    this.update(index, { value: this.isFilterValue(value) ? value : undefined });
  }

  protected apply(): void {
    if (this.cannotApply()) {
      return;
    }

    this.dialogRef.close(this.completedItems());
  }

  private completedItems(): FilterItem[] {
    return this.draft()
      .map(item => {
        const field = item.field ? this.fieldForName(item.field) : undefined;
        if (field?.type === 'boolean' && item.value === undefined) {
          return undefined;
        }
        return field && item.operator && this.isComplete(field, item.operator, item.value)
          ? { field: field.name, operator: item.operator, value: item.value as FilterValue }
          : undefined;
      })
      .filter((item): item is FilterItem => item !== undefined);
  }

  private fieldForName(name: string): ListField | undefined {
    return this.filterableFields.find(field => field.name === name);
  }

  private isComplete(field: ListField, operator: FilterOperator, value: unknown): boolean {
    if (field.type === 'boolean') {
      return operator === 'equals' && typeof value === 'boolean';
    }

    if (operator === 'between') {
      return Array.isArray(value) && value.length === 2
        && value.every(item => this.isScalarForField(field, item))
        && (field.type === 'integer' || field.type === 'decimal'
          ? this.isOrderedNumericRange(value)
          : field.type !== 'date' && field.type !== 'datetime'
            || this.isOrderedDateRange(value, field.type));
    }

    if (operator === 'inThePast') {
      return ['hour', '24hours', 'week', 'month', 'year'].includes(String(value));
    }

    if (field.type === 'enum') {
      return operator === 'in' || operator === 'notIn'
        ? Array.isArray(value) && value.length > 0 && value.every(item => this.isScalarForField(field, item))
        : this.isScalarForField(field, value);
    }

    return this.isScalarForField(field, value);
  }

  private isScalarForField(field: ListField, value: unknown): boolean {
    if (field.type === 'string') {
      return typeof value === 'string' && value.trim().length > 0;
    }
    if (field.type === 'integer' || field.type === 'decimal') {
      return typeof value === 'number' && Number.isFinite(value)
        && (field.type !== 'integer' || Number.isInteger(value));
    }
    if (field.type === 'enum') {
      return field.values?.some(item => item.value === value) ?? false;
    }
    return typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(Date.parse(value));
  }

  private isOrderedDateRange(value: unknown, type: ListField['type']): boolean {
    if (!Array.isArray(value) || value.length !== 2
      || typeof value[0] !== 'string' || typeof value[1] !== 'string') {
      return true;
    }

    return type === 'date'
      ? value[0] <= value[1]
      : Date.parse(value[0]) <= Date.parse(value[1]);
  }

  private isInvalidDateRange(item: DraftFilter): boolean {
    const field = item.field ? this.fieldForName(item.field) : undefined;
    return !!field && item.operator === 'between'
      && (field.type === 'date' || field.type === 'datetime')
      && !this.isOrderedDateRange(item.value, field.type);
  }

  private isOrderedNumericRange(value: unknown): boolean {
    if (!Array.isArray(value) || value.length !== 2
      || typeof value[0] !== 'number' || typeof value[1] !== 'number') {
      return true;
    }

    return value[0] <= value[1];
  }

  private isInvalidNumericRange(item: DraftFilter): boolean {
    const field = item.field ? this.fieldForName(item.field) : undefined;
    return !!field && item.operator === 'between'
      && (field.type === 'integer' || field.type === 'decimal')
      && !this.isOrderedNumericRange(item.value);
  }

  private isFilterValue(value: unknown): value is FilterValue {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      || (Array.isArray(value) && value.every(item =>
        (typeof item === 'string' && item.trim().length > 0)
        || (typeof item === 'number' && Number.isFinite(item))
      ));
  }

  private operatorLabel(operator: FilterOperator): string {
    switch (operator) {
      case 'contains': return 'Contains';
      case 'equals': return 'Equals';
      case 'startsWith': return 'Starts with';
      case 'endsWith': return 'Ends with';
      case 'notEquals': return 'Not equals';
      case 'in': return 'In';
      case 'notIn': return 'Not in';
      case 'greaterThan': return 'Greater than';
      case 'greaterThanOrEqual': return 'Greater than or equal';
      case 'lessThan': return 'Less than';
      case 'lessThanOrEqual': return 'Less than or equal';
      case 'before': return 'Before';
      case 'after': return 'After';
      case 'inThePast': return 'In the past';
      default: return 'Between';
    }
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

  private update(index: number, changes: DraftFilter): void {
    this.draft.update(items => items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...changes } : item
    ));
  }
}
