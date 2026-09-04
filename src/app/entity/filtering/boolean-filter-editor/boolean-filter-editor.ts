import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-boolean-filter-editor',
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Value</mat-label>
      <mat-select
        [value]="value()"
        (selectionChange)="onChange($event.value)"
        aria-label="Boolean value"
      >
        <mat-option [value]="true">Yes</mat-option>
        <mat-option [value]="false">No</mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: `
    :host,
    mat-form-field {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanFilterEditor {
  readonly value = model<unknown>();
  readonly showError = input(false);

  protected onChange(value: unknown): void {
    this.value.set(typeof value === 'boolean' ? value : undefined);
  }
}
