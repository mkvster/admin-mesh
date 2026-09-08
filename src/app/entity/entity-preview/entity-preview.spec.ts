import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityPreview } from './entity-preview';
import { EntityApi } from '../entity-api';
import { FormMetadataStore } from '../form-metadata-store';

describe('EntityPreview', () => {
  let fixture: ComponentFixture<EntityPreview>;
  let api: { getEntity: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { getEntity: vi.fn(() => of({ id: 7, name: 'Ada', enabled: true })) };
    await TestBed.configureTestingModule({
      imports: [EntityPreview],
      providers: [
        { provide: EntityApi, useValue: api },
        {
          provide: FormMetadataStore,
          useValue: {
            get: () =>
              of({
                projection: 'details',
                fields: [
                  { name: 'id', label: 'ID', type: 'integer' },
                  { name: 'name', label: 'Name', type: 'string' },
                  { name: 'enabled', label: 'Enabled', type: 'boolean' },
                ],
                layout: {
                  columns: 2,
                  items: [
                    { field: 'name', span: 2 },
                    {
                      field: 'enabled',
                      display: { type: 'boolean', style: 'text' },
                      hideLabel: true,
                    },
                  ],
                },
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityPreview);
    fixture.componentRef.setInput('resource', 'customers');
    fixture.componentRef.setInput('formId', 'view');
    fixture.componentRef.setInput('id', 7);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads the form projection and renders the layout fields', () => {
    expect(api.getEntity).toHaveBeenCalledWith('customers', 7, 'details');
    expect(fixture.nativeElement.textContent).toContain('Ada');
    expect(fixture.nativeElement.textContent).toContain('Yes');
    expect(
      fixture.nativeElement.querySelectorAll('.preview-field')[1].querySelector('dt'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.preview-field')).toHaveLength(2);
  });

  it('shows missing and error states', async () => {
    api.getEntity.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 404 })));
    fixture.componentRef.setInput('id', 8);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Entity not found');

    api.getEntity.mockReturnValueOnce(throwError(() => new Error('network')));
    fixture.componentRef.setInput('id', 9);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Unable to load');
  });
});

describe('EntityPreview field formats', () => {
  let fixture: ComponentFixture<EntityPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityPreview],
      providers: [
        { provide: EntityApi, useValue: { getEntity: () => of({ amount: 500, method: 'Card' }) } },
        {
          provide: FormMetadataStore,
          useValue: {
            get: () =>
              of({
                fields: [
                  { name: 'amount', label: 'Amount', type: 'decimal' },
                  { name: 'method', label: 'Method', type: 'string' },
                ],
                layout: {
                  columns: 2,
                  items: [
                    { field: 'amount', format: 'jumbo' },
                    { field: 'method', format: 'jumbo', hideLabel: true },
                  ],
                },
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityPreview);
    fixture.componentRef.setInput('resource', 'payments');
    fixture.componentRef.setInput('formId', 'view');
    fixture.componentRef.setInput('id', 5001);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('applies a format-specific class to the matching field only', () => {
    const rows = fixture.nativeElement.querySelectorAll('.preview-field');
    expect(rows[0].classList).toContain('preview-field-jumbo');
    expect(rows[1].classList).toContain('preview-field-jumbo');
  });

  it('still honors hideLabel on a formatted field', () => {
    const rows = fixture.nativeElement.querySelectorAll('.preview-field');
    expect(rows[0].querySelector('dt')?.textContent).toBe('Amount');
    expect(rows[1].querySelector('dt')).toBeNull();
  });
});
