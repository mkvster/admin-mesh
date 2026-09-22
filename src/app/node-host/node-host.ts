import { Component, computed, effect, inject, Injector } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { NavigationState } from '../navigation/navigation-state';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EntityList } from '../entity/entity-list/entity-list';
import { ErrorState } from '../shared/error-state/error-state';
import { NotFoundState } from '../shared/not-found-state/not-found-state';
import { EntityForm } from '../entity/entity-form/entity-form';
import { EntityMetadataStore } from '../entity/entity-metadata-store';
import { EntityListContextStore } from '../entity/entity-list-context';
import { LayoutCard } from '../shared/layout-card/layout-card';
import { ReferenceLookupState } from '../entity/reference-lookup-state';
import { ReferenceLookupView } from '../entity/reference-lookup-view/reference-lookup-view';

@Component({
  selector: 'app-node-host',
  imports: [
    MatProgressSpinnerModule,
    EntityList,
    ErrorState,
    NotFoundState,
    EntityForm,
    LayoutCard,
    ReferenceLookupView,
  ],
  templateUrl: './node-host.html',
  styleUrl: './node-host.scss',
})
export class NodeHost {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly listContext = inject(EntityListContextStore);
  private readonly location = inject(Location);
  protected readonly state = inject(NavigationState);
  protected readonly referenceLookup = inject(ReferenceLookupState);

  protected toString(value: unknown): string {
    return String(value);
  }

  private readonly params = toSignal(this.route.paramMap);

  protected readonly selection = computed(() => {
    const sectionId = this.params()?.get('sectionId');
    const nodeId = this.params()?.get('nodeId');

    if (!sectionId || !nodeId) return null;

    const section = this.state.navigation().sections.find((s) => s.id === sectionId);

    const node = section?.nodes.find((n) => n.id === nodeId);

    return section && node ? { section, node } : null;
  });

  protected readonly entityId = computed(() => this.params()?.get('entityId'));
  protected readonly isEditRoute = computed(() => Boolean(this.entityId()));
  protected readonly editMetadata = toSignal(
    toObservable(this.selection).pipe(
      switchMap((selected) =>
        selected?.node.type === 'rest-entity'
          ? this.injector.get(EntityMetadataStore, null, { optional: true })
            ? this.injector
                .get(EntityMetadataStore, null, { optional: true })!
                .get(selected.node.config.resource)
            : of(null)
          : of(null),
      ),
    ),
    { initialValue: null },
  );
  constructor() {
    effect(() => {
      const selected = this.selection();

      if (selected) this.state.select(selected.section, selected.node);
    });
  }

  protected onEditSaved(entity: Record<string, unknown>): void {
    this.returnToList(entity);
  }

  protected onEditCancelled(): void {
    this.returnToList();
  }

  private returnToList(savedEntity?: Record<string, unknown>): void {
    const params = this.params();
    if (!params) return;

    const sectionId = params.get('sectionId');
    const nodeId = params.get('nodeId');
    if (!sectionId || !nodeId) return;

    const token = this.contextToken();
    const context = token ? this.listContext.peek(token) : undefined;
    this.router.navigateByUrl(context?.returnUrl ?? `/node/${sectionId}/${nodeId}`, {
      state: {
        ...(token ? { entityListContextToken: token } : {}),
        ...(savedEntity && this.editMetadata()
          ? { savedEntityId: savedEntity[this.editMetadata()!.idField] }
          : {}),
      },
    });
  }

  private contextToken(): string | undefined {
    const state = (this.location.getState() ?? {}) as { entityListContextToken?: unknown };
    return typeof state.entityListContextToken === 'string'
      ? state.entityListContextToken
      : undefined;
  }
}
