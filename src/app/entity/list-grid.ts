import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ListMetadata } from './entity-types';
import { ListGridCell } from './list-grid-cell';

export interface ListPageChange {
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-list-grid',
  imports: [MatPaginatorModule, MatTableModule, ListGridCell],
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

  protected onPageChange(event: PageEvent): void {
    this.pageChange.emit({
      page: event.pageIndex + 1,
      pageSize: event.pageSize
    });
  }

  // protected cellValue(
  //   row: Record<string, unknown>,
  //   fieldName: string
  // ): string {
  //   const value = row[fieldName];

  //   if (value == null) {
  //     return '';
  //   }

  //   const field = this.metadata().fields
  //     .find(field => field.name === fieldName);

  //   if (field?.type === 'enum') {
  //     return field.values
  //       ?.find(item => item.value === value)
  //       ?.label ?? String(value);
  //   }

  //   return String(value);
  // }
}
