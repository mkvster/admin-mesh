import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

export interface EnumValueOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-enum-value-input',
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './enum-value-input.html',
  styleUrl: './enum-value-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnumValueInput {
  readonly label = input.required<string>();
  readonly options = input<EnumValueOption[]>([]);
  readonly value = input<unknown>(null);
  readonly multiple = input(false);
  readonly valueChange = output<unknown>();
  readonly requiredError = input(false);
  protected readonly selectedValue = computed(() =>
    this.multiple() ? (Array.isArray(this.value()) ? this.value() : []) : (this.value() ?? ''),
  );

  protected onChange(value: unknown): void {
    this.valueChange.emit(value === '' ? null : value);
  }
}
