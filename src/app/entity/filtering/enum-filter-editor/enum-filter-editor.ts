import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FieldMetadata, FilterOperator } from '../../entity-types';
import { EnumValueInput } from '../../field-editors/enum-value-input/enum-value-input';

@Component({
  selector: 'app-enum-filter-editor',
  imports: [EnumValueInput],
  templateUrl: './enum-filter-editor.html',
  styleUrl: './enum-filter-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnumFilterEditor {
  readonly field = input.required<FieldMetadata>();
  readonly operator = input.required<FilterOperator>();
  readonly value = model<unknown>();
  protected readonly isMultiple = computed(
    () => this.operator() === 'in' || this.operator() === 'notIn',
  );
  protected onChange(value: unknown): void {
    if (this.isMultiple()) {
      this.value.set(Array.isArray(value) ? value : []);
      return;
    }
    this.value.set(value === '' ? undefined : value);
  }
}
