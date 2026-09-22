---
id: TASK-22
title: Deduplicate entityListContextToken reading from Location state
status: To Do
assignee: []
created_date: '2026-09-22 15:41'
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
- [ ] #1 EntityListContextStore exposes a method to read the token from Location state
- [ ] #2 entity-list.ts, node-host.ts, admin-layout.ts use the shared method instead of local duplicated code
- [ ] #3 No behavior change; existing tests pass
<!-- AC:END -->
