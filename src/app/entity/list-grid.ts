import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilterItem, ListMetadata, ListSort } from './entity-types';
import { ListGridCell } from './list-grid-cell';

export interface ListPageChange {
  page: number;
  pageSize: number;
}

export interface ListSortChange {
  sort: ListSort[];
}

@Component({
  selector: 'app-list-grid',
  imports: [MatPaginatorModule, MatTableModule, MatIconModule, MatTooltipModule, ListGridCell],
  templateUrl: './list-grid.html',
  styleUrl: './list-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListGrid {
  readonly metadata = input.required<ListMetadata>();
  readonly rows = input.required<Record<string, unknown>[]>();
  readonly totalCount = input.required<number>();
  readonly page = input(1);
  readonly pageSize = input(25);
  readonly pageChange = output<ListPageChange>();
  readonly sort = input<ListSort[]>([]);
  readonly filters = input<FilterItem[]>([]);
  readonly sortChange = output<ListSortChange>();

  protected readonly displayedColumns = computed(() =>
    this.metadata().columns.map((column) => column.field),
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
        : `${this.operatorLabel(item.operator)} ${summary}`;
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
      : `${this.operatorLabel(item.operator)} ${value}`;
  }

  private formatFilterValue(value: string | number, fieldType: string | undefined): string {
    if (fieldType !== 'date' && fieldType !== 'datetime') {
      return String(value);
    }

    const date =
      fieldType === 'date' && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? this.parseDate(value)
        : new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value)
      : new Intl.DateTimeFormat(
          undefined,
          fieldType === 'datetime'
            ? { dateStyle: 'medium', timeStyle: 'short' }
            : { dateStyle: 'medium' },
        ).format(date);
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private operatorLabel(operator: FilterItem['operator']): string {
    switch (operator) {
      case 'equals':
        return 'Equals';
      case 'startsWith':
        return 'Starts with';
      case 'endsWith':
        return 'Ends with';
      case 'notEquals':
        return 'Not equals';
      case 'greaterThan':
        return 'Greater than';
      case 'greaterThanOrEqual':
        return 'Greater than or equal';
      case 'lessThan':
        return 'Less than';
      case 'lessThanOrEqual':
        return 'Less than or equal';
      case 'before':
        return 'Before';
      case 'after':
        return 'After';
      case 'inThePast':
        return 'In the past';
      case 'between':
        return 'Between';
      default:
        return 'Contains';
    }
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

  protected onPageChange(event: PageEvent): void {
    this.pageChange.emit({
      page: event.pageIndex + 1,
      pageSize: event.pageSize,
    });
  }
}
