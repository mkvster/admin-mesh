import { Component, computed, input } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { ListColumn, ListField } from './entity-types';

@Component({
  selector: 'app-list-grid-cell',
  imports: [
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './list-grid-cell.html',
  styleUrl: './list-grid-cell.scss'
})
export class ListGridCell {
  readonly field = input.required<ListField>();
  readonly column = input.required<ListColumn>();
  readonly value = input<unknown>();

  protected readonly textValue = computed(() => {
    const value = this.value();

    return value == null ? '' : String(value);
  });

  protected readonly enumLabel = computed(() => {
    const value = this.value();

    return this.field().values
      ?.find(item => item.value === value)
      ?.label ?? this.textValue();
  });
}
