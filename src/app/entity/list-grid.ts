import { Component, computed, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ListMetadata } from './entity-types';
import { ListGridCell } from './list-grid-cell';

@Component({
  selector: 'app-list-grid',
  imports: [MatTableModule, ListGridCell],
  templateUrl: './list-grid.html',
  styleUrl: './list-grid.scss'
})
export class ListGrid {
  readonly metadata = input.required<ListMetadata>();
  readonly rows = input.required<Record<string, unknown>[]>();

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
