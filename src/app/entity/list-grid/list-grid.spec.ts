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

  it('renders a configured view action and emits the id from the configured id field', () => {
    const row = { customerId: 7, name: 'Ada' };
    const actions: unknown[] = [];
    component.rowAction.subscribe((action) => actions.push(action));
    fixture.componentRef.setInput('metadata', {
      fields: [{ name: 'name', label: 'Name', type: 'string' }],
      columns: [{ field: 'name' }],
      rowActions: [
        {
          type: 'view-form',
          formId: 'details',
          label: 'View',
          icon: 'pageview',
          iconSet: 'material-icons',
          iconColor: '#1565c0',
        },
      ],
    });
    fixture.componentRef.setInput('idField', 'customerId');
    fixture.componentRef.setInput('rows', [row]);
    fixture.componentRef.setInput('totalCount', 1);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.view-button').click();

    expect(actions).toEqual([{ action: 'view-form', formId: 'details', id: 7, row }]);
    const icon = fixture.nativeElement.querySelector('.view-button mat-icon');
    expect(icon.classList).toContain('material-icons');
    expect(icon.textContent.trim()).toBe('pageview');
    expect(icon.style.color).toBe('rgb(21, 101, 192)');
  });

  it('allocates one action-button width for each configured action', () => {
    fixture.componentRef.setInput('metadata', {
      fields: [{ name: 'name', label: 'Name', type: 'string' }],
      columns: [{ field: 'name' }],
      rowActions: [{ type: 'view-form', formId: 'details', icon: 'open' }],
    });
    fixture.componentRef.setInput('showDeleteAction', true);
    fixture.componentRef.setInput('rows', [{ id: 7, name: 'Ada' }]);
    fixture.componentRef.setInput('totalCount', 1);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.row-actions-column').style.width).toBe('112px');
  });
});
