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
  changeDetection: ChangeDetectionStrategy.OnPush
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
    this.metadata().columns.map(column => column.field)
  );

  protected readonly columns = computed(() => {
    const metadata = this.metadata();

    const fields = new Map(
      metadata.fields.map(field => [field.name, field])
    );

    return metadata.columns.map(column => ({
      column,
      field: fields.get(column.field)
    }));
  });

  protected fieldLabel(fieldName: string): string {
    return this.metadata().fields
      .find(field => field.name === fieldName)
      ?.label ?? fieldName;
  }

  protected sortFor(field: string): ListSort | undefined {
    return this.sort().find(item => item.field === field);
  }

  protected sortPriority(field: string): number | undefined {
    const index = this.sort().findIndex(item => item.field === field);
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
    return this.filters().filter(item => item.field === field);
  }

  protected filterSummary(field: string): string {
    return this.filtersFor(field)
      .map(item => `${this.operatorLabel(item.operator)} "${item.value}"`)
      .join('\nAND ');
  }

  private operatorLabel(operator: FilterItem['operator']): string {
    switch (operator) {
      case 'equals': return 'Equals';
      case 'startsWith': return 'Starts with';
      case 'endsWith': return 'Ends with';
      default: return 'Contains';
    }
  }

  protected onSort(field: string, event: MouseEvent): void {
    const column = this.metadata().columns.find(item => item.field === field);
    if (column?.disableSorting) {
      return;
    }

    const current = this.sortFor(field);
    const nextDirection = current
      ? current.direction === 'asc' ? 'desc' : undefined
      : 'asc';

    if (!event.shiftKey) {
      this.sortChange.emit({
        sort: nextDirection ? [{ field, direction: nextDirection }] : []
      });
      return;
    }

    const currentIndex = this.sort().findIndex(item => item.field === field);
    const nextSort = this.sort().filter(item => item.field !== field);
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
      pageSize: event.pageSize
    });
  }

}
