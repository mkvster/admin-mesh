import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Breadcrumbs, type BreadcrumbItem } from '../../shared/breadcrumbs/breadcrumbs';
import { ThemeState } from '../../shared/theme-state';
import type { AdminToolbarActions } from '../admin-layout/admin-toolbar-state';

@Component({
  selector: 'app-layout-header-desktop',
  imports: [
    RouterLink,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    Breadcrumbs,
  ],
  templateUrl: './layout-header-desktop.html',
  styleUrl: './layout-header-desktop.scss',
})
export class LayoutHeaderDesktop {
  readonly breadcrumbs = input.required<BreadcrumbItem[]>();
  readonly actions = input<AdminToolbarActions | null>(null);
  readonly navigateHome = output<void>();

  protected readonly themeState = inject(ThemeState);
}
