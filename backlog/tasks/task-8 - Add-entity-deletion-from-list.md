---
id: TASK-8
title: Add entity deletion from list
status: In Progress
assignee: []
created_date: '2026-09-04 13:06'
updated_date: '2026-09-05 16:31'
labels: []
milestone: s-002
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement entity deletion as the first CRUD operation for `rest-entity` lists.

The feature should work end-to-end through the existing AdminMesh metadata, list UI, Admin API, and mock API.

### UI

Add a delete action for each row in the entity list.

The delete action should only be available when:

`metadata.permissions.delete === true`

Deleting should use the entity identifier defined by `metadata.idField`.

Do not assume a specific ID field name such as `id` or `customerId`.

### Confirmation

Before sending the delete request, show a confirmation dialog.

The dialog should clearly state that the action is destructive and, where possible, identify the entity being deleted.

Provide:

* `Delete`
* `Cancel`

No request should be sent when the user cancels.

### Admin API

Use:

`DELETE /entities/{resource}/{id}`

A successful delete may return `204 No Content`.

### List refresh

After a successful delete:

* reload the current list query;
* preserve current sorting and filtering;
* preserve the current page when possible;
* if deleting the last item on the last page makes that page empty, move to the previous valid page;
* do not reload entity metadata or list metadata.

### Error handling

If deletion fails:

* keep the current list unchanged;
* show an error message to the user;
* do not silently remove the row from the UI.

### Mock API

Add support for:

`DELETE /entities/{resource}/{id}`

The mock implementation should remove the entity from the in-memory mock data so subsequent list queries reflect the deletion.

### Architecture

Keep deletion orchestration outside `ListGrid`.

`ListGrid` should expose a row/action event, while `EntityList` owns:

* permission checks;
* entity identity;
* confirmation;
* API call;
* list refresh.

This keeps `ListGrid` reusable for lookup lists and other non-editable list views.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
<!-- AC:END -->
