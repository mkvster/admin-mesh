import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EntityPreview } from '../entity-preview/entity-preview';
import { FormMetadataStore } from '../form-metadata-store';
import { EntityDialogHeader } from '../entity-dialog-header/entity-dialog-header';
import { formatEntityTitle } from '../entity-title';

export interface EntityPreviewDialogData {
  resource: string;
  formId: string;
  id: string | number;
  singularTitle: string;
  icon: string;
  iconSet?: string;
  iconColor?: string;
}

@Component({
  selector: 'app-entity-preview-dialog',
  imports: [MatDialogModule, MatButtonModule, EntityDialogHeader, EntityPreview],
  templateUrl: './entity-preview-dialog.html',
  styleUrl: './entity-preview-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityPreviewDialog {
  readonly data = inject<EntityPreviewDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EntityPreviewDialog>);
  private readonly formMetadataStore = inject(FormMetadataStore);

  private readonly formMetadata = toSignal(
    this.formMetadataStore
      .get(this.data.resource, this.data.formId)
      .pipe(catchError(() => of(undefined))),
  );

  protected readonly title = computed(
    () =>
      this.formMetadata()?.layout?.title ??
      formatEntityTitle(this.data.singularTitle, this.data.id),
  );

  protected close(): void {
    this.dialogRef.close();
  }
}
