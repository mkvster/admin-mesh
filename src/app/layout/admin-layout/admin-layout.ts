import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Navigation } from '../../navigation/navigation/navigation';
import { map } from 'rxjs';
import { NavigationState } from '../../navigation/navigation-state';

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

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 768px)').pipe(map(({ matches }) => matches)),
    { initialValue: false },
  );
}
