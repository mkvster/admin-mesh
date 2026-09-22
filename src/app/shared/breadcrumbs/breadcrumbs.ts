import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { IconInfo } from '../icon-info';

export interface BreadcrumbItem {
  text: string;
  active: boolean;
  icon?: IconInfo;
  route?: string;
  onNavigate?: () => void;
}

@Component({
  selector: 'app-breadcrumbs',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss',
})
export class Breadcrumbs {
  readonly items = input.required<BreadcrumbItem[]>();

  private readonly router = inject(Router);

  protected navigate(event: MouseEvent, item: BreadcrumbItem): void {
    if (
      !item.route ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (item.onNavigate) {
      item.onNavigate();
    } else {
      void this.router.navigateByUrl(item.route);
    }
  }
}
