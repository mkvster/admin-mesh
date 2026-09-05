import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ListGridCell } from './list-grid-cell';

describe('ListGridCell', () => {
  let component: ListGridCell;
  let fixture: ComponentFixture<ListGridCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListGridCell],
    }).compileComponents();

    fixture = TestBed.createComponent(ListGridCell);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', { name: 'name', label: 'Name', type: 'string' });
    fixture.componentRef.setInput('column', { field: 'name' });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a reference projection value with link styling', () => {
    fixture.componentRef.setInput('field', {
      name: 'categoryId',
      label: 'Category',
      type: 'reference',
    });
    fixture.componentRef.setInput('column', {
      field: 'categoryId',
      display: { type: 'reference', valueField: 'categoryName' },
    });
    fixture.componentRef.setInput('value', 3);
    fixture.componentRef.setInput('row', {
      categoryId: 3,
      categoryName: 'Electronics',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.reference-link')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Electronics');
    expect(fixture.nativeElement.textContent).not.toContain('3');
  });

  it('falls back to the raw reference ID when the projection value is empty', () => {
    fixture.componentRef.setInput('field', {
      name: 'categoryId',
      label: 'Category',
      type: 'reference',
    });
    fixture.componentRef.setInput('column', {
      field: 'categoryId',
      display: { type: 'reference', valueField: 'categoryName' },
    });
    fixture.componentRef.setInput('value', 3);
    fixture.componentRef.setInput('row', {
      categoryId: 3,
      categoryName: '',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('3');
  });
});
