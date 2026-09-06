import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { FieldDisplay, FieldMetadata } from '../entity-types';

@Component({
  selector: 'app-entity-field-value',
  imports: [MatCheckboxModule, MatChipsModule, MatIconModule],
  templateUrl: './entity-field-value.html',
  styleUrl: './entity-field-value.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityFieldValue {
  readonly field = input.required<FieldMetadata>();
  readonly display = input<FieldDisplay>();
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
    const display = this.display();
    const displayValue = display?.type === 'reference' ? this.row()[display.valueField] : undefined;

    return displayValue == null || displayValue === '' ? this.textValue() : String(displayValue);
  });

  protected readonly hasRenderableValue = computed(() => {
    if (this.value() != null) {
      return true;
    }

    const display = this.display();
    const displayValue = display?.type === 'reference' ? this.row()[display.valueField] : undefined;

    return displayValue != null && displayValue !== '';
  });

  protected booleanStyle(): 'icon' | 'checkbox' | 'text' | undefined {
    const display = this.display();
    return display?.type === 'boolean' ? display.style : undefined;
  }

  protected enumStyle(): 'label' | 'value' | undefined {
    const display = this.display();
    return display?.type === 'enum' ? display.style : undefined;
  }
}
