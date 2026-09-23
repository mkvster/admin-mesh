---
id: TASK-25
title: Replace URL regex parsing in AdminLayout with typed route state
status: Done
assignee: []
created_date: '2026-09-22 15:41'
updated_date: '2026-09-22 20:44'
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
- [x] #1 AdminLayout no longer parses the URL string with regex for editEntityId/isCreateMode/isFilterMode
- [x] #2 Equivalent state is derived via ActivatedRoute/route data or a shared service
- [x] #3 No behavior change; existing tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Inspect AdminLayout and NodeHost route-state derivation and identify the existing typed source. 2. Replace raw URL regex parsing in AdminLayout with the typed route state while preserving create/edit/filter behavior. 3. Add or update colocated tests for the public state behavior and run formatting, unit tests, and production build.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Validation passed: npm.cmd run verify completed successfully; Prettier check passed, production build passed, and 33 test files / 93 tests passed. Added AdminLayout regression coverage for a URL-encoded edit entity ID.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Replaced AdminLayout URL regex parsing with ActivatedRoute-backed route snapshots for edit entity IDs and create/filter query state; route-derived section and node IDs also preserve return-to-list behavior. Verified with npm.cmd run verify: formatting, production build, and 93 tests all passed.
<!-- SECTION:FINAL_SUMMARY:END -->
