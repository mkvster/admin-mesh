import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';

@Component({
  selector: 'app-date-value-input',
  imports: [
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
  ],
  templateUrl: './date-value-input.html',
  styleUrl: './date-value-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateValueInput {
  readonly label = input.required<string>();
  readonly value = input<Date | null>(null);
  readonly datetime = input(false);
  readonly dateChange = output<Date>();
  protected editableValue: Date | null = null;
  private readonly syncEditableValue = effect(() => {
    this.editableValue = this.value();
  });
  protected onValueChange(date: Date | null): void {
    if (date && !Number.isNaN(date.getTime())) this.dateChange.emit(date);
  }
}
