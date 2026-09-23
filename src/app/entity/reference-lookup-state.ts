import { Injectable, computed, signal } from '@angular/core';
import { FieldMetadata } from './entity-types';
import type { ReferenceLookupSelection } from './reference-lookup-view/reference-lookup-view';

export interface ReferenceLookupRequest {
  field: FieldMetadata;
  mode: 'single' | 'multiple';
  selectedValues: ReferenceLookupSelection[];
  complete: (selection: ReferenceLookupSelection[] | undefined) => void;
}

@Injectable({ providedIn: 'root' })
export class ReferenceLookupState {
  private readonly requestStack = signal<ReferenceLookupRequest[]>([]);
  readonly stack = this.requestStack.asReadonly();
  readonly request = computed(() => this.requestStack().at(-1) ?? null);
  private readonly displayValues = new Map<string, Map<string | number, string>>();

  open(request: ReferenceLookupRequest): void {
    this.requestStack.update((stack) => [...stack, request]);
  }

  close(result?: ReferenceLookupSelection[]): void {
    const request = this.requestStack().at(-1);
    if (!request) return;
    this.requestStack.update((stack) => stack.slice(0, -1));
    request.complete(result);
  }

  remember(field: FieldMetadata, selections: ReferenceLookupSelection[]): void {
    if (!field.reference) return;
    const key = `${field.reference.resource}:${field.reference.listId}:${field.name}`;
    const values = this.displayValues.get(key) ?? new Map<string | number, string>();
    for (const selection of selections) values.set(selection.id, selection.displayValue);
    this.displayValues.set(key, values);
  }

  displayValue(field: FieldMetadata, id: string | number): string | undefined {
    if (!field.reference) return undefined;
    return this.displayValues
      .get(`${field.reference.resource}:${field.reference.listId}:${field.name}`)
      ?.get(id);
  }
}
