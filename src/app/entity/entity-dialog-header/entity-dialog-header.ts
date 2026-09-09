import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-entity-dialog-header',
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './entity-dialog-header.html',
  styleUrl: './entity-dialog-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDialogHeader {
  readonly title = input.required<string>();
  readonly icon = input.required<string>();
  readonly iconSet = input('material-icons');
  readonly iconColor = input<string>();
  readonly closed = output<void>();
}
