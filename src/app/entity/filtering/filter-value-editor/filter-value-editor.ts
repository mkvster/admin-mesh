import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FilterOperator, ListField } from '../../entity-types';
import { StringFilterEditor } from '../string-filter-editor/string-filter-editor';
import { NumericFilterEditor } from '../numeric-filter-editor/numeric-filter-editor';
import { BooleanFilterEditor } from '../boolean-filter-editor/boolean-filter-editor';
import { DateFilterEditor } from '../date-filter-editor/date-filter-editor';

@Component({
  selector: 'app-filter-value-editor',
  host: {
    '[class.filter-value-datetime]': "field().type === 'datetime'",
    '[class.filter-value-numeric]': "field().type === 'integer' || field().type === 'decimal'",
    '[class.filter-value-string]': "field().type === 'string'"
  },
  imports: [StringFilterEditor, NumericFilterEditor, BooleanFilterEditor, DateFilterEditor],
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
