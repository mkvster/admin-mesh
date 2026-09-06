import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ListGrid } from './list-grid';

describe('ListGrid', () => {
  let component: ListGrid;
  let fixture: ComponentFixture<ListGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(ListGrid);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('metadata', { fields: [], columns: [] });
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('totalCount', 0);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits a delete row action when delete actions are enabled', () => {
    const row = { customerId: 7, name: 'Ada' };
    const actions: unknown[] = [];
    component.rowAction.subscribe((action) => actions.push(action));
    fixture.componentRef.setInput('metadata', {
      fields: [
        { name: 'customerId', label: 'ID', type: 'integer' },
        { name: 'name', label: 'Name', type: 'string' },
      ],
      columns: [{ field: 'customerId' }, { field: 'name' }],
    });
    fixture.componentRef.setInput('rows', [row]);
    fixture.componentRef.setInput('totalCount', 1);
    fixture.componentRef.setInput('showDeleteAction', true);
    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector('.row-actions-cell .delete-button');
    deleteButton.click();

    expect(actions).toEqual([{ action: 'delete', row }]);
  });

  it('renders field values through the shared entity field value component', () => {
    fixture.componentRef.setInput('metadata', {
      fields: [{ name: 'name', label: 'Name', type: 'string' }],
      columns: [{ field: 'name' }],
    });
    fixture.componentRef.setInput('rows', [{ name: 'Ada' }]);
    fixture.componentRef.setInput('totalCount', 1);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-entity-field-value')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Ada');
  });
});
