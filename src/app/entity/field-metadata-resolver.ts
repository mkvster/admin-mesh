import { Injectable } from '@angular/core';
import { FieldMetadata } from './entity-types';

@Injectable({ providedIn: 'root' })
export class FieldMetadataResolver {
  mergeFields(entityFields: FieldMetadata[] = [], representationFields: FieldMetadata[] = []) {
    const resolved = entityFields.map((field) => ({
      field,
      sourceIndex: entityFields.indexOf(field),
    }));
    const indexesByName = new Map(resolved.map((item, index) => [item.field.name, index]));

    for (const field of representationFields) {
      const existingIndex = indexesByName.get(field.name);
      if (existingIndex === undefined) {
        indexesByName.set(field.name, resolved.length);
        resolved.push({ field, sourceIndex: resolved.length });
      } else {
        resolved[existingIndex] = { field, sourceIndex: resolved[existingIndex].sourceIndex };
      }
    }

    return resolved
      .map((item, index) => ({ ...item, resolvedIndex: index }))
      .sort((left, right) => {
        const leftOrder = left.field.order ?? left.sourceIndex;
        const rightOrder = right.field.order ?? right.sourceIndex;
        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        const leftHasExplicitOrder = left.field.order !== undefined;
        const rightHasExplicitOrder = right.field.order !== undefined;
        if (leftHasExplicitOrder !== rightHasExplicitOrder) {
          return leftHasExplicitOrder ? -1 : 1;
        }

        return left.resolvedIndex - right.resolvedIndex;
      })
      .map(({ field }) => field);
  }
}
