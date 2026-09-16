import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FilterOperator } from '../../entity-types';
import { MAX_STRING_FILTER_VALUE_LENGTH } from '../filter-constraints';
import { StringValueInput } from '../../field-editors/string-value-input/string-value-input';

@Component({
  selector: 'app-string-filter-editor',
  imports: [StringValueInput],
  templateUrl: './string-filter-editor.html',
  styleUrl: './string-filter-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringFilterEditor {
  protected readonly maxLength = MAX_STRING_FILTER_VALUE_LENGTH;
  readonly operator = input.required<FilterOperator>();
  readonly value = model<unknown>();
  readonly showError = input(false);

  protected readonly stringValue = computed(() =>
    typeof this.value() === 'string' ? (this.value() as string) : '',
  );

  protected readonly label = computed(() => {
    switch (this.operator()) {
      case 'equals':
        return 'Equals';
      case 'startsWith':
        return 'Starts with';
      case 'endsWith':
        return 'Ends with';
      default:
        return 'Contains';
    }
  });

  protected onValueChange(value: string): void {
    this.value.set(value);
  }
}
