import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { EnumFilterEditor } from './enum-filter-editor';

describe('EnumFilterEditor', () => {
  let fixture: ComponentFixture<EnumFilterEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EnumFilterEditor] }).compileComponents();
    fixture = TestBed.createComponent(EnumFilterEditor);
    fixture.componentRef.setInput('field', {
      name: 'status',
      label: 'Status',
      type: 'enum',
      values: [{ value: 'active', label: 'Active' }],
    });
    fixture.componentRef.setInput('operator', 'equals');
    fixture.detectChanges();
  });

  it('renders the enum select', () => {
    expect(fixture.nativeElement.querySelector('mat-select')).toBeTruthy();
    expect(fixture.componentInstance.field().values).toEqual([
      { value: 'active', label: 'Active' },
    ]);
  });

  it('renders a multi-select for in', () => {
    fixture.componentRef.setInput('operator', 'in');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-select[multiple]')).toBeTruthy();
  });
});
