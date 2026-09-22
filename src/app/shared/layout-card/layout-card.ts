import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-layout-card',
  imports: [MatCardModule],
  templateUrl: './layout-card.html',
  styleUrl: './layout-card.scss',
})
export class LayoutCard {
  readonly contentPadding = input('16px');
  readonly contentOverflow = input<'auto' | 'hidden' | 'scroll' | 'visible'>('visible');
}
