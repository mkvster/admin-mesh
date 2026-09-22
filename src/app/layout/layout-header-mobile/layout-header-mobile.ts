import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { Breadcrumbs, type BreadcrumbItem } from '../../shared/breadcrumbs/breadcrumbs';
import { ThemeState } from '../../shared/theme-state';
import type { AdminToolbarActions } from '../admin-layout/admin-toolbar-state';

@Component({
  selector: 'app-layout-header-mobile',
  imports: [
    RouterLink,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    Breadcrumbs,
  ],
  templateUrl: './layout-header-mobile.html',
  styleUrl: './layout-header-mobile.scss',
})
export class LayoutHeaderMobile {
  readonly breadcrumbs = input.required<BreadcrumbItem[]>();
  readonly actions = input<AdminToolbarActions | null>(null);
  readonly toggleSidenav = output<void>();
  readonly navigateHome = output<void>();

  protected readonly themeState = inject(ThemeState);
}
