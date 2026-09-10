import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EntityPreview } from '../entity-preview/entity-preview';
import { EntityDialogHeader } from '../entity-dialog-header/entity-dialog-header';
import { formatEntityTitle } from '../entity-title';
import { ENTITY_FIELD_VALUE_IN_POPUP } from '../entity-field-value/entity-field-value-context';

export interface DeleteConfirmationDialogData {
  resource: string;
  formId?: string;
  id: string | number;
  entityTitle: string;
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, EntityDialogHeader, EntityPreview],
  templateUrl: './delete-confirmation-dialog.html',
  styleUrl: './delete-confirmation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: ENTITY_FIELD_VALUE_IN_POPUP, useValue: true }],
})
export class DeleteConfirmationDialog {
  readonly data = inject<DeleteConfirmationDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DeleteConfirmationDialog, boolean>);
  private readonly preview = viewChild(EntityPreview);

  protected readonly canConfirm = computed(
    () => !this.data.formId || this.preview()?.state().status === 'loaded',
  );
  protected readonly title = computed(
    () => `Delete ${formatEntityTitle(this.data.entityTitle, this.data.id)}?`,
  );

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected confirm(): void {
    if (this.canConfirm()) {
      this.dialogRef.close(true);
    }
  }
}
