import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FilterOperator, RelativePastPeriod } from '../../entity-types';
import { DateValueInput } from '../../field-editors/date-value-input/date-value-input';
import { parseDateValue, serializeDateValue } from '../date-serialization';

@Component({
  selector: 'app-date-filter-editor',
  imports: [DateValueInput, MatFormFieldModule, MatSelectModule],
  templateUrl: './date-filter-editor.html',
  styleUrl: './date-filter-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateFilterEditor {
  readonly operator = input.required<FilterOperator>();
  readonly datetime = input(false);
  readonly value = model<unknown>();
  readonly showError = input(false);
  protected readonly isBetween = computed(() => this.operator() === 'between');
  protected readonly isRelative = computed(() => this.operator() === 'inThePast');
  protected readonly relativePeriods: { value: RelativePastPeriod; label: string }[] = [
    { value: 'hour', label: 'Past hour' },
    { value: '24hours', label: 'Past 24 hours' },
    { value: 'week', label: 'Past week' },
    { value: 'month', label: 'Past month' },
    { value: 'year', label: 'Past year' },
  ];
  protected readonly singleDate = computed(() => this.toDateValue(this.value()));
  protected readonly fromDate = computed(() => this.toDateValue(this.rangeValue(0)));
  protected readonly toDate = computed(() => this.toDateValue(this.rangeValue(1)));
  protected readonly relativePeriod = computed(() =>
    this.relativePeriods.some((period) => period.value === this.value())
      ? (this.value() as RelativePastPeriod)
      : '24hours',
  );
  protected onRelativeChange(period: RelativePastPeriod): void {
    this.value.set(period);
  }
  protected onDateChange(date: Date, part: 'single' | 'from' | 'to'): void {
    const serialized = serializeDateValue(date, this.datetime() ? 'datetime' : 'date');
    if (part === 'single') {
      this.value.set(serialized);
      return;
    }
    const range = Array.isArray(this.value())
      ? [...(this.value() as unknown[])]
      : [undefined, undefined];
    range[part === 'from' ? 0 : 1] = serialized;
    this.value.set(range);
  }
  private rangeValue(index: number): unknown {
    const value = this.value();
    return Array.isArray(value) ? value[index] : undefined;
  }
  private toDateValue(value: unknown): Date | null {
    return parseDateValue(value, this.datetime() ? 'datetime' : 'date');
  }
}
