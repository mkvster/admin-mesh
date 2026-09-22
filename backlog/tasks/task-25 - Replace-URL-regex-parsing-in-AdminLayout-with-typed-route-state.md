---
id: TASK-25
title: Replace URL regex parsing in AdminLayout with typed route state
status: To Do
assignee: []
created_date: '2026-09-22 15:41'
labels: []
milestone: s-003
dependencies: []
ordinal: 12750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
AdminLayout derives editEntityId/isCreateMode/isFilterMode by regex-matching the raw current URL string, duplicating logic that NodeHost already computes properly via ActivatedRoute. This is fragile to route structure changes. Replace with typed access via ActivatedRoute/route data or a shared service instead of URL regex parsing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 AdminLayout no longer parses the URL string with regex for editEntityId/isCreateMode/isFilterMode
- [ ] #2 Equivalent state is derived via ActivatedRoute/route data or a shared service
- [ ] #3 No behavior change; existing tests pass
<!-- AC:END -->
