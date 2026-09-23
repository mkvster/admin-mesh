import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EntityApi } from './entity-api';
import {
  DeleteConfirmationDialog,
  DeleteConfirmationDialogData,
} from './delete-confirmation-dialog/delete-confirmation-dialog';

export type EntityDeletionTarget = Omit<DeleteConfirmationDialogData, 'id'> & {
  id: unknown;
};

export interface EntityDeletionControllerOptions {
  readonly api: EntityApi;
  readonly dialog: MatDialog;
}

export class EntityDeletionController {
  readonly error = signal<string | null>(null);
  readonly inProgress = signal(false);

  constructor(private readonly options: EntityDeletionControllerOptions) {}

  requestDelete(target: EntityDeletionTarget, onDeleted: () => void): void {
    if (this.inProgress()) return;

    if (target.id === undefined || target.id === null) {
      this.error.set(`Cannot delete ${target.entityTitle}: the row has no identifier.`);
      return;
    }

    this.error.set(null);
    const dialogRef = this.options.dialog.open(DeleteConfirmationDialog, {
      data: {
        resource: target.resource,
        formId: target.formId,
        id: target.id as string | number,
        entityTitle: target.entityTitle,
      } satisfies DeleteConfirmationDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed === true) {
        this.delete(target, onDeleted);
      }
    });
  }

  private delete(target: EntityDeletionTarget, onDeleted: () => void): void {
    if (typeof target.id !== 'string' && typeof target.id !== 'number') {
      this.error.set('Cannot delete the selected row: its identifier is invalid.');
      return;
    }

    this.inProgress.set(true);
    this.options.api.deleteEntity(target.resource, target.id).subscribe({
      next: () => {
        this.error.set(null);
        onDeleted();
      },
      error: (cause: unknown) => {
        console.error('Entity deletion failed', cause);
        this.error.set('Failed to delete the selected entity.');
        this.inProgress.set(false);
      },
      complete: () => this.inProgress.set(false),
    });
  }
}
