import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FilterOperator } from '../../entity-types';

@Component({
  selector: 'app-numeric-filter-editor',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './numeric-filter-editor.html',
  styleUrl: './numeric-filter-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericFilterEditor {
  readonly operator = input.required<FilterOperator>();
  readonly integer = input(false);
  readonly value = model<unknown>();
  readonly showError = input(false);

  protected readonly isBetween = computed(() => this.operator() === 'between');
  protected readonly step = computed(() => (this.integer() ? '1' : 'any'));
  protected readonly singleValue = computed(() => this.numberValue(this.value()));
  protected readonly fromValue = computed(() => this.rangeValue(0));
  protected readonly toValue = computed(() => this.rangeValue(1));

  protected onInput(event: Event, part: 'single' | 'from' | 'to'): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = raw === '' ? undefined : Number(raw);
    if (part === 'single') {
      this.value.set(parsed);
      return;
    }

    const range = Array.isArray(this.value())
      ? [...(this.value() as unknown[])]
      : [undefined, undefined];
    range[part === 'from' ? 0 : 1] = parsed;
    this.value.set(range as [number | undefined, number | undefined]);
  }

  private numberValue(value: unknown): string {
    return typeof value === 'number' ? String(value) : '';
  }

  private rangeValue(index: number): string {
    const value = this.value();
    return Array.isArray(value) && typeof value[index] === 'number' ? String(value[index]) : '';
  }
}
