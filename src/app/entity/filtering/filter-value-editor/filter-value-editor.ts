import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FilterOperator, ListField } from '../../entity-types';
import { StringFilterEditor } from '../string-filter-editor/string-filter-editor';
import { NumericFilterEditor } from '../numeric-filter-editor/numeric-filter-editor';
import { BooleanFilterEditor } from '../boolean-filter-editor/boolean-filter-editor';
import { DateFilterEditor } from '../date-filter-editor/date-filter-editor';
import { EnumFilterEditor } from '../enum-filter-editor/enum-filter-editor';

@Component({
  selector: 'app-filter-value-editor',
  host: {
    '[class.filter-value-datetime]': "field().type === 'datetime'",
    '[class.filter-value-numeric]': "field().type === 'integer' || field().type === 'decimal'",
    '[class.filter-value-string]': "field().type === 'string'",
  },
  imports: [
    StringFilterEditor,
    NumericFilterEditor,
    BooleanFilterEditor,
    DateFilterEditor,
    EnumFilterEditor,
  ],
  templateUrl: './filter-value-editor.html',
  styleUrl: './filter-value-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterValueEditor {
  readonly field = input.required<ListField>();
  readonly operator = input.required<FilterOperator>();
  readonly value = model<unknown>();
  readonly showError = input(false);
}
