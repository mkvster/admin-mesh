import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { EntityPreview } from '../entity-preview/entity-preview';
import { ENTITY_FIELD_VALUE_IN_POPUP } from '../entity-field-value/entity-field-value-context';

@Component({
  selector: 'app-reference-preview-overlay',
  imports: [EntityPreview, MatButtonModule],
  templateUrl: './reference-preview-overlay.html',
  styleUrl: './reference-preview-overlay.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: ENTITY_FIELD_VALUE_IN_POPUP, useValue: true }],
})
export class ReferencePreviewOverlay {
  readonly resource = input.required<string>();
  readonly formId = input.required<string>();
  readonly id = input.required<string | number>();
  readonly closed = output<void>();
}
