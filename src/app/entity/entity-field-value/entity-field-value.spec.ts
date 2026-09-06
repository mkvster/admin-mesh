import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { EntityFieldValue } from './entity-field-value';

describe('EntityFieldValue', () => {
  let fixture: ComponentFixture<EntityFieldValue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EntityFieldValue] }).compileComponents();

    fixture = TestBed.createComponent(EntityFieldValue);
    fixture.componentRef.setInput('field', { name: 'name', label: 'Name', type: 'string' });
    await fixture.whenStable();
  });

  it('renders raw scalar values', () => {
    fixture.componentRef.setInput('value', 'Ada');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ada');
  });

  it('renders boolean text and checkbox styles', () => {
    fixture.componentRef.setInput('field', { name: 'active', label: 'Active', type: 'boolean' });
    fixture.componentRef.setInput('value', true);
    fixture.componentRef.setInput('display', { type: 'boolean', style: 'text' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Yes');

    fixture.componentRef.setInput('display', { type: 'boolean', style: 'checkbox' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-checkbox')).toBeTruthy();
  });

  it('renders enum labels when configured', () => {
    fixture.componentRef.setInput('field', {
      name: 'status',
      label: 'Status',
      type: 'enum',
      values: [{ value: 'active', label: 'Active' }],
    });
    fixture.componentRef.setInput('value', 'active');
    fixture.componentRef.setInput('display', { type: 'enum', style: 'label' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.enum-badge')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Active');
  });

  it('renders reference projections and falls back to the raw value', () => {
    fixture.componentRef.setInput('field', {
      name: 'categoryId',
      label: 'Category',
      type: 'reference',
    });
    fixture.componentRef.setInput('display', { type: 'reference', valueField: 'categoryName' });
    fixture.componentRef.setInput('value', 3);
    fixture.componentRef.setInput('row', { categoryId: 3, categoryName: 'Electronics' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.reference-link')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Electronics');
    expect(fixture.nativeElement.textContent).not.toContain('3');

    fixture.componentRef.setInput('row', { categoryId: 3, categoryName: '' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('3');
  });

  it('renders an empty value as empty', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
