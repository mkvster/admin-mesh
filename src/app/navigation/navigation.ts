import { Component, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationState } from './navigation-state';
import { AdminNode, NavigationSection } from './navigation-types';
import { RouterLink } from '@angular/router';
import { ErrorState } from '../shared/error-state/error-state';
import { AsyncErrorHandler } from '../shared/async-error-handler/async-error-handler';

@Component({
  selector: 'app-navigation',
  imports: [
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    ErrorState,
  ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class Navigation {
  private readonly sidenav = inject(MatSidenav, { optional: true });
  private readonly asyncErrorHandler = inject(AsyncErrorHandler);
  protected readonly state = inject(NavigationState);

  protected isSelected(node: AdminNode): boolean {
    const selected = this.state.selected();
    return selected?.node.id === node.id;
  }
  protected select(section: NavigationSection, node: AdminNode): void {
    this.state.select(section, node);

    if (this.sidenav?.mode === 'over') {
      this.asyncErrorHandler.run(this.sidenav.close(), 'Navigation sidenav close failed');
    }
  }
}
