import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FilterOperator, RelativePastPeriod } from '../../entity-types';
import { DateValueInput } from '../date-value-input/date-value-input';

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
    const serialized = this.datetime() ? date.toISOString() : this.formatDate(date);
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
    if (typeof value !== 'string') return null;
    if (!this.datetime() && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
