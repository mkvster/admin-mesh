import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CdkOverlayOrigin, ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FieldMetadata } from '../../entity-types';
import { ReferenceLookupSelection } from '../../reference-lookup-view/reference-lookup-view';
import { ReferenceLookupState } from '../../reference-lookup-state';
import { ReferencePreviewOverlay } from '../../reference-preview-overlay/reference-preview-overlay';
import { HoverIntentTimer } from '../../hover-intent-timer';

@Component({
  selector: 'app-reference-value-input',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    OverlayModule,
    ReferencePreviewOverlay,
  ],
  templateUrl: './reference-value-input.html',
  styleUrl: './reference-value-input.scss',
  providers: [HoverIntentTimer],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceValueInput {
  readonly field = input.required<FieldMetadata>();
  readonly displayValue = input<string | null>(null);
  readonly hasValue = input(false);
  readonly selectedId = input<string | number | null>(null);
  readonly requiredError = input(false);
  readonly selectionChange = output<ReferenceLookupSelection | null>();
  private readonly lookup = inject(ReferenceLookupState);
  private readonly hoverIntentTimer = inject(HoverIntentTimer);
  protected readonly hasPreview = computed(() => {
    const display = this.field().display;
    return !this.lookup.request() && display?.type === 'reference' && !!display.previewForm;
  });
  protected readonly previewOpen = signal(false);
  protected readonly previewPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
  ];

  protected openLookup(): void {
    this.closePreview();
    const field = this.field();
    const selectedId = this.selectedId();
    this.lookup.open({
      field,
      mode: 'single',
      selectedValues:
        selectedId !== null && this.displayValue()
          ? [{ id: selectedId, displayValue: this.displayValue()! }]
          : [],
      complete: (selections) => {
        const selection = selections?.[0];
        if (selection) this.selectionChange.emit(selection);
      },
    });
  }

  protected clear(): void {
    this.selectionChange.emit(null);
  }

  protected openPreview(): void {
    if (!this.hasPreview() || this.selectedId() === null) return;
    this.hoverIntentTimer.clear();
    this.hoverIntentTimer.scheduleOpen(() => {
      this.previewOpen.set(true);
    });
  }

  protected onDisplayMouseMove(event: MouseEvent): void {
    const input = event.currentTarget as HTMLInputElement;
    const textWidth = Math.min(input.clientWidth, input.value.length * 9 + 24);
    if (event.offsetX <= textWidth) {
      this.openPreview();
    } else {
      this.hoverIntentTimer.clear();
      this.previewOpen.set(false);
    }
  }

  protected closePreview(): void {
    this.hoverIntentTimer.clear();
    this.previewOpen.set(false);
  }

  protected previewEnter(): void {
    this.hoverIntentTimer.clearClose();
  }

  protected previewLeave(): void {
    this.schedulePreviewClose();
  }

  protected previewResource(): string {
    return this.field().reference!.resource;
  }

  protected previewForm(): string {
    const display = this.field().display;
    return display?.type === 'reference' ? display.previewForm! : '';
  }

  private schedulePreviewClose(): void {
    this.hoverIntentTimer.scheduleClose(() => {
      this.previewOpen.set(false);
    });
  }
}
