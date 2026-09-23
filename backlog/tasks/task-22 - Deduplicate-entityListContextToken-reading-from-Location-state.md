---
id: TASK-22
title: Deduplicate entityListContextToken reading from Location state
status: Done
assignee: []
created_date: '2026-09-22 15:41'
updated_date: '2026-09-22 16:41'
labels: []
milestone: s-003
dependencies: []
ordinal: 9750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Identical logic for reading entityListContextToken out of Location.getState() is duplicated in entity-list.ts, node-host.ts, and admin-layout.ts. Move it into EntityListContextStore as a readToken(location) method and use it in all three places.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 EntityListContextStore exposes a method to read the token from Location state
- [x] #2 entity-list.ts, node-host.ts, admin-layout.ts use the shared method instead of local duplicated code
- [x] #3 No behavior change; existing tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add shared token reader. 2. Replace local readers. 3. Verify.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

<!-- SECTION:FINAL_SUMMARY:END -->
