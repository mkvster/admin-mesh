import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { FilterOperator, RelativePastPeriod } from '../../entity-types';

@Component({
  selector: 'app-date-value-input',
  imports: [
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
  ],
  template: `
    @if (datetime()) {
      <div class="datetime-fields">
        <mat-form-field appearance="outline">
          <mat-label>{{ label() }} date</mat-label>
          <input
            matInput
            [matDatepicker]="datepicker"
            [(ngModel)]="editableValue"
            (ngModelChange)="onValueChange($event)"
            [attr.aria-label]="label() + ' date'"
          />
          <mat-datepicker #datepicker />
          <mat-datepicker-toggle [for]="datepicker" matSuffix />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ label() }} time</mat-label>
          <input
            matInput
            [matTimepicker]="timepicker"
            [(ngModel)]="editableValue"
            [ngModelOptions]="{ updateOn: 'blur' }"
            (ngModelChange)="onValueChange($event)"
            [attr.aria-label]="label() + ' time'"
          />
          <mat-timepicker #timepicker />
          <mat-timepicker-toggle [for]="timepicker" matSuffix />
        </mat-form-field>
      </div>
    } @else {
      <mat-form-field appearance="outline">
        <mat-label>{{ label() }}</mat-label>
        <input
          matInput
          [matDatepicker]="datepicker"
          [(ngModel)]="editableValue"
          (ngModelChange)="onValueChange($event)"
          [attr.aria-label]="label()"
        />
        <mat-datepicker #datepicker />
        <mat-datepicker-toggle [for]="datepicker" matSuffix />
      </mat-form-field>
    }
  `,
  styles: `
    :host,
    mat-form-field {
      display: block;
      width: 100%;
    }
    .datetime-fields {
      display: flex;
      gap: 8px;
      width: 100%;
    }
    .datetime-fields mat-form-field {
      flex: 1 1 150px;
      min-width: 150px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateValueInput {
  readonly label = input.required<string>();
  readonly value = input<Date | null>(null);
  readonly datetime = input(false);
  readonly dateChange = output<Date>();
  protected editableValue: Date | null = null;

  private readonly syncEditableValue = effect(() => {
    this.editableValue = this.value();
  });

  protected onValueChange(date: Date | null): void {
    if (date && !Number.isNaN(date.getTime())) {
      this.dateChange.emit(date);
    }
  }

  protected onDateChange(event: MatDatepickerInputEvent<Date>): void {
    const date = event.value;
    if (date && !Number.isNaN(date.getTime())) {
      this.dateChange.emit(date);
    }
  }
}

@Component({
  selector: 'app-date-filter-editor',
  imports: [DateValueInput, MatFormFieldModule, MatSelectModule],
  template: `
    @if (isRelative()) {
      <mat-form-field appearance="outline">
        <mat-label>Period</mat-label>
        <mat-select
          [value]="relativePeriod()"
          (selectionChange)="onRelativeChange($event.value)"
          aria-label="Relative period"
        >
          @for (period of relativePeriods; track period.value) {
            <mat-option [value]="period.value">{{ period.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    } @else if (isBetween()) {
      <div class="range-fields" [class.datetime-range]="datetime()">
        <app-date-value-input
          label="From"
          [value]="fromDate()"
          [datetime]="datetime()"
          (dateChange)="onDateChange($event, 'from')"
        />
        <app-date-value-input
          label="To"
          [value]="toDate()"
          [datetime]="datetime()"
          (dateChange)="onDateChange($event, 'to')"
        />
      </div>
    } @else {
      <app-date-value-input
        label="Value"
        [value]="singleDate()"
        [datetime]="datetime()"
        (dateChange)="onDateChange($event, 'single')"
      />
    }
  `,
  styles: `
    :host,
    .range-fields {
      display: flex;
      gap: 8px;
      width: 100%;
    }
    app-date-value-input {
      flex: 1 1 260px;
      min-width: 0;
    }
    .datetime-range {
      flex-wrap: wrap;
    }
    .datetime-range app-date-value-input {
      flex-basis: 100%;
    }
  `,
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
    if (typeof value !== 'string') {
      return null;
    }

    if (!this.datetime() && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
