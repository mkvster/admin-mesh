---
id: TASK-16
title: Add displayProfile-aware entity view selection
type: feature
status: To Do
assignee: []
created_date: '2026-09-06 23:32'
updated_date: '2026-09-06 23:40'
labels:
  - responsive
  - metadata
milestone: s-010
dependencies: []
references:
  - backlog/tasks/task-9 - Add-read-only-entity-details-view-from-form-metada.md
  - >-
    backlog/tasks/task-15 -
    Prepare-shared-entity-field-value-rendering-for-TASK-9.md
documentation:
  - docs/AdminApiProtocol.md
ordinal: 5750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Allow the client to request entity metadata with an optional displayProfile query parameter so the backend can select the appropriate named list and form for the current display context. The client determines the profile, includes it in the entity metadata request, and caches metadata separately per resource and profile. The returned metadata continues to provide the concrete list, form, and create-form identifiers selected for that profile. This task must not introduce a catalog of all list/form variants or implement navigation actions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The supported display profile values are defined as compact, regular, and wide.
- [ ] #2 The entity metadata request includes displayProfile as an optional query-string parameter when a profile is selected.
- [ ] #3 The backend contract and mock handlers select or return profile-appropriate list and form identifiers from the requested display profile.
- [ ] #4 Entity metadata caching distinguishes at least resource and display profile, preventing compact and wide metadata from sharing a cache entry.
- [ ] #5 The entity list uses the list identifier returned for the selected display profile and reloads the corresponding list metadata and data when the profile changes.
- [ ] #6 A missing display profile follows the defined server default behavior without requiring a duplicate list/form variant catalog in the client.
- [ ] #7 Automated tests cover profile serialization, metadata cache separation, profile-specific metadata responses, and list reload behavior.
- [ ] #8 The client derives the active display profile from the current viewport or responsive layout state and sends the corresponding value in metadata requests.
<!-- AC:END -->
