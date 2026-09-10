import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { FieldDisplay, FieldMetadata } from '../entity-types';
import { ENTITY_FIELD_VALUE_IN_POPUP } from './entity-field-value-context';

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

  private readonly inPopup = inject(ENTITY_FIELD_VALUE_IN_POPUP);

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

  protected readonly referenceHasPreview = computed(() => {
    const display = this.display();
    return display?.type === 'reference' && Boolean(display.previewForm);
  });

  protected readonly referenceNavigates = computed(() => false);

  protected readonly referenceIsInteractive = computed(
    () => !this.inPopup && (this.referenceHasPreview() || this.referenceNavigates()),
  );

  protected readonly currencyValue = computed(() => {
    const display = this.display();
    const value = this.value();
    if (display?.type !== 'numeric' || value == null || value === '') {
      return this.textValue();
    }

    const amount = Number(value);
    return Number.isNaN(amount)
      ? this.textValue()
      : new Intl.NumberFormat(undefined, { style: 'currency', currency: display.currency }).format(
          amount,
        );
  });

  protected readonly formattedDateValue = computed(() => {
    const display = this.display();
    const value = this.value();
    if (
      (display?.type !== 'date' && display?.type !== 'datetime') ||
      value == null ||
      value === ''
    ) {
      return this.textValue();
    }

    const date =
      display.type === 'date' && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? this.parseLocalDate(value)
        : new Date(value as string | number);
    if (Number.isNaN(date.getTime())) {
      return this.textValue();
    }

    const options: Intl.DateTimeFormatOptions =
      display.type === 'datetime'
        ? { dateStyle: display.style, timeStyle: display.style }
        : { dateStyle: display.style };
    return new Intl.DateTimeFormat(undefined, options).format(date);
  });

  protected booleanStyle(): 'icon' | 'checkbox' | 'text' | undefined {
    const display = this.display();
    return display?.type === 'boolean' ? display.style : undefined;
  }

  protected enumStyle(): 'label' | 'value' | undefined {
    const display = this.display();
    return display?.type === 'enum' ? display.style : undefined;
  }

  private parseLocalDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
