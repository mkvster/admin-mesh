import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FilterOperator, ListField } from '../../entity-types';

@Component({
  selector: 'app-enum-filter-editor',
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './enum-filter-editor.html',
  styleUrl: './enum-filter-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnumFilterEditor {
  readonly field = input.required<ListField>();
  readonly operator = input.required<FilterOperator>();
  readonly value = model<unknown>();
  protected readonly isMultiple = computed(
    () => this.operator() === 'in' || this.operator() === 'notIn',
  );
  protected selectValue(): unknown {
    return this.isMultiple()
      ? Array.isArray(this.value())
        ? this.value()
        : []
      : (this.value() ?? '');
  }
  protected onChange(value: unknown): void {
    if (this.isMultiple()) {
      this.value.set(Array.isArray(value) ? value : []);
      return;
    }
    this.value.set(value === '' ? undefined : value);
  }
}
