import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
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
  private readonly destroyRef = inject(DestroyRef);
  private hoverTimer: ReturnType<typeof setTimeout> | undefined;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;
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

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimers());
  }

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
    this.clearTimers();
    this.hoverTimer = setTimeout(() => {
      this.previewOpen.set(true);
      this.hoverTimer = undefined;
    }, 250);
  }

  protected onDisplayMouseMove(event: MouseEvent): void {
    const input = event.currentTarget as HTMLInputElement;
    const textWidth = Math.min(input.clientWidth, input.value.length * 9 + 24);
    if (event.offsetX <= textWidth) {
      this.openPreview();
    } else {
      this.clearTimers();
      this.previewOpen.set(false);
    }
  }

  protected closePreview(): void {
    this.clearTimers();
    this.previewOpen.set(false);
  }

  protected previewEnter(): void {
    this.clearCloseTimer();
  }

  protected previewLeave(): void {
    this.scheduleClose();
  }

  protected previewResource(): string {
    return this.field().reference!.resource;
  }

  protected previewForm(): string {
    const display = this.field().display;
    return display?.type === 'reference' ? display.previewForm! : '';
  }

  private scheduleClose(): void {
    this.clearCloseTimer();
    this.closeTimer = setTimeout(() => {
      this.previewOpen.set(false);
      this.closeTimer = undefined;
    }, 120);
  }

  private clearCloseTimer(): void {
    if (this.closeTimer !== undefined) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
  }

  private clearTimers(): void {
    if (this.hoverTimer !== undefined) clearTimeout(this.hoverTimer);
    if (this.closeTimer !== undefined) clearTimeout(this.closeTimer);
    this.hoverTimer = undefined;
    this.closeTimer = undefined;
  }
}
