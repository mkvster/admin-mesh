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

  it('renders a right-aligned compact page range and emits navigation changes', () => {
    const changes: unknown[] = [];
    component.pageChange.subscribe((change) => changes.push(change));
    fixture.componentRef.setInput('rows', [{ id: 1 }]);
    fixture.componentRef.setInput('totalCount', 25);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.page-range').textContent.trim()).toBe(
      '1–10 of 25',
    );
    expect(fixture.nativeElement.querySelector('mat-paginator')).toBeNull();
    expect(fixture.nativeElement.querySelector('.page-size-label').textContent.trim()).toBe('Rows');
    fixture.nativeElement.querySelector('[aria-label="Next page"]').click();

    expect(changes).toEqual([{ page: 2, pageSize: 10 }]);
  });

  it('emits a page-size change from the Rows selector', () => {
    const changes: unknown[] = [];
    component.pageChange.subscribe((change) => changes.push(change));
    fixture.componentRef.setInput('rows', [{ id: 21 }]);
    fixture.componentRef.setInput('totalCount', 25);
    fixture.componentRef.setInput('page', 3);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('.page-size-select');
    select.value = '25';
    select.dispatchEvent(new Event('change'));

    expect(changes).toEqual([{ page: 1, pageSize: 25 }]);
  });

  it('shows a page size from the URL even when it is not a preset option', () => {
    fixture.componentRef.setInput('rows', [{ id: 4 }]);
    fixture.componentRef.setInput('totalCount', 25);
    fixture.componentRef.setInput('page', 4);
    fixture.componentRef.setInput('pageSize', 1);
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('.page-size-select');
    expect(select.value).toBe('1');
  });

  it('caps an oversized page size before rendering the selector', () => {
    fixture.componentRef.setInput('rows', [{ id: 1 }]);
    fixture.componentRef.setInput('totalCount', 25);
    fixture.componentRef.setInput('pageSize', 79879879887987);
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('.page-size-select');
    expect(Array.from(select.options, (option) => option.value)).toContain('500');
    expect(select.value).toBe('500');
  });

  it('keeps an unsafe page number from producing a huge range', () => {
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('totalCount', 25);
    fixture.componentRef.setInput('page', 1.3495095095802959e31);
    fixture.componentRef.setInput('pageSize', 500);
    fixture.detectChanges();

    const range = fixture.nativeElement.querySelector('.page-range').textContent.trim();
    expect(range).not.toContain('e+');
    expect(range).toContain('25 of 25');
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

  it('uses a field display when the column has no local display', () => {
    fixture.componentRef.setInput('metadata', {
      fields: [
        {
          name: 'enabled',
          label: 'Enabled',
          type: 'boolean',
          display: { type: 'boolean', style: 'text' },
        },
      ],
      columns: [{ field: 'enabled' }],
    });
    fixture.componentRef.setInput('rows', [{ enabled: true }]);
    fixture.componentRef.setInput('totalCount', 1);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Yes');
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
