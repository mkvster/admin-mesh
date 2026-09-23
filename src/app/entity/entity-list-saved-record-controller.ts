import { Location } from '@angular/common';
import { DestroyRef, effect, Injector, Signal, signal } from '@angular/core';

import { EntityApi } from './entity-api';
import { EntityListContextStore } from './entity-list-context';
import { EntityListUrlController } from './entity-list-url-controller';
import { EntityMetadata, FilterItem, ListSort } from './entity-types';

export interface EntityListSavedRecordState {
  readonly status: 'loaded';
  readonly resource: string;
  readonly metadata: EntityMetadata;
  readonly page: number;
  readonly pageSize: number;
  readonly sort: ListSort[];
  readonly filters: FilterItem[];
}

export interface EntityListSavedRecordControllerOptions {
  readonly state: Signal<EntityListSavedRecordState | { status: 'loading' | 'error' }>;
  readonly api: EntityApi;
  readonly location: Location;
  readonly listContext: EntityListContextStore | null;
  readonly routeQuery: EntityListUrlController;
  readonly destroyRef: DestroyRef;
  readonly injector: Injector;
}

export class EntityListSavedRecordController {
  readonly locateMessage = signal<string | null>(null);
  readonly highlightedEntityId = signal<string | number | null>(null);

  private readonly gridElement = signal<HTMLElement | null>(null);
  private readonly contextToken: string | undefined;
  private readonly savedEntityId = signal<string | number | null>(null);
  private locateAttempted = false;
  private locateMessageTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly options: EntityListSavedRecordControllerOptions) {
    this.contextToken = this.options.listContext?.readToken(this.options.location);
    this.savedEntityId.set(this.readSavedEntityId());
    this.options.destroyRef.onDestroy(() => this.clearLocateMessageTimer());

    effect(
      () => {
        const current = this.options.state();
        const grid = this.gridElement();
        if (current.status !== 'loaded' || !grid) return;

        this.locateSavedEntity(current);

        const token = this.contextToken;
        const context = token ? this.options.listContext?.peek(token) : undefined;
        if (context && token) {
          queueMicrotask(() => {
            grid.querySelector<HTMLElement>('.grid-layout')?.scrollTo({
              top: context.scrollTop,
            });
            this.options.listContext?.take(token);
          });
        }

        const highlightedId = this.highlightedEntityId();
        if (highlightedId !== null) {
          queueMicrotask(() => {
            const row = Array.from(grid.querySelectorAll<HTMLElement>('[data-entity-id]')).find(
              (element) => element.dataset['entityId'] === String(highlightedId),
            );
            row?.scrollIntoView({ block: 'center' });
          });
        }
      },
      { injector: this.options.injector },
    );
  }

  setGridElement(element: HTMLElement): void {
    this.gridElement.set(element);
  }

  scrollTop(): number {
    return this.gridElement()?.querySelector<HTMLElement>('.grid-layout')?.scrollTop ?? 0;
  }

  rememberContext(returnUrl: string, scrollTop: number): string {
    const token = this.createContextToken();
    this.options.listContext?.remember(token, { returnUrl, scrollTop });
    return token;
  }

  recordSaved(id: string | number): void {
    this.locateAttempted = false;
    this.locateMessage.set(null);
    this.highlightedEntityId.set(null);
    this.savedEntityId.set(id);
  }

  findSavedRecord(): void {
    const current = this.options.state();
    const id = this.savedEntityId();
    if (current.status !== 'loaded' || id === null) return;

    this.options.routeQuery.navigateToSavedRecord(current.resource, current.metadata, id);
    this.locateMessage.set(null);
  }

  dismissLocateMessage(): void {
    this.clearLocateMessageTimer();
    this.locateMessage.set(null);
  }

  private locateSavedEntity(current: EntityListSavedRecordState): void {
    const id = this.savedEntityId();
    if (id === null || this.locateAttempted) return;
    this.locateAttempted = true;

    this.options.api
      .locateEntity(current.resource, current.metadata.views.list, {
        id,
        pageSize: current.pageSize,
        sort: current.sort,
        ...(current.filters.length ? { filter: { operator: 'and', items: current.filters } } : {}),
      })
      .subscribe({
        next: (located) => {
          if (!located.found || located.page === null || located.result === null) {
            this.showLocateMessage(
              `${current.metadata.singularTitle} ${id} was saved, but it does not match the current filters.`,
            );
            return;
          }

          this.highlightedEntityId.set(id);
          if (located.page !== current.page) {
            this.options.routeQuery.navigateToPage(located.page);
          }
        },
        error: (cause: unknown) => {
          console.error('Saved entity locate failed', cause);
          this.showLocateMessage(
            `${current.metadata.singularTitle} ${id} was saved. Use Find saved record to locate it.`,
          );
        },
      });
  }

  private showLocateMessage(message: string): void {
    this.clearLocateMessageTimer();
    this.locateMessage.set(message);
    this.locateMessageTimer = setTimeout(() => {
      this.locateMessage.set(null);
      this.locateMessageTimer = undefined;
    }, 7000);
  }

  private clearLocateMessageTimer(): void {
    if (this.locateMessageTimer !== undefined) {
      clearTimeout(this.locateMessageTimer);
      this.locateMessageTimer = undefined;
    }
  }

  private readSavedEntityId(): string | number | null {
    const state = (this.options.location.getState() ?? {}) as { savedEntityId?: unknown };
    return typeof state.savedEntityId === 'string' || typeof state.savedEntityId === 'number'
      ? state.savedEntityId
      : null;
  }

  private createContextToken(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
