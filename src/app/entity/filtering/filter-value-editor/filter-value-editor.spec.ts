import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FilterValueEditor } from './filter-value-editor';

describe('FilterValueEditor', () => {
  let fixture: ComponentFixture<FilterValueEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FilterValueEditor] }).compileComponents();
    fixture = TestBed.createComponent(FilterValueEditor);
  });

  it('selects the editor matching the field type', () => {
    fixture.componentRef.setInput('field', { name: 'name', label: 'Name', type: 'string' });
    fixture.componentRef.setInput('operator', 'contains');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-string-filter-editor')).toBeTruthy();
  });
});
