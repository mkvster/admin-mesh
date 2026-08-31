import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationState } from '../navigation/navigation-state';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EntityList } from "../entity/entity-list";

@Component({
  selector: 'app-node-host',
  imports: [MatCardModule, MatIconModule, EntityList],
  templateUrl: './node-host.html',
  styleUrl: './node-host.scss',
})
export class NodeHost {
  private readonly route = inject(ActivatedRoute);
  private readonly state = inject(NavigationState);

  protected toString(value: unknown): string {
    return String(value);
  }

  private readonly params = toSignal(this.route.paramMap);
  
  protected readonly selection = computed(() => {
    const sectionId = this.params()?.get('sectionId');
    const nodeId = this.params()?.get('nodeId');

    if (!sectionId || !nodeId)
      return null;

    const section = this.state.navigation()
      .sections
      .find(s => s.id === sectionId);

    const node = section?.nodes.find(n => n.id === nodeId);

    return section && node
      ? { section, node }
      : null;
  });
    
  constructor() {
    effect(() => {
      const selected = this.selection();

      if (selected)
        this.state.select(selected.section, selected.node);
    });
  }
}
