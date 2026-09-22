---
id: TASK-20
title: Extract shared date parsing/serialization helper
status: To Do
assignee: []
created_date: '2026-09-22 15:35'
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
- [ ] #1 A shared date parse/format util exists under entity/filtering or entity/
- [ ] #2 list-grid.ts, entity-form.ts, date-filter-editor.ts, entity-field-value.ts use the shared util instead of local implementations
- [ ] #3 No behavior change; existing tests pass
<!-- AC:END -->
