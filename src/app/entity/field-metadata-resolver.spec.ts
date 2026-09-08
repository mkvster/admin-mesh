import { describe, expect, it } from 'vitest';
import { FieldMetadataResolver } from './field-metadata-resolver';

describe('FieldMetadataResolver', () => {
  it('replaces fields by name without merging properties and preserves entity positions', () => {
    const resolver = new FieldMetadataResolver();
    const fields = resolver.mergeFields(
      [
        { name: 'first', label: 'First', type: 'string' },
        {
          name: 'second',
          label: 'Second',
          type: 'string',
          display: { type: 'enum', style: 'label' },
        },
      ],
      [
        { name: 'second', label: 'Replacement', type: 'integer' },
        { name: 'third', label: 'Third', type: 'boolean' },
      ],
    );

    expect(fields).toEqual([
      { name: 'first', label: 'First', type: 'string' },
      { name: 'second', label: 'Replacement', type: 'integer' },
      { name: 'third', label: 'Third', type: 'boolean' },
    ]);
  });

  it('uses explicit order values while retaining stable order for ties', () => {
    const resolver = new FieldMetadataResolver();

    expect(
      resolver
        .mergeFields(
          [
            { name: 'a', label: 'A', type: 'string' },
            { name: 'b', label: 'B', type: 'string' },
          ],
          [
            { name: 'c', label: 'C', type: 'string', order: 0 },
            { name: 'b', label: 'B2', type: 'string', order: 2 },
          ],
        )
        .map((field) => field.name),
    ).toEqual(['c', 'a', 'b']);
  });
});
