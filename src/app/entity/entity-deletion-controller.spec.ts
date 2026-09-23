import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { EntityApi } from './entity-api';
import { EntityDeletionController } from './entity-deletion-controller';

const target = {
  resource: 'customers',
  formId: 'delete',
  id: 42,
  entityTitle: 'Customer',
};

function createController(confirmed: boolean, deleteEntity = vi.fn(() => of(undefined))) {
  const dialog = {
    open: vi.fn(() => ({ afterClosed: () => of(confirmed) })),
  } as unknown as MatDialog;
  const api = { deleteEntity } as unknown as EntityApi;

  return {
    controller: new EntityDeletionController({ api, dialog }),
    dialog,
    deleteEntity,
  };
}

describe('EntityDeletionController', () => {
  it('confirms and deletes a valid target, then calls the owner callback', () => {
    const { controller, dialog, deleteEntity } = createController(true);
    const onDeleted = vi.fn();

    controller.requestDelete(target, onDeleted);

    expect(dialog.open).toHaveBeenCalledOnce();
    expect(deleteEntity).toHaveBeenCalledWith('customers', 42);
    expect(onDeleted).toHaveBeenCalledOnce();
    expect(controller.error()).toBeNull();
    expect(controller.inProgress()).toBe(false);
  });

  it('does not delete when confirmation is cancelled', () => {
    const { controller, deleteEntity } = createController(false);

    controller.requestDelete(target, vi.fn());

    expect(deleteEntity).not.toHaveBeenCalled();
  });

  it('reports missing and invalid identifiers without opening or deleting', () => {
    const { controller, dialog, deleteEntity } = createController(true);

    controller.requestDelete({ ...target, id: undefined }, vi.fn());
    expect(controller.error()).toBe('Cannot delete Customer: the row has no identifier.');
    expect(dialog.open).not.toHaveBeenCalled();

    controller.requestDelete({ ...target, id: true }, vi.fn());
    expect(controller.error()).toBe('Cannot delete the selected row: its identifier is invalid.');
    expect(deleteEntity).not.toHaveBeenCalled();
  });

  it('reports API errors and resets progress', () => {
    const cause = new Error('failed');
    const deleteEntity = vi.fn(() => throwError(() => cause));
    const { controller } = createController(true, deleteEntity);

    controller.requestDelete(target, vi.fn());

    expect(controller.error()).toBe('Failed to delete the selected entity.');
    expect(controller.inProgress()).toBe(false);
  });
});
