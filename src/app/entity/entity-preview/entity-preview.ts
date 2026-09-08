import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EntityApi } from '../entity-api';
import { EntityFieldValue } from '../entity-field-value/entity-field-value';
import { FormLayoutItem, FormMetadata } from '../entity-types';
import { FormMetadataStore } from '../form-metadata-store';
import { EntityMetadataStore } from '../entity-metadata-store';
import { FieldMetadataResolver } from '../field-metadata-resolver';

export type EntityPreviewState =
  | { status: 'loading' }
  | { status: 'loaded'; metadata: FormMetadata; entity: Record<string, unknown> }
  | { status: 'missing' }
  | { status: 'error'; cause: unknown };

@Component({
  selector: 'app-entity-preview',
  imports: [EntityFieldValue, MatProgressSpinnerModule],
  templateUrl: './entity-preview.html',
  styleUrl: './entity-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityPreview {
  readonly resource = input.required<string>();
  readonly formId = input.required<string>();
  readonly id = input.required<string | number>();

  private readonly api = inject(EntityApi);
  private readonly formMetadataStore = inject(FormMetadataStore);
  private readonly entityMetadataStore = inject(EntityMetadataStore);
  private readonly fieldMetadataResolver = inject(FieldMetadataResolver);

  readonly state = toSignal(
    combineLatest([
      toObservable(this.resource),
      toObservable(this.formId),
      toObservable(this.id),
    ]).pipe(
      switchMap(([resource, formId, id]) =>
        combineLatest([
          this.entityMetadataStore.get(resource),
          this.formMetadataStore.get(resource, formId),
        ]).pipe(
          switchMap(([entityMetadata, formMetadata]) => {
            const metadata: FormMetadata = {
              ...formMetadata,
              fields: this.fieldMetadataResolver.mergeFields(
                entityMetadata.fields,
                formMetadata.fields,
              ),
            };

            return this.api
              .getEntity(resource, id, metadata.projection)
              .pipe(
                map((entity) => ({ status: 'loaded', metadata, entity }) as EntityPreviewState),
              );
          }),
          catchError((cause: unknown) =>
            of<EntityPreviewState>(
              this.isMissingError(cause) ? { status: 'missing' } : { status: 'error', cause },
            ),
          ),
        ),
      ),
      startWith({ status: 'loading' } as EntityPreviewState),
    ),
    { initialValue: { status: 'loading' } as EntityPreviewState },
  );

  protected readonly fields = computed(() => {
    const state = this.state();
    if (state.status !== 'loaded') return [];
    const layout = state.metadata.layout;
    const items = layout?.items ?? state.metadata.fields.map((field) => ({ field: field.name }));
    const fieldMap = new Map(state.metadata.fields.map((field) => [field.name, field]));
    return items
      .map((item) => ({ item, field: fieldMap.get(item.field) }))
      .filter(
        (item): item is { item: FormLayoutItem; field: FormMetadata['fields'][number] } =>
          !!item.field,
      );
  });

  protected columns(state: Extract<EntityPreviewState, { status: 'loaded' }>): number {
    return state.metadata.layout?.columns ?? 1;
  }

  protected fieldClass(item: FormLayoutItem): string {
    return item.format ? `preview-field preview-field-${item.format}` : 'preview-field';
  }

  private isMissingError(error: unknown): boolean {
    return (
      (error instanceof HttpErrorResponse && error.status === 404) ||
      (typeof error === 'object' && error !== null && 'status' in error && error.status === 404)
    );
  }
}
