import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FieldMetadata, FilterOperator } from '../../entity-types';
import { ReferenceLookupSelection } from '../../reference-lookup-view/reference-lookup-view';
import { ReferenceLookupState } from '../../reference-lookup-state';

@Component({
  selector: 'app-reference-filter-editor',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './reference-filter-editor.html',
  styleUrl: './reference-filter-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceFilterEditor {
  readonly field = input.required<FieldMetadata>();
  readonly operator = input.required<FilterOperator>();
  readonly value = model<unknown>();
  private readonly lookup = inject(ReferenceLookupState);
  private readonly labels = signal<Map<string | number, string>>(new Map());
  protected readonly isMultiple = computed(
    () => this.operator() === 'in' || this.operator() === 'notIn',
  );
  protected readonly selectedIds = computed<(string | number)[]>(() => {
    const current = this.value();
    const values = Array.isArray(current) ? current : current == null ? [] : [current];
    return values.filter(
      (item): item is string | number =>
        (typeof item === 'string' && item.trim().length > 0) ||
        (typeof item === 'number' && Number.isFinite(item)),
    );
  });
  protected readonly displayValue = computed(() =>
    this.selectedIds()
      .map(
        (id) => this.labels().get(id) ?? this.lookup.displayValue(this.field(), id) ?? String(id),
      )
      .join(', '),
  );

  protected openLookup(): void {
    const field = this.field();
    const selectedValues = this.selectedIds().map((id) => ({
      id,
      displayValue: this.labels().get(id) ?? this.lookup.displayValue(field, id) ?? String(id),
    }));
    this.lookup.open({
      field,
      mode: this.isMultiple() ? 'multiple' : 'single',
      selectedValues,
      complete: (result) => {
        if (!result) return;
        const selections = result;
        this.labels.update((current) => {
          const next = new Map(current);
          for (const selection of selections) {
            if (selection.displayValue !== String(selection.id) || !next.has(selection.id)) {
              next.set(selection.id, selection.displayValue);
            }
          }
          return next;
        });
        this.value.set(
          this.isMultiple() ? selections.map((selection) => selection.id) : selections[0]?.id,
        );
        this.lookup.remember(field, selections);
      },
    });
  }

  protected clear(): void {
    this.value.set(this.isMultiple() ? [] : undefined);
  }
}
