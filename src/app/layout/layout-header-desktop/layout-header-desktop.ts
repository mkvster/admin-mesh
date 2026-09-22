import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Breadcrumbs, type BreadcrumbItem } from '../../shared/breadcrumbs/breadcrumbs';
import { ThemeState } from '../../shared/theme-state';
import { AdminToolbarState } from '../admin-layout/admin-toolbar-state';

@Component({
  selector: 'app-layout-header-desktop',
  imports: [
    RouterLink,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    Breadcrumbs,
  ],
  templateUrl: './layout-header-desktop.html',
  styleUrl: './layout-header-desktop.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutHeaderDesktop {
  readonly breadcrumbs = input.required<BreadcrumbItem[]>();
  readonly navigateHome = output<void>();

  protected readonly themeState = inject(ThemeState);
  protected readonly toolbarState = inject(AdminToolbarState);
}
