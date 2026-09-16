import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  catchError,
  combineLatest,
  defer,
  finalize,
  map,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EntityApi } from '../entity-api';
import { EntityMetadataStore } from '../entity-metadata-store';
import { ListMetadataStore } from '../list-metadata-store';
import { FieldMetadataResolver } from '../field-metadata-resolver';
import {
  EntityPreviewDialog,
  EntityPreviewDialogData,
} from '../entity-preview-dialog/entity-preview-dialog';

import {
  EntityMetadata,
  FilterItem,
  ListMetadata,
  ListRowAction,
  ListQuery,
  ListQueryResult,
  ListSort,
} from '../entity-types';
import {
  ListGrid,
  ListGridRowAction,
  ListPageChange,
  ListSortChange,
} from '../list-grid/list-grid';
import { FilterDialog } from '../filtering/filter-dialog/filter-dialog';
import {
  DeleteConfirmationDialog,
  DeleteConfirmationDialogData,
} from '../delete-confirmation-dialog/delete-confirmation-dialog';
import { MAX_SERIALIZED_FILTER_LENGTH } from '../filtering/filter-constraints';
import { parseListFilter, serializeListFilter } from '../filtering/filter-serialization';
import { ErrorState } from '../../shared/error-state/error-state';
import { AsyncErrorHandler } from '../../shared/async-error-handler';
import { EntityForm } from '../entity-form/entity-form';
import { EntityFormMode } from '../entity-types';
import { EntityListContextStore } from '../entity-list-context';
import { EntityLocateResult } from '../entity-types';
import {
  AdminToolbarActions,
  AdminToolbarState,
} from '../../layout/admin-layout/admin-toolbar-state';

type EntityListState =
  | { status: 'loading' }
  | {
      status: 'loaded';
      resource: string;
      metadata: EntityMetadata;
      listMetadata: ListMetadata;
      data: ListQueryResult;
      page: number;
      pageSize: number;
      sort: ListSort[];
      filters: FilterItem[];
    }
  | { status: 'error'; message: string; cause: unknown };

@Component({
  selector: 'app-entity-list',
  imports: [
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ListGrid,
    ErrorState,
    EntityForm,
  ],
  templateUrl: './entity-list.html',
  styleUrl: './entity-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityList {
  readonly resource = input.required<string>();

  private readonly api = inject(EntityApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly asyncErrorHandler = inject(AsyncErrorHandler);
  private readonly toolbarState = inject(AdminToolbarState);
  private readonly entityMetadataStore = inject(EntityMetadataStore);
  private readonly listMetadataStore = inject(ListMetadataStore);
  private readonly fieldMetadataResolver = inject(FieldMetadataResolver);
  private readonly listContext = inject(EntityListContextStore, { optional: true });
  private readonly location = inject(Location);
  private readonly listRefresh = new Subject<void>();
  private listRequestVersion = 0;

  readonly isListLoading = signal(true);
  readonly deletionError = signal<string | null>(null);
  readonly locateMessage = signal<string | null>(null);
  readonly highlightedEntityId = signal<string | number | null>(null);
  private readonly deletionInProgress = signal(false);

  readonly state = toSignal<EntityListState, EntityListState>(
    toObservable(this.resource).pipe(
      switchMap((resource) =>
        this.loadEntityList(resource).pipe(startWith({ status: 'loading' } as EntityListState)),
      ),
    ),
    {
      initialValue: { status: 'loading' } as EntityListState,
    },
  );

  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  protected readonly formMode = computed<EntityFormMode | null>(() => {
    const mode = this.queryParams().get('entityMode');
    return mode === 'create' ? mode : null;
  });
  protected readonly formId = computed(() => {
    const current = this.state();
    return current.status === 'loaded'
      ? this.formMode() === 'create'
        ? (current.metadata.views.createForm ?? current.metadata.views.form)
        : current.metadata.views.form
      : null;
  });
  protected readonly formEntityId = computed(() => this.queryParams().get('entityId') ?? undefined);
  private readonly listGrid = viewChild(ListGrid, { read: ElementRef });
  private readonly contextToken = this.readContextToken();
  private readonly savedEntityId = signal<string | number | null>(this.readSavedEntityId());
  private locateAttempted = false;

  constructor() {
    effect((onCleanup) => {
      const current = this.state();
      if (current.status !== 'loaded' || this.formMode()) {
        this.toolbarState.clearActions();
        return;
      }

      const actions: AdminToolbarActions = {
        addLabel: `Add ${current.metadata.singularTitle}`,
        canAdd: current.metadata.permissions.create,
        filterCount: current.filters.length,
        add: () => this.openCreateFromToolbar(),
        editFilters: () => this.openFiltersFromToolbar(),
        clearFilters: () => this.clearFilters(),
      };

      this.toolbarState.setActions(actions);
      onCleanup(() => this.toolbarState.clearActions(actions));
    });

    effect(() => {
      const current = this.state();
      const grid = this.listGrid();
      if (current.status !== 'loaded' || !grid) return;
      this.locateSavedEntity(current);

      const token = this.contextToken;
      const context = token ? this.listContext?.peek(token) : undefined;
      if (context && token) {
        queueMicrotask(() => {
          (grid.nativeElement.querySelector('.grid-layout') as HTMLElement | null)?.scrollTo({
            top: context.scrollTop,
          });
          this.listContext?.take(token);
        });
      }

      const highlightedId = this.highlightedEntityId();
      if (highlightedId !== null) {
        queueMicrotask(() => {
          const row = Array.from(
            grid.nativeElement.querySelectorAll('[data-entity-id]') as NodeListOf<HTMLElement>,
          ).find((element) => element.dataset['entityId'] === String(highlightedId));
          row?.scrollIntoView({ block: 'center' });
        });
      }
    });
  }

  private openCreateFromToolbar(): void {
    const current = this.state();
    if (current.status === 'loaded' && !this.formMode()) {
      this.openCreate(current);
    }
  }

  private openFiltersFromToolbar(): void {
    const current = this.state();
    if (current.status === 'loaded' && !this.formMode()) {
      this.openFilters(current);
    }
  }

  private locateSavedEntity(current: Extract<EntityListState, { status: 'loaded' }>): void {
    const id = this.savedEntityId();
    if (id === null || this.locateAttempted) return;
    this.locateAttempted = true;
    this.api
      .locateEntity(current.resource, current.metadata.views.list, {
        id,
        pageSize: current.pageSize,
        sort: current.sort,
        ...(current.filters.length ? { filter: { operator: 'and', items: current.filters } } : {}),
      })
      .subscribe({
        next: (located: EntityLocateResult) => {
          if (!located.found || located.page === null || located.result === null) {
            this.locateMessage.set(
              `${current.metadata.singularTitle} ${id} was saved, but it does not match the current filters.`,
            );
            return;
          }
          this.highlightedEntityId.set(id);
          if (located.page !== current.page) {
            this.asyncErrorHandler.run(
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { page: located.page },
                queryParamsHandling: 'merge',
              }),
              'Saved entity page navigation failed',
            );
          }
        },
        error: (cause: unknown) => {
          console.error('Saved entity locate failed', cause);
          this.locateMessage.set(
            `${current.metadata.singularTitle} ${id} was saved. Use Find saved record to locate it.`,
          );
        },
      });
  }

  protected findSavedRecord(): void {
    const current = this.state();
    const id = this.savedEntityId();
    if (current.status !== 'loaded' || id === null) return;
    const filter = serializeListFilter(
      [{ field: current.metadata.idField, operator: 'equals', value: id }],
      { resource: current.resource, listId: current.metadata.views.list },
    );
    this.asyncErrorHandler.run(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: 1, filter },
        queryParamsHandling: 'merge',
      }),
      'Saved entity search navigation failed',
    );
    this.locateMessage.set(null);
  }

  protected dismissLocateMessage(): void {
    this.locateMessage.set(null);
  }

  private loadEntityList(resource: string) {
    // Load entity metadata first, then load list metadata and initial data
    this.isListLoading.set(true);

    return this.entityMetadataStore.get(resource).pipe(
      switchMap((metadata) => this.loadList(resource, metadata)),
      catchError((error) => this.handleLoadError(error)),
    );
  }

  private loadList(resource: string, metadata: EntityMetadata) {
    const listId = metadata.views.list;

    return this.loadListMetadata(resource, listId).pipe(
      switchMap((listMetadata) => {
        const resolvedListMetadata: ListMetadata = {
          ...listMetadata,
          fields: this.fieldMetadataResolver.mergeFields(metadata.fields, listMetadata.fields),
        };

        return combineLatest([
          this.route.queryParamMap,
          this.listRefresh.pipe(startWith(undefined)),
        ]).pipe(
          map(([params]) => this.readListQuery(params, resource, listId)),
          tap((query) => this.ensurePagingParams(query)),
          switchMap((query) => {
            const requestVersion = ++this.listRequestVersion;
            this.isListLoading.set(true);

            return defer(() => this.api.queryList(resource, listId, query)).pipe(
              finalize(() => {
                if (requestVersion === this.listRequestVersion) {
                  this.isListLoading.set(false);
                }
              }),
              map((data) => {
                this.ensureValidPage(query, data);

                return {
                  status: 'loaded',
                  resource,
                  metadata,
                  listMetadata: resolvedListMetadata,
                  data,
                  page: query.page,
                  pageSize: query.pageSize,
                  sort: query.sort ?? [],
                  filters: query.filter?.items ?? [],
                } as EntityListState;
              }),
            );
          }),
        );
      }),
    );
  }

  private loadListMetadata(resource: string, listId: string) {
    return this.listMetadataStore.get(resource, listId);
  }

  protected onPageChange(event: ListPageChange): void {
    this.asyncErrorHandler.run(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: event,
        queryParamsHandling: 'merge',
      }),
      'Entity list page navigation failed',
    );
  }

  protected onSortChange(event: ListSortChange): void {
    this.asyncErrorHandler.run(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: 1,
          sort: this.serializeSort(event.sort),
          dir: null,
        },
        queryParamsHandling: 'merge',
      }),
      'Entity list sorting navigation failed',
    );
  }

  protected onRowAction(
    event: ListGridRowAction,
    state: Extract<EntityListState, { status: 'loaded' }>,
  ): void {
    if (event.action === 'edit' && event.id !== undefined) {
      this.openEdit(event.id);
    } else if (event.action === 'view-form' && event.formId && event.id !== undefined) {
      const rowAction = state.listMetadata.rowActions?.find(
        (action): action is ListRowAction =>
          action.type === 'view-form' && action.formId === event.formId,
      );

      if (!rowAction) {
        return;
      }

      this.dialog.open(EntityPreviewDialog, {
        width: 'fit-content',
        maxWidth: '95vw',
        maxHeight: 'calc(100vh - 24px)',
        data: {
          resource: state.resource,
          formId: event.formId,
          id: event.id,
          singularTitle: state.metadata.singularTitle,
          icon: rowAction.icon,
          iconSet: rowAction.iconSet,
          iconColor: rowAction.iconColor,
        } satisfies EntityPreviewDialogData,
      });
    } else if (event.action === 'delete' && state.metadata.permissions.delete) {
      this.openDeleteConfirmation(state, event.row);
    }
  }

  protected openCreate(state: Extract<EntityListState, { status: 'loaded' }>): void {
    if (!state.metadata.permissions.create || !this.formId()) return;
    this.openForm('create');
  }

  private openEdit(id: string | number): void {
    const grid = this.listGrid()?.nativeElement.querySelector('.grid-layout') as HTMLElement | null;
    const contextToken = this.createContextToken();
    this.listContext?.remember(contextToken, {
      returnUrl: this.router.url,
      scrollTop: grid?.scrollTop ?? 0,
    });
    this.asyncErrorHandler.run(
      this.router.navigate(['.', id, 'edit'], {
        relativeTo: this.route,
        queryParams: {},
        state: { entityListContextToken: contextToken },
      }),
      'Entity edit navigation failed',
    );
  }

  private openForm(mode: 'edit' | 'create', id?: string | number): void {
    this.asyncErrorHandler.run(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { entityMode: mode, entityId: id ?? null },
        queryParamsHandling: 'merge',
      }),
      'Entity form navigation failed',
    );
  }

  private readContextToken(): string | undefined {
    const state = (this.location.getState() ?? {}) as { entityListContextToken?: unknown };
    return typeof state.entityListContextToken === 'string'
      ? state.entityListContextToken
      : undefined;
  }

  private readSavedEntityId(): string | number | null {
    const state = (this.location.getState() ?? {}) as { savedEntityId?: unknown };
    return typeof state.savedEntityId === 'string' || typeof state.savedEntityId === 'number'
      ? state.savedEntityId
      : null;
  }

  private createContextToken(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  protected closeForm(): void {
    this.asyncErrorHandler.run(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { entityMode: null, entityId: null },
        queryParamsHandling: 'merge',
      }),
      'Entity form closing failed',
    );
  }

  protected onFormSaved(entity: Record<string, unknown>): void {
    const current = this.state();
    if (current.status === 'loaded') {
      const id = entity[current.metadata.idField];
      if (typeof id === 'string' || typeof id === 'number') {
        this.locateAttempted = false;
        this.locateMessage.set(null);
        this.highlightedEntityId.set(null);
        this.savedEntityId.set(id);
      }
    }
    this.closeForm();
    this.listRefresh.next();
  }

  private openDeleteConfirmation(
    state: Extract<EntityListState, { status: 'loaded' }>,
    row: Record<string, unknown>,
  ): void {
    if (this.deletionInProgress()) {
      return;
    }

    const idValue = row[state.metadata.idField];
    if (idValue === undefined || idValue === null) {
      this.deletionError.set(
        `Cannot delete ${state.metadata.singularTitle}: the row has no identifier.`,
      );
      return;
    }

    this.deletionError.set(null);
    const dialogData: DeleteConfirmationDialogData = {
      resource: state.resource,
      formId: state.metadata.views.deleteForm,
      id: idValue as string | number,
      entityTitle: state.metadata.singularTitle,
    };
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, { data: dialogData });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed === true) {
        this.deleteEntity(state.resource, idValue);
      }
    });
  }

  private deleteEntity(resource: string, id: unknown): void {
    if (typeof id !== 'string' && typeof id !== 'number') {
      this.deletionError.set('Cannot delete the selected row: its identifier is invalid.');
      return;
    }

    this.deletionInProgress.set(true);
    this.api.deleteEntity(resource, id).subscribe({
      next: () => {
        this.deletionError.set(null);
        this.listRefresh.next();
      },
      error: (error: unknown) => {
        console.error('Entity deletion failed', error);
        this.deletionError.set('Failed to delete the selected entity.');
        this.deletionInProgress.set(false);
      },
      complete: () => this.deletionInProgress.set(false),
    });
  }

  protected openFilters(state: Extract<EntityListState, { status: 'loaded' }>): void {
    const dialogRef = this.dialog.open(FilterDialog, {
      width: 'min(900px, 90vw)',
      maxWidth: '95vw',
      maxHeight: 'calc(100vh - 24px)',
      data: {
        fields: state.listMetadata.fields,
        filters: state.filters,
        scope: {
          resource: state.resource,
          listId: state.metadata.views.list,
        },
      },
    });

    dialogRef.afterClosed().subscribe((filters) => {
      if (filters === undefined) {
        return;
      }

      const serializedFilter = filters.length
        ? serializeListFilter(filters, {
            resource: state.resource,
            listId: state.metadata.views.list,
          })
        : null;

      if (serializedFilter && serializedFilter.length > MAX_SERIALIZED_FILTER_LENGTH) {
        return;
      }

      this.asyncErrorHandler.run(
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            page: 1,
            filter: serializedFilter,
            filters: null,
          },
          queryParamsHandling: 'merge',
        }),
        'Entity list filter navigation failed',
      );
    });
  }

  protected clearFilters(): void {
    this.asyncErrorHandler.run(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: 1,
          filter: null,
          filters: null,
        },
        queryParamsHandling: 'merge',
      }),
      'Entity list filter clearing navigation failed',
    );
  }

  private readListQuery(params: ParamMap, resource: string, listId: string): ListQuery {
    const page = this.readPositiveInt(params.get('page'), 1);
    const pageSize = this.readPositiveInt(params.get('pageSize'), 25);
    const sort = this.parseSort(params.get('sort'), params.get('dir'));
    const filters = parseListFilter(params.get('filter'), { resource, listId })?.items ?? [];

    return {
      page,
      pageSize,
      ...(sort.length ? { sort } : {}),
      ...(filters.length ? { filter: { operator: 'and', items: filters } } : {}),
    };
  }

  private parseSort(value: string | null, legacyDirection: string | null): ListSort[] {
    if (!value) {
      return [];
    }

    const parsed = value
      .split(',')
      .map((part) => {
        const [field, direction] = part.split(':');
        return field && (direction === 'asc' || direction === 'desc')
          ? { field, direction }
          : undefined;
      })
      .filter((item): item is ListSort => item !== undefined);

    // Keep links using the previous sort=field&dir=direction format working.
    if (
      parsed.length === 0 &&
      legacyDirection &&
      (legacyDirection === 'asc' || legacyDirection === 'desc')
    ) {
      return [{ field: value, direction: legacyDirection }];
    }

    return parsed;
  }

  private serializeSort(sort: ListSort[]): string | null {
    return sort.length ? sort.map((item) => `${item.field}:${item.direction}`).join(',') : null;
  }

  private readPositiveInt(value: string | null, fallback: number): number {
    const parsed = Number(value);

    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  private ensurePagingParams(query: ListQuery): void {
    const params = this.route.snapshot.queryParamMap;

    if (
      params.get('page') === String(query.page) &&
      params.get('pageSize') === String(query.pageSize)
    ) {
      return;
    }

    this.asyncErrorHandler.run(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: query.page,
          pageSize: query.pageSize,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
      'Entity list paging normalization failed',
    );
  }

  private ensureValidPage(query: ListQuery, data: ListQueryResult): void {
    if (query.page <= 1 || data.items.length > 0 || data.totalCount === 0) {
      return;
    }

    this.asyncErrorHandler.run(
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: query.page - 1 },
        queryParamsHandling: 'merge',
      }),
      'Entity list page correction failed',
    );
  }

  private handleLoadError(error: unknown) {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => error);
    }

    console.error('Entity list loading failed', error);
    this.isListLoading.set(false);

    return of<EntityListState>({
      status: 'error',
      message: 'Failed to load entity list',
      cause: error,
    });
  }
}
