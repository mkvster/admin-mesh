import { Signal } from '@angular/core';

import { FilterItem } from './entity-types';

export interface ListFilterEditingAdapter {
  readonly editing: Signal<boolean>;
  open(): void;
  apply(filters: FilterItem[]): void;
  cancel(): void;
  clear(): void;
}
