import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { EntityApi } from '../entity-api';
import { EntityMetadataStore } from '../entity-metadata-store';
import { EntityPreviewDataStore } from '../entity-preview-data-store';
import { FieldMetadataResolver } from '../field-metadata-resolver';
import { FormMetadataStore } from '../form-metadata-store';
import { EntityFieldValue } from '../entity-field-value/entity-field-value';
import { StringValueInput } from '../field-editors/string-value-input/string-value-input';
import { DateValueInput } from '../field-editors/date-value-input/date-value-input';
import { EnumValueInput } from '../field-editors/enum-value-input/enum-value-input';
import { ReferenceValueInput } from '../field-editors/reference-value-input/reference-value-input';
import { ReferenceLookupSelection } from '../reference-lookup-view/reference-lookup-view';
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
    StringValueInput,
    DateValueInput,
    EnumValueInput,
    ReferenceValueInput,
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
  readonly saving = computed(() => this.saveState() === 'saving');
  readonly errorMessage = computed(() =>
    this.saveState() === 'error' ? 'Unable to save this entity.' : null,
  );
  private readonly saveState = signal<'idle' | 'saving' | 'error'>('idle');
  private readonly referenceDisplayOverrides = signal<Record<string, string | null>>({});

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

  protected dateValue(field: FieldMetadata): Date | null {
    const value = this.control(field)?.value;
    return value instanceof Date ? value : null;
  }

  protected referenceDisplayValue(
    field: FieldMetadata,
    entity: Record<string, unknown>,
  ): string | null {
    const overrides = this.referenceDisplayOverrides();
    if (Object.prototype.hasOwnProperty.call(overrides, field.name)) {
      return overrides[field.name] ?? null;
    }
    const display = field.display;
    const valueField =
      display?.type === 'reference' ? display.valueField : field.reference?.displayField;
    const value = valueField ? entity[valueField] : undefined;
    return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
  }

  protected referenceId(field: FieldMetadata): string | number | null {
    const value = this.control(field)?.value;
    return typeof value === 'string' || typeof value === 'number' ? value : null;
  }

  protected onStringBlur(field: FieldMetadata): void {
    this.control(field)?.markAsTouched();
  }

  protected isEditable(field: FieldMetadata): boolean {
    return (
      this.mode() !== 'view' &&
      (['string', 'integer', 'decimal', 'boolean', 'date', 'datetime', 'enum'].includes(
        field.type,
      ) ||
        (field.type === 'reference' && !!field.reference)) &&
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

  protected updateDateValue(field: FieldMetadata, value: Date): void {
    this.control(field)?.setValue(value);
    this.control(field)?.markAsDirty();
  }

  protected updateEnumValue(field: FieldMetadata, value: unknown): void {
    this.control(field)?.setValue(value);
    this.control(field)?.markAsDirty();
  }

  protected updateReferenceValue(
    field: FieldMetadata,
    selection: ReferenceLookupSelection | null,
  ): void {
    const control = this.control(field);
    if (!control) return;
    control.setValue(selection?.id ?? null);
    control.markAsDirty();
    control.markAsTouched();
    control.updateValueAndValidity();
    this.referenceDisplayOverrides.update((values) => {
      const next = { ...values };
      if (selection) next[field.name] = selection.displayValue;
      else next[field.name] = null;
      return next;
    });
  }

  protected submit(): void {
    if (this.state().status !== 'ready') return;
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    const state = this.state();
    if (state.status !== 'ready') return;
    const payload = { ...state.entity };
    for (const field of state.metadata.fields) {
      const value = this.form.controls[field.name]?.value;
      if (value === undefined) continue;
      payload[field.name] = this.serializeValue(field, value);
    }
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
    for (const field of state.metadata.fields) {
      if (!field.required) continue;
      const control = this.form.controls[field.name];
      if (
        control &&
        (control.value === null || control.value === undefined || control.value === '')
      ) {
        control.markAsTouched();
      }
    }
  }

  private coerceValue(field: FieldMetadata, value: unknown): unknown {
    if (value == null) return field.type === 'boolean' ? false : null;
    if (field.type === 'integer') return Number.isFinite(Number(value)) ? Number(value) : null;
    if (field.type === 'decimal') return Number.isFinite(Number(value)) ? Number(value) : null;
    if (field.type === 'boolean') return value === true;
    if (field.type === 'date' || field.type === 'datetime') {
      if (field.type === 'date' && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      const date = new Date(String(value));
      return Number.isNaN(date.getTime()) ? null : date;
    }
    if (field.type === 'enum') return value;
    if (field.type === 'reference') return value;
    return String(value);
  }

  private serializeValue(field: FieldMetadata, value: unknown): unknown {
    if (field.type === 'date' && value instanceof Date) {
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    }
    if (field.type === 'datetime' && value instanceof Date) return value.toISOString();
    return value;
  }
}
