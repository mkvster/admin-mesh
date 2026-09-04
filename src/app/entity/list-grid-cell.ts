import { Component, computed, input } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { ListColumn, ListField } from './entity-types';

@Component({
  selector: 'app-list-grid-cell',
  imports: [MatCheckboxModule, MatChipsModule, MatIconModule],
  templateUrl: './list-grid-cell.html',
  styleUrl: './list-grid-cell.scss',
})
export class ListGridCell {
  readonly field = input.required<ListField>();
  readonly column = input.required<ListColumn>();
  readonly value = input<unknown>();
  readonly row = input<Record<string, unknown>>({});

  protected readonly textValue = computed(() => {
    const value = this.value();

    return value == null ? '' : String(value);
  });

  protected readonly enumLabel = computed(() => {
    const value = this.value();

    return this.field().values?.find((item) => item.value === value)?.label ?? this.textValue();
  });

  protected readonly referenceValue = computed(() => {
    const display = this.column().display;
    const displayValue = display?.type === 'reference' ? this.row()[display.valueField] : undefined;

    return displayValue == null || displayValue === '' ? this.textValue() : String(displayValue);
  });

  protected readonly hasRenderableValue = computed(() => {
    if (this.value() != null) {
      return true;
    }

    const display = this.column().display;
    const displayValue = display?.type === 'reference' ? this.row()[display.valueField] : undefined;

    return displayValue != null && displayValue !== '';
  });

  protected booleanStyle(): 'icon' | 'checkbox' | 'text' | undefined {
    const display = this.column().display;
    return display?.type === 'boolean' ? display.style : undefined;
  }

  protected enumStyle(): 'label' | 'value' | undefined {
    const display = this.column().display;
    return display?.type === 'enum' ? display.style : undefined;
  }
}
