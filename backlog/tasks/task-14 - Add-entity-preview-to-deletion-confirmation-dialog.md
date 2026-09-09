---
id: TASK-14
title: Add entity preview to deletion confirmation dialog
status: Done
assignee: []
created_date: '2026-09-05 18:55'
updated_date: '2026-09-08 22:06'
labels: []
milestone: s-002
dependencies:
  - TASK-9
type: enhancement
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Enhance the entity deletion confirmation dialog with a read-only preview of the entity being deleted. The current deletion flow from TASK-8 identifies the record only by its ID. After TASK-9 provides the reusable read-only entity details view, reuse its form metadata, entity loading, layout, and field rendering inside the deletion confirmation dialog. Load preview data only after the user starts the delete action; do not add a display-name field or extra per-row requests to list queries. Open one dialog immediately, show a loading state, then render the read-only details before confirming deletion. If the preview cannot be loaded, present an appropriate error and apply the defined safe ID-based fallback.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Starting a delete action opens the confirmation dialog immediately with the entity type and identifier, without loading preview data for every list row.
- [x] #2 The dialog loads form metadata and entity data only after the delete action starts, using the entity idField and the configured form projection.
- [x] #3 The dialog reuses the read-only entity details renderer from TASK-9 and displays a loading state while the preview is fetched.
- [x] #4 Cancel never sends a delete request, and deletion cannot be confirmed before the defined preview confirmation state is reached.
- [x] #5 Preview loading failures are presented to the user and handled with the defined safe fallback or disabled-delete behavior; errors are not silently ignored.
- [x] #6 Automated tests cover loading, successful preview rendering, cancellation, confirmation, and preview-load failure.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extend the delete dialog data with the configured read-only form and render the shared EntityPreview for the selected entity. 2. Keep the dialog open during preview loading, enable deletion only after a successful preview, and surface missing/error states with a safe disabled-delete fallback. 3. Pass the entity form view from EntityList and configure the customer MSW mock to use the viewName form projection. 4. Add dialog behavior tests for loading, success, cancellation, confirmation, and preview failure; run formatting, unit tests, and production build.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented shared EntityPreview in the deletion dialog, passed the configured form view and entity id from EntityList, and configured the customer MSW mock with the viewName projection while preserving nameView compatibility. Validation passed: npx.cmd vitest run (29 files, 68 tests), npm.cmd run format:check, and npm.cmd run build.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Deletion confirmation now opens immediately with the entity identifier, loads the configured read-only preview on demand, and enables Delete only after a successful preview. Customer mock deletion uses the viewName form projection; cancel, loading, success, and failure behavior are covered by dialog tests. Verified with 29 Vitest files/68 tests, Prettier check, and production build.
<!-- SECTION:FINAL_SUMMARY:END -->
