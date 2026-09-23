import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { defer, map, switchMap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { EntityApi } from '../entity-api';
import { EntityMetadataStore } from '../entity-metadata-store';
import { ListDataSource } from '../list-data-source';
import { EntityListQueryController } from '../entity-list-query-controller';
import { EntityListContent } from '../entity-list-content/entity-list-content';
import { EntityListUrlController } from '../entity-list-url-controller';
import { EntityListSavedRecordController } from '../entity-list-saved-record-controller';
import { EntityDeletionController } from '../entity-deletion-controller';
import { ListFilterEditingAdapter } from '../list-filter-editing-adapter';
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
import { ListGridRowAction, ListPageChange, ListSortChange } from '../list-grid/list-grid';
import { FilterDialog } from '../filtering/filter-dialog/filter-dialog';
import { MAX_SERIALIZED_FILTER_LENGTH } from '../filtering/filter-constraints';
import { serializeListFilter } from '../filtering/filter-serialization';
import { ErrorState } from '../../shared/error-state/error-state';
import { AsyncErrorHandler } from '../../shared/async-error-handler';
import { EntityForm } from '../entity-form/entity-form';
import { EntityListContextStore } from '../entity-list-context';
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

type EntityListStateLoaded = Extract<EntityListState, { status: 'loaded' }>;

@Component({
  selector: 'app-entity-list',
  imports: [MatProgressSpinnerModule, EntityListContent, FilterDialog, ErrorState, EntityForm],
  templateUrl: './entity-list.html',
  styleUrl: './entity-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityList {
  readonly resource = input.required<string>();

  private readonly api = inject(EntityApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly deletionController = new EntityDeletionController({
    api: this.api,
    dialog: this.dialog,
  });
  private readonly asyncErrorHandler = inject(AsyncErrorHandler);
  private readonly toolbarState = inject(AdminToolbarState);
  private readonly entityMetadataStore = inject(EntityMetadataStore);
  private readonly listDataSource = inject(ListDataSource);
  private readonly listContext = inject(EntityListContextStore, { optional: true });

  private readonly routeQuery = new EntityListUrlController({
    resource: this.resource,
    route: this.route,
    router: this.router,
    metadataStore: this.entityMetadataStore,
    asyncErrorHandler: this.asyncErrorHandler,
    injector: this.injector,
  });
  private readonly listController = new EntityListQueryController<EntityListStateLoaded>({
    adapter: this.routeQuery,
    injector: this.injector,
    load: (query) => this.loadList(this.resource(), query),
    loadStateOptions: {
      isExpectedError: (cause) => cause instanceof HttpErrorResponse,
      onExpectedError: (cause) => console.error('Entity list loading failed', cause),
    },
  });
  private readonly filterEditingAdapter: ListFilterEditingAdapter = {
    editing: this.routeQuery.filterMode,
    open: () => this.routeQuery.openFilterEditor(),
    apply: (filters) => this.applyFilterValues(filters),
    cancel: () => this.routeQuery.closeFilterEditor(),
    clear: () => this.listController.clearFilters(),
  };

  readonly isListLoading = computed(() => this.listController.isLoading());
  readonly deletionError = this.deletionController.error;

  readonly state = computed<EntityListState>(() => {
    const current = this.listController.state();
    if (current.status === 'loaded') return current.data;
    if (current.status === 'loading') return current;
    return {
      status: 'error',
      message: 'Failed to load entity list',
      cause: current.cause,
    };
  });
  private readonly savedRecordController = new EntityListSavedRecordController({
    state: this.state,
    api: this.api,
    location: inject(Location),
    listContext: this.listContext,
    routeQuery: this.routeQuery,
    destroyRef: this.destroyRef,
    injector: this.injector,
  });
  readonly locateMessage = this.savedRecordController.locateMessage;
  readonly highlightedEntityId = this.savedRecordController.highlightedEntityId;
  protected readonly formMode = this.routeQuery.formMode;
  protected readonly filterMode = this.filterEditingAdapter.editing;
  protected readonly filterEditorData = computed(() => {
    const current = this.state();
    return current.status === 'loaded'
      ? {
          fields: current.listMetadata.fields,
          filters: current.filters,
          scope: { resource: current.resource, listId: current.metadata.views.list },
        }
      : null;
  });
  protected readonly formId = computed(() => {
    const current = this.state();
    return current.status === 'loaded'
      ? this.formMode() === 'create'
        ? (current.metadata.views.createForm ?? current.metadata.views.form)
        : current.metadata.views.form
      : null;
  });
  protected readonly formEntityId = this.routeQuery.formEntityId;
  private readonly filterEditor = viewChild(FilterDialog);

  constructor() {
    effect((onCleanup) => {
      const current = this.state();
      if (current.status !== 'loaded' || this.formMode()) {
        this.toolbarState.clearActions();
        return;
      }

      if (this.filterMode()) {
        const actions: AdminToolbarActions = {
          filterEditing: true,
          addLabel: `Add ${current.metadata.singularTitle}`,
          canAdd: false,
          filterCount: current.filters.length,
          add: () => undefined,
          editFilters: () => undefined,
          clearFilters: () => this.clearFilters(),
          addFilter: () => this.filterEditor()?.addFilter(),
        };
        this.toolbarState.setActions(actions);
        onCleanup(() => this.toolbarState.clearActions(actions));
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

  protected findSavedRecord(): void {
    this.savedRecordController.findSavedRecord();
  }

  protected dismissLocateMessage(): void {
    this.savedRecordController.dismissLocateMessage();
  }

  protected onGridElement(element: HTMLElement): void {
    this.savedRecordController.setGridElement(element);
  }

  private loadList(resource: string, query: ListQuery) {
    return this.entityMetadataStore.get(resource).pipe(
      switchMap((metadata) => {
        const listId = metadata.views.list;
        this.routeQuery.ensurePagingParams(query);
        return defer(() => this.listDataSource.load(resource, listId, query)).pipe(
          map((list) => {
            this.routeQuery.ensureValidPage(query, list.result);
            return {
              status: 'loaded',
              resource,
              metadata: list.entityMetadata,
              listMetadata: list.metadata,
              data: list.result,
              page: query.page,
              pageSize: query.pageSize,
              sort: query.sort ?? [],
              filters: query.filter?.items ?? [],
            } satisfies EntityListStateLoaded;
          }),
        );
      }),
    );
  }

  protected onPageChange(event: ListPageChange): void {
    this.listController.setPage(event);
  }

  protected onSortChange(event: ListSortChange): void {
    this.listController.setSort(event);
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
    const contextToken = this.savedRecordController.rememberContext(
      this.routeQuery.currentUrl(),
      this.savedRecordController.scrollTop(),
    );
    this.routeQuery.openEdit(id, contextToken);
  }

  private openForm(mode: 'edit' | 'create', id?: string | number): void {
    this.routeQuery.openForm(mode, id);
  }

  protected closeForm(): void {
    this.routeQuery.closeForm();
  }

  protected onFormSaved(entity: Record<string, unknown>): void {
    const current = this.state();
    if (current.status === 'loaded') {
      const id = entity[current.metadata.idField];
      if (typeof id === 'string' || typeof id === 'number') {
        this.savedRecordController.recordSaved(id);
      }
    }
    this.closeForm();
    this.listController.refresh();
  }

  private openDeleteConfirmation(
    state: Extract<EntityListState, { status: 'loaded' }>,
    row: Record<string, unknown>,
  ): void {
    const idValue = row[state.metadata.idField];
    this.deletionController.requestDelete(
      {
        resource: state.resource,
        formId: state.metadata.views.deleteForm,
        id: idValue,
        entityTitle: state.metadata.singularTitle,
      },
      () => {
        this.listController.refresh();
      },
    );
  }

  protected openFilters(state: Extract<EntityListState, { status: 'loaded' }>): void {
    if (state.status !== 'loaded') return;
    this.filterEditingAdapter.open();
  }

  protected applyFilters(filters: FilterItem[]): void {
    this.filterEditingAdapter.apply(filters);
  }

  private applyFilterValues(filters: FilterItem[]): void {
    const current = this.state();
    if (current.status !== 'loaded') return;
    const serializedFilter = filters.length
      ? serializeListFilter(filters, {
          resource: current.resource,
          listId: current.metadata.views.list,
        })
      : null;
    if (serializedFilter && serializedFilter.length > MAX_SERIALIZED_FILTER_LENGTH) return;
    this.listController.setFilters(filters);
  }

  protected cancelFilterEdit(): void {
    this.filterEditingAdapter.cancel();
  }

  protected clearFilters(): void {
    this.filterEditingAdapter.clear();
  }
}
