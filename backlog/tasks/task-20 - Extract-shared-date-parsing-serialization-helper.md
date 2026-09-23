---
id: TASK-20
title: Extract shared date parsing/serialization helper
status: Done
assignee: []
created_date: '2026-09-22 15:35'
updated_date: '2026-09-22 16:22'
labels: []
milestone: s-003
dependencies: []
ordinal: 7750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
YYYY-MM-DD<->Date parsing and serialization logic is duplicated in list-grid.ts, entity-form.ts, date-filter-editor.ts, and entity-field-value.ts. Extract into a shared date-serialization util (alongside filter-serialization.ts/filter-normalization.ts) and have all four use it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A shared date parse/format util exists under entity/filtering or entity/
- [x] #2 list-grid.ts, entity-form.ts, date-filter-editor.ts, entity-field-value.ts use the shared util instead of local implementations
- [x] #3 No behavior change; existing tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented shared date parsing/serialization in entity/filtering/date-serialization.ts and migrated all four requested consumers. Validation: npm run verify passed (Prettier, Angular production build, 33 test files / 92 tests).
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Extracted shared date/datetime parsing and Date serialization, migrated list-grid, entity-form, date-filter-editor, and entity-field-value, and added focused unit tests. Verified with npm run verify.
<!-- SECTION:FINAL_SUMMARY:END -->
