import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-string-value-input',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './string-value-input.html',
  styleUrl: './string-value-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringValueInput {
  readonly label = input.required<string>();
  readonly value = input('');
  readonly valueChange = output<string>();
  readonly maxLength = input<number | null>(null);
  readonly pattern = input<string | null>(null);
  readonly control = input<FormControl<unknown> | null | undefined>(null);
  readonly showCounter = input(false);
  readonly requiredError = input(false);
  readonly patternError = input(false);
  readonly blur = output<void>();
  protected readonly editableValue = signal('');
  protected readonly inputPatternMismatch = signal(false);
  private readonly fallbackControl = new FormControl<unknown>('', { nonNullable: true });
  protected readonly activeControl = computed(() => this.control() ?? this.fallbackControl);
  private readonly syncEditableValue = effect(() => {
    this.editableValue.set(this.value());
    if (!this.control()) this.fallbackControl.setValue(this.value(), { emitEvent: false });
  });
  protected readonly patternMismatch = computed(() => {
    const pattern = this.pattern();
    const value = this.editableValue();
    if (!pattern || !value) return false;
    try {
      return !new RegExp(pattern).test(value);
    } catch {
      return false;
    }
  });

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.editableValue.set(value);
    this.inputPatternMismatch.set(this.matchesPattern(value));
    this.valueChange.emit(value);
  }

  private matchesPattern(value: string): boolean {
    const pattern = this.pattern();
    if (!pattern || !value) return false;
    try {
      return !new RegExp(pattern).test(value);
    } catch {
      return false;
    }
  }
}
