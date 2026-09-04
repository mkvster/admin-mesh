import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FilterOperator } from '../../entity-types';

@Component({
  selector: 'app-numeric-filter-editor',
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    @if (isBetween()) {
      <div class="range-fields">
        <mat-form-field appearance="outline">
          <mat-label>From</mat-label>
          <input
            matInput
            type="number"
            [step]="step()"
            [value]="fromValue()"
            (input)="onInput($event, 'from')"
            aria-label="From"
          />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>To</mat-label>
          <input
            matInput
            type="number"
            [step]="step()"
            [value]="toValue()"
            (input)="onInput($event, 'to')"
            aria-label="To"
          />
        </mat-form-field>
      </div>
    } @else {
      <div class="single-field">
        <mat-form-field appearance="outline">
          <mat-label>Value</mat-label>
          <input
            matInput
            type="number"
            [step]="step()"
            [value]="singleValue()"
            (input)="onInput($event, 'single')"
            aria-label="Value"
          />
        </mat-form-field>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .range-fields {
      display: flex;
      gap: 8px;
      width: 100%;
    }
    .single-field,
    .single-field mat-form-field {
      width: 100%;
    }
    mat-form-field {
      flex: 1;
      min-width: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericFilterEditor {
  readonly operator = input.required<FilterOperator>();
  readonly integer = input(false);
  readonly value = model<unknown>();
  readonly showError = input(false);

  protected readonly isBetween = computed(() => this.operator() === 'between');
  protected readonly step = computed(() => (this.integer() ? '1' : 'any'));
  protected readonly singleValue = computed(() => this.numberValue(this.value()));
  protected readonly fromValue = computed(() => this.rangeValue(0));
  protected readonly toValue = computed(() => this.rangeValue(1));

  protected onInput(event: Event, part: 'single' | 'from' | 'to'): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = raw === '' ? undefined : Number(raw);
    if (part === 'single') {
      this.value.set(parsed);
      return;
    }

    const range = Array.isArray(this.value())
      ? [...(this.value() as unknown[])]
      : [undefined, undefined];
    range[part === 'from' ? 0 : 1] = parsed;
    this.value.set(range as [number | undefined, number | undefined]);
  }

  private numberValue(value: unknown): string {
    return typeof value === 'number' ? String(value) : '';
  }

  private rangeValue(index: number): string {
    const value = this.value();
    return Array.isArray(value) && typeof value[index] === 'number' ? String(value[index]) : '';
  }
}
