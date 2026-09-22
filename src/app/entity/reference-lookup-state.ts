import { Injectable, signal } from '@angular/core';
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
  readonly request = signal<ReferenceLookupRequest | null>(null);
  private readonly displayValues = new Map<string, Map<string | number, string>>();

  open(request: ReferenceLookupRequest): void {
    this.request.set(request);
  }

  close(result?: ReferenceLookupSelection[]): void {
    const request = this.request();
    if (!request) return;
    request.complete(result);
    this.request.set(null);
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
