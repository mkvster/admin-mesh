import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FilterOperator, ListField } from '../../entity-types';
import { StringFilterEditor } from '../string-filter-editor/string-filter-editor';

@Component({
  selector: 'app-filter-value-editor',
  imports: [StringFilterEditor],
  template: `
    @switch (field().type) {
      @case ('string') {
        <app-string-filter-editor
          [operator]="operator()"
          [(value)]="value"
          [showError]="showError()"
        />
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
