import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { EntityPreviewDialog, EntityPreviewDialogData } from './entity-preview-dialog';
import { FormMetadataStore } from '../form-metadata-store';
import { EntityApi } from '../entity-api';

describe('EntityPreviewDialog title', () => {
  let fixture: ComponentFixture<EntityPreviewDialog>;

  const baseData: EntityPreviewDialogData = {
    resource: 'payments',
    formId: 'view',
    id: 5001,
    singularTitle: 'Payment',
    icon: 'receipt',
  };

  async function setup(data: EntityPreviewDialogData, formMetadata: unknown) {
    await TestBed.configureTestingModule({
      imports: [EntityPreviewDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: FormMetadataStore, useValue: { get: () => of(formMetadata) } },
        { provide: EntityApi, useValue: { getEntity: () => of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityPreviewDialog);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function heading(): string {
    return fixture.nativeElement.querySelector('.preview-heading').textContent.trim();
  }

  it('uses the form layout title when provided', async () => {
    await setup(baseData, {
      fields: [],
      layout: { title: 'Payment Details', columns: 1, items: [] },
    });
    expect(heading()).toBe('Payment Details');
  });

  it('falls back to singularTitle plus the plain id for an integer id', async () => {
    await setup(baseData, { fields: [], layout: { columns: 1, items: [] } });
    expect(heading()).toBe('Payment 5001');
  });

  it('falls back to singularTitle plus the quoted id for a non-integer id', async () => {
    await setup(
      { ...baseData, id: 'PAY-83K21' },
      { fields: [], layout: { columns: 1, items: [] } },
    );
    expect(heading()).toBe("Payment 'PAY-83K21'");
  });
});
