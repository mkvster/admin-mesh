import { Component, computed, inject, signal } from '@angular/core';
import { NavigationState } from '../navigation/navigation-state';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatListModule, RouterLink],
})
export class Home {
  protected readonly state = inject(NavigationState);
  protected readonly search = signal('');

  protected readonly results = computed(() => {
    const text = this.search().trim().toLowerCase();

    if (!text) return [];

    return this.state
      .navigation()
      .sections.flatMap((section) =>
        section.nodes
          .filter(
            (node) =>
              section.title.toLowerCase().includes(text) || node.title.toLowerCase().includes(text),
          )
          .map((node) => ({ section, node })),
      );
  });
}
