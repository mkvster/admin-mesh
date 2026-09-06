import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface DeleteConfirmationDialogData {
  entityTitle: string;
  idLabel: string;
  id: string;
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './delete-confirmation-dialog.html',
  styleUrl: './delete-confirmation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmationDialog {
  readonly data = inject<DeleteConfirmationDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DeleteConfirmationDialog, boolean>);

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected confirm(): void {
    this.dialogRef.close(true);
  }
}
