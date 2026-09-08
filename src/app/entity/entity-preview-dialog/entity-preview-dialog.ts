import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EntityPreview } from '../entity-preview/entity-preview';
import { FormMetadataStore } from '../form-metadata-store';

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
  imports: [MatDialogModule, MatButtonModule, MatIconModule, EntityPreview],
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
    () => this.formMetadata()?.layout?.title ?? this.fallbackTitle(),
  );

  protected close(): void {
    this.dialogRef.close();
  }

  private fallbackTitle(): string {
    return `${this.data.singularTitle} ${this.idMarker(this.data.id)}`;
  }

  private idMarker(id: string | number): string {
    return Number.isInteger(id) ? String(id) : `'${id}'`;
  }
}
