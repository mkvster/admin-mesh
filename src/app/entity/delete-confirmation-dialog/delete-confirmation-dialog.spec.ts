import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DeleteConfirmationDialog,
  DeleteConfirmationDialogData,
} from './delete-confirmation-dialog';
import { EntityApi } from '../entity-api';
import { EntityMetadataStore } from '../entity-metadata-store';
import { FormMetadataStore } from '../form-metadata-store';

describe('DeleteConfirmationDialog', () => {
  let fixture: ComponentFixture<DeleteConfirmationDialog>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  const data: DeleteConfirmationDialogData = {
    resource: 'customers',
    formId: 'viewName',
    id: 7,
    entityTitle: 'Customer',
  };

  async function setup(
    entityResult: Observable<Record<string, unknown>>,
    formId: string | null | undefined = data.formId,
  ) {
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [DeleteConfirmationDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { ...data, formId: formId ?? undefined } },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: EntityApi, useValue: { getEntity: () => entityResult } },
        { provide: EntityMetadataStore, useValue: { get: () => of({ fields: [] }) } },
        {
          provide: FormMetadataStore,
          useValue: {
            get: () =>
              of({
                projection: 'viewName',
                fields: [{ name: 'name', label: 'Name', type: 'string' }],
                layout: { columns: 1, items: [{ field: 'name' }] },
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteConfirmationDialog);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => TestBed.resetTestingModule());

  it('shows loading and prevents confirmation until the preview is loaded', async () => {
    await setup(NEVER);

    expect(fixture.nativeElement.querySelectorAll('.preview-skeleton')).not.toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.delete-button').disabled).toBe(true);

    fixture.nativeElement.querySelector('.delete-button').click();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('renders the preview and confirms only after a successful load', async () => {
    await setup(of({ name: 'Ada Lovelace' }));

    expect(fixture.nativeElement.querySelector('.dialog-heading').textContent.trim()).toBe(
      'Delete Customer 7?',
    );
    expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');
    const deleteButton = fixture.nativeElement.querySelector('.delete-button');
    expect(deleteButton.disabled).toBe(false);

    deleteButton.click();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('cancels without confirming deletion', async () => {
    await setup(of({ name: 'Ada Lovelace' }));

    fixture.nativeElement.querySelector('button:not(.delete-button)').click();

    expect(dialogRef.close).toHaveBeenCalledWith(false);
    expect(dialogRef.close).not.toHaveBeenCalledWith(true);
  });

  it('shows preview failures and keeps deletion disabled', async () => {
    await setup(throwError(() => new Error('preview failed')));

    expect(fixture.nativeElement.textContent).toContain('Unable to load this entity');
    expect(fixture.nativeElement.querySelector('.delete-button').disabled).toBe(true);

    fixture.nativeElement.querySelector('.delete-button').click();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('allows deletion without a preview when no delete form is configured', async () => {
    await setup(NEVER, null);

    expect(fixture.nativeElement.textContent).not.toContain('Unable to load this entity');
    expect(fixture.nativeElement.querySelector('.delete-button').disabled).toBe(false);

    fixture.nativeElement.querySelector('.delete-button').click();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
