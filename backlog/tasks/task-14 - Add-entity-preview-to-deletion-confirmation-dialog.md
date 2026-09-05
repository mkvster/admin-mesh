---
id: TASK-14
title: Add entity preview to deletion confirmation dialog
status: To Do
assignee: []
created_date: '2026-09-05 18:55'
updated_date: '2026-09-05 18:55'
labels: []
milestone: s-002
dependencies:
  - TASK-9
type: enhancement
ordinal: 3750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Enhance the entity deletion confirmation dialog with a read-only preview of the entity being deleted. The current deletion flow from TASK-8 identifies the record only by its ID. After TASK-9 provides the reusable read-only entity details view, reuse its form metadata, entity loading, layout, and field rendering inside the deletion confirmation dialog. Load preview data only after the user starts the delete action; do not add a display-name field or extra per-row requests to list queries. Open one dialog immediately, show a loading state, then render the read-only details before confirming deletion. If the preview cannot be loaded, present an appropriate error and apply the defined safe ID-based fallback.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Starting a delete action opens the confirmation dialog immediately with the entity type and identifier, without loading preview data for every list row.
- [ ] #2 The dialog loads form metadata and entity data only after the delete action starts, using the entity idField and the configured form projection.
- [ ] #3 The dialog reuses the read-only entity details renderer from TASK-9 and displays a loading state while the preview is fetched.
- [ ] #4 Cancel never sends a delete request, and deletion cannot be confirmed before the defined preview confirmation state is reached.
- [ ] #5 Preview loading failures are presented to the user and handled with the defined safe fallback or disabled-delete behavior; errors are not silently ignored.
- [ ] #6 Automated tests cover loading, successful preview rendering, cancellation, confirmation, and preview-load failure.
<!-- AC:END -->
