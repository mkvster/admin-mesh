import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeState {
  private readonly document = inject(DOCUMENT);

  readonly isDark = signal(this.document.body.classList.contains('dark-theme'));

  toggle(): void {
    const isDark = !this.isDark();
    this.isDark.set(isDark);
    this.document.body.classList.toggle('dark-theme', isDark);
  }
}
