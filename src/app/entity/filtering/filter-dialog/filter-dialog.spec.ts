import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { describe, expect, it, vi } from 'vitest';
import { FilterDialog, FilterDialogData } from './filter-dialog';

const data: FilterDialogData = {
  scope: { resource: 'users', listId: 'default' },
  filters: [],
  fields: [
    { name: 'name', label: 'Name', type: 'string' },
    { name: 'internal', label: 'Internal', type: 'json' },
    { name: 'active', label: 'Active', type: 'boolean' },
  ],
};

describe('FilterDialog', () => {
  it('keeps only supported fields and starts with one draft row', async () => {
    await TestBed.configureTestingModule({
      imports: [FilterDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(FilterDialog);
    fixture.detectChanges();
    expect(fixture.componentInstance.filterableFields.map((field) => field.name)).toEqual([
      'name',
      'active',
    ]);
    expect(fixture.componentInstance.draft()).toHaveLength(1);
  });
});
