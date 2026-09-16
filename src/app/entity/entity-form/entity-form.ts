import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCache } from '../../cache/admin-cache';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { EntityApi } from '../entity-api';
import { EntityMetadataStore } from '../entity-metadata-store';
import { EntityPreviewDataStore } from '../entity-preview-data-store';
import { FieldMetadataResolver } from '../field-metadata-resolver';
import { FormMetadataStore } from '../form-metadata-store';
import { EntityFieldValue } from '../entity-field-value/entity-field-value';
import { StringValueInput } from '../field-editors/string-value-input/string-value-input';
import { ErrorState } from '../../shared/error-state/error-state';
import { EntityFormMode, FieldMetadata, FormLayoutItem, FormMetadata } from '../entity-types';

type FormState =
  | { status: 'loading' }
  | { status: 'ready'; metadata: FormMetadata; entity: Record<string, unknown> }
  | { status: 'error'; cause: unknown };

@Component({
  selector: 'app-entity-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    StringValueInput,
    EntityFieldValue,
    ErrorState,
  ],
  templateUrl: './entity-form.html',
  styleUrl: './entity-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityForm {
  readonly resource = input.required<string>();
  readonly formId = input.required<string>();
  readonly mode = input.required<EntityFormMode>();
  readonly id = input<string | number>();
  readonly saved = output<Record<string, unknown>>();
  readonly cancelled = output<void>();

  private readonly api = inject(EntityApi);
  private readonly entityMetadataStore = inject(EntityMetadataStore);
  private readonly formMetadataStore = inject(FormMetadataStore);
  private readonly previewDataStore = inject(EntityPreviewDataStore);
  private readonly fieldMetadataResolver = inject(FieldMetadataResolver);
  private readonly cache = inject(AdminCache);
  readonly referenceOptions = signal<Record<string, { value: string | number; label: string }[]>>(
    {},
  );
  readonly saving = computed(() => this.saveState() === 'saving');
  readonly errorMessage = computed(() =>
    this.saveState() === 'error' ? 'Unable to save this entity.' : null,
  );
  private readonly saveState = signal<'idle' | 'saving' | 'error'>('idle');

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
          this.mode() === 'create' || id === undefined
            ? of({} as Record<string, unknown>)
            : this.previewDataStore.get(resource, id, formId),
        ]).pipe(
          map(
            ([entityMetadata, formMetadata, entity]) =>
              ({
                status: 'ready',
                metadata: {
                  ...formMetadata,
                  fields: this.fieldMetadataResolver.mergeFields(
                    entityMetadata.fields,
                    formMetadata.fields,
                  ),
                },
                entity,
              }) as FormState,
          ),
          startWith({ status: 'loading' } as FormState),
        ),
      ),
      catchError((cause: unknown) => of<FormState>({ status: 'error', cause })),
      startWith({ status: 'loading' } as FormState),
    ),
    { initialValue: { status: 'loading' } as FormState },
  );

  readonly form = new FormGroup<Record<string, FormControl<unknown>>>({});
  private initializedFor: FormState['status'] = 'loading';

  constructor() {
    effect(() => {
      const state = this.state();
      if (state.status !== 'ready' || this.mode() !== 'create') return;
      for (const field of state.metadata.fields) {
        if (field.type !== 'reference' || !field.reference || this.referenceOptions()[field.name])
          continue;
        this.api
          .queryList(field.reference.resource, field.reference.listId, { page: 1, pageSize: 100 })
          .subscribe({
            next: (result) => {
              const options = result.items.flatMap((item) => {
                const value = item[field.reference!.displayField];
                const id = item[field.name] ?? item['id'];
                return (typeof id === 'string' || typeof id === 'number') && value != null
                  ? [{ value: id, label: String(value) }]
                  : [];
              });
              this.referenceOptions.update((current) => ({ ...current, [field.name]: options }));
            },
            error: (cause: unknown) => console.error('Reference options loading failed', cause),
          });
      }
    });
  }

  protected readonly fields = computed(() => {
    const state = this.state();
    if (state.status !== 'ready') return [];
    const items =
      state.metadata.layout?.items ?? state.metadata.fields.map((field) => ({ field: field.name }));
    const fields = new Map(state.metadata.fields.map((field) => [field.name, field]));
    return items
      .map((item) => ({ item, field: fields.get(item.field) }))
      .filter((item): item is { item: FormLayoutItem; field: FieldMetadata } => !!item.field);
  });

  protected columns(): number {
    const state = this.state();
    return state.status === 'ready' ? (state.metadata.layout?.columns ?? 1) : 1;
  }

  protected control(field: FieldMetadata): FormControl<unknown> | undefined {
    return this.form.controls[field.name];
  }

  protected stringValue(field: FieldMetadata): string {
    const value = this.control(field)?.value;
    return typeof value === 'string' ? value : '';
  }

  protected onStringBlur(field: FieldMetadata): void {
    this.control(field)?.markAsTouched();
  }

  protected isEditable(field: FieldMetadata): boolean {
    return (
      this.mode() !== 'view' &&
      (['string', 'integer', 'decimal', 'boolean'].includes(field.type) ||
        (this.mode() === 'create' && field.type === 'reference')) &&
      !(this.mode() === 'edit' && field.readOnlyOnUpdate)
    );
  }

  protected inputType(field: FieldMetadata): 'text' | 'number' {
    return field.type === 'string' ? 'text' : 'number';
  }

  protected updateStringValue(field: FieldMetadata, value: string): void {
    const control = this.control(field);
    if (!control) return;
    control.setValue(value);
    control.markAsDirty();
    control.updateValueAndValidity();
  }

  protected submit(): void {
    if (this.state().status !== 'ready') return;
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    const state = this.state();
    if (state.status !== 'ready') return;
    const payload = { ...state.entity, ...this.form.getRawValue() };
    this.saveState.set('saving');
    const request =
      this.mode() === 'create'
        ? this.api.createEntity(this.resource(), payload, state.metadata.projection)
        : this.api.updateEntity(this.resource(), this.id()!, payload, state.metadata.projection);
    request.subscribe({
      next: (entity) => {
        this.cache.clearEntityPreviews();
        this.saveState.set('idle');
        this.saved.emit(entity);
      },
      error: (cause: unknown) => {
        console.error('Entity save failed', cause);
        this.saveState.set('error');
      },
    });
  }

  protected initializeForm(state: FormState): void {
    if (state.status !== 'ready' || this.initializedFor === 'ready') return;
    this.initializedFor = 'ready';
    for (const field of state.metadata.fields) {
      if (!this.isEditable(field)) continue;
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.pattern) {
        try {
          validators.push(Validators.pattern(field.pattern));
        } catch (cause) {
          console.error('Invalid field pattern', cause);
        }
      }
      const value = this.coerceValue(field, state.entity[field.name]);
      this.form.addControl(field.name, new FormControl(value, { validators, nonNullable: false }));
    }
  }

  private coerceValue(field: FieldMetadata, value: unknown): unknown {
    if (value == null) return field.type === 'boolean' ? false : null;
    if (field.type === 'integer') return Number.isFinite(Number(value)) ? Number(value) : null;
    if (field.type === 'decimal') return Number.isFinite(Number(value)) ? Number(value) : null;
    if (field.type === 'boolean') return value === true;
    return String(value);
  }
}
