import { BreakpointObserver } from '@angular/cdk/layout';
import { Location } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Navigation } from '../../navigation/navigation/navigation';
import { filter, map } from 'rxjs';
import { NavigationState } from '../../navigation/navigation-state';
import { EntityListContextStore } from '../../entity/entity-list-context';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    Navigation,
  ],
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

  protected returnToList(): void {
    const match = this.currentUrl().match(/^\/node\/([^/]+)\/([^/]+)\/[^/?]+\/edit/);
    if (!match) return;
    const state = (this.location.getState() ?? {}) as { entityListContextToken?: unknown };
    const token =
      typeof state.entityListContextToken === 'string' ? state.entityListContextToken : undefined;
    const context = token ? this.listContext.peek(token) : undefined;
    this.router.navigateByUrl(context?.returnUrl ?? `/node/${match[1]}/${match[2]}`, {
      state: token ? { entityListContextToken: token } : undefined,
    });
  }

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 768px)').pipe(map(({ matches }) => matches)),
    { initialValue: false },
  );
}
