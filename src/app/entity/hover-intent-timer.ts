import { DestroyRef, Injectable, inject } from '@angular/core';

const OPEN_DELAY = 250;
const CLOSE_DELAY = 120;

@Injectable()
export class HoverIntentTimer {
  private readonly destroyRef = inject(DestroyRef);
  private openTimer: ReturnType<typeof setTimeout> | undefined;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => this.clear());
  }

  scheduleOpen(action: () => void): void {
    this.clearOpen();
    this.openTimer = setTimeout(() => {
      action();
      this.openTimer = undefined;
    }, OPEN_DELAY);
  }

  scheduleClose(action: () => void): void {
    this.clearClose();
    this.closeTimer = setTimeout(() => {
      action();
      this.closeTimer = undefined;
    }, CLOSE_DELAY);
  }

  clearOpen(): void {
    if (this.openTimer !== undefined) {
      clearTimeout(this.openTimer);
      this.openTimer = undefined;
    }
  }

  clearClose(): void {
    if (this.closeTimer !== undefined) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
  }

  clear(): void {
    this.clearOpen();
    this.clearClose();
  }
}
