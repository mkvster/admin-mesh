import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-state',
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './not-found-state.html',
  styleUrl: './not-found-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundState {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
}
