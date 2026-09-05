import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-boolean-filter-editor',
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './boolean-filter-editor.html',
  styleUrl: './boolean-filter-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanFilterEditor {
  readonly value = model<unknown>();
  readonly showError = input(false);

  protected onChange(value: unknown): void {
    this.value.set(typeof value === 'boolean' ? value : undefined);
  }
}
