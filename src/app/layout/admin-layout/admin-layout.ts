import { BreakpointObserver } from '@angular/cdk/layout';
import { Location } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { filter, map } from 'rxjs';

import { EntityListContextStore } from '../../entity/entity-list-context';
import { NavigationSelection, NavigationState } from '../../navigation/navigation-state';
import { Navigation } from '../../navigation/navigation/navigation';
import type { BreadcrumbItem } from '../../shared/breadcrumbs/breadcrumbs';
import { LayoutHeaderDesktop } from '../layout-header-desktop/layout-header-desktop';
import { LayoutHeaderMobile } from '../layout-header-mobile/layout-header-mobile';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, MatSidenavModule, Navigation, LayoutHeaderDesktop, LayoutHeaderMobile],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly breakpointObserver = inject(BreakpointObserver);
  protected readonly navigationState = inject(NavigationState);
  private readonly router = inject(Router);
  private readonly listContext = inject(EntityListContextStore);
  private readonly location = inject(Location);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly editEntityId = computed(() => {
    const match = this.currentUrl().match(/^\/node\/[^/]+\/[^/]+\/([^/?]+)\/edit(?:\?|$)/);
    return match ? decodeURIComponent(match[1]) : null;
  });

  private readonly isCreateMode = computed(
    () => this.router.parseUrl(this.currentUrl()).queryParams['entityMode'] === 'create',
  );
  private readonly isFilterMode = computed(
    () => this.router.parseUrl(this.currentUrl()).queryParams['filterMode'] === 'true',
  );

  protected breadcrumbs(mobile: boolean): BreadcrumbItem[] {
    const selected = this.navigationState.selected();
    const entityId = this.editEntityId();
    const isCreating = this.isCreateMode();
    const isFiltering = this.isFilterMode();
    const home: BreadcrumbItem = {
      text: 'Home',
      icon: { name: 'home' },
      active: selected === null,
      route: '/',
      onNavigate: () => this.navigateHome(),
    };

    if (!selected) return [home];

    const node: BreadcrumbItem = {
      text: selected.node.title,
      icon: selected.node.icon,
      active: entityId === null && !isCreating && !isFiltering,
      route: this.currentNodeUrl(selected),
      onNavigate: () => this.navigateToNode(selected),
    };
    const modeCrumb: BreadcrumbItem | null = entityId
      ? { text: entityId, active: true }
      : isCreating
        ? { text: 'Add', icon: { name: 'add' }, active: true }
        : isFiltering
          ? { text: 'Filter', icon: { name: 'filter_alt' }, active: true }
          : null;

    if (mobile) {
      return modeCrumb ? [node, modeCrumb] : [node];
    }

    const items: BreadcrumbItem[] = [home, { text: selected.section.title, active: false }, node];
    if (modeCrumb) items.push(modeCrumb);
    return items;
  }

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 768px)').pipe(map(({ matches }) => matches)),
    { initialValue: false },
  );

  private navigateHome(): void {
    this.navigationState.clear();
    void this.router.navigateByUrl('/');
  }

  private navigateToNode(selected: NavigationSelection): void {
    if (this.isFilterMode()) {
      void this.router.navigate([], {
        queryParams: { filterMode: null },
        queryParamsHandling: 'merge',
      });
      return;
    }
    if (this.editEntityId()) {
      this.returnToList();
      return;
    }

    this.navigationState.select(selected.section, selected.node);
    void this.router.navigateByUrl(this.currentNodeUrl(selected));
  }

  private currentNodeUrl(selected: NavigationSelection): string {
    return this.router.serializeUrl(
      this.router.createUrlTree(['/node', selected.section.id, selected.node.id]),
    );
  }

  private returnToList(): void {
    const match = this.currentUrl().match(/^\/node\/([^/]+)\/([^/]+)\/[^/?]+\/edit/);
    if (!match) return;
    const token = this.listContext.readToken(this.location);
    const context = token ? this.listContext.peek(token) : undefined;
    this.router.navigateByUrl(context?.returnUrl ?? `/node/${match[1]}/${match[2]}`, {
      state: token ? { entityListContextToken: token } : undefined,
    });
  }
}
