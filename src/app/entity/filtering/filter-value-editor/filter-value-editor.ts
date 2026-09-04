import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FilterOperator, ListField } from '../../entity-types';
import { StringFilterEditor } from '../string-filter-editor/string-filter-editor';
import { NumericFilterEditor } from '../numeric-filter-editor/numeric-filter-editor';
import { BooleanFilterEditor } from '../boolean-filter-editor/boolean-filter-editor';
import { DateFilterEditor } from '../date-filter-editor/date-filter-editor';

@Component({
  selector: 'app-enum-filter-editor',
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Value</mat-label>
      @if (isMultiple()) {
        <mat-select
          multiple
          [value]="selectValue()"
          (selectionChange)="onChange($event.value)"
          aria-label="Enum values">
          @for (option of field().values ?? []; track option.value) {
            <mat-option [value]="option.value">{{ option.label }}</mat-option>
          }
        </mat-select>
      } @else {
        <mat-select
          placeholder="Select a value"
          [value]="selectValue()"
          (selectionChange)="onChange($event.value)"
          aria-label="Enum value">
          @for (option of field().values ?? []; track option.value) {
            <mat-option [value]="option.value">{{ option.label }}</mat-option>
          }
        </mat-select>
      }
    </mat-form-field>
  `,
  styles: `
    :host, mat-form-field { display: block; width: 100%; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnumFilterEditor {
  readonly field = input.required<ListField>();
  readonly operator = input.required<FilterOperator>();
  readonly value = model<unknown>();

  protected readonly isMultiple = computed(() =>
    this.operator() === 'in' || this.operator() === 'notIn'
  );

  protected selectValue(): unknown {
    if (this.isMultiple()) {
      return Array.isArray(this.value()) ? this.value() : [];
    }

    return this.value() ?? '';
  }

  protected onChange(value: unknown): void {
    if (this.isMultiple()) {
      this.value.set(Array.isArray(value) ? value : []);
      return;
    }

    this.value.set(value === '' ? undefined : value);
  }
}

@Component({
  selector: 'app-filter-value-editor',
  host: {
    '[class.filter-value-datetime]': "field().type === 'datetime'",
    '[class.filter-value-numeric]': "field().type === 'integer' || field().type === 'decimal'",
    '[class.filter-value-string]': "field().type === 'string'"
  },
  imports: [StringFilterEditor, NumericFilterEditor, BooleanFilterEditor, DateFilterEditor, EnumFilterEditor],
  template: `
    @switch (field().type) {
      @case ('string') {
        <app-string-filter-editor
          [operator]="operator()"
          [(value)]="value"
          [showError]="showError()"
        />
      }
      @case ('integer') {
        <app-numeric-filter-editor [operator]="operator()" [(value)]="value" [integer]="true" [showError]="showError()" />
      }
      @case ('decimal') {
        <app-numeric-filter-editor [operator]="operator()" [(value)]="value" [showError]="showError()" />
      }
      @case ('boolean') {
        <app-boolean-filter-editor [(value)]="value" />
      }
      @case ('date') {
        <app-date-filter-editor [operator]="operator()" [(value)]="value" [showError]="showError()" />
      }
      @case ('datetime') {
        <app-date-filter-editor [operator]="operator()" [(value)]="value" [datetime]="true" [showError]="showError()" />
      }
      @case ('enum') {
        <app-enum-filter-editor [field]="field()" [operator]="operator()" [(value)]="value" />
      }
      @default {
        <p role="status">Filtering this field type is not supported yet.</p>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterValueEditor {
  readonly field = input.required<ListField>();
  readonly operator = input.required<FilterOperator>();
  readonly value = model<unknown>();
  readonly showError = input(false);
}
