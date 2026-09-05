See [docs/StdNgAiRules.md](docs/StdNgAiRules.md).
See [docs/AdminMeshRules.md](docs/AdminMeshRules.md).

<!-- BACKLOG.MD GUIDELINES START -->
<!-- backlog.md-instructions-version: 1.50.1 -->

<BACKLOG_INSTRUCTION>

## Backlog.md Workflow

This project uses Backlog.md for task and project management.

When a request involves creating, executing, updating, or finalizing a Backlog task, run backlog instructions overview first and follow the applicable workflow.

Before task lifecycle actions, read the matching detailed guide:

- `backlog instructions task-creation` before creating or splitting tasks
- `backlog instructions task-execution` before planning, changing status or assignee, adding a plan or implementation notes, or implementing task work
- `backlog instructions task-finalization` before checking acceptance criteria, writing final summaries, or moving tasks to terminal statuses

Use `backlog <command> --help` before running unfamiliar commands. Help shows options, fields, and examples.

Do not edit Backlog task, draft, document, decision, or milestone markdown files directly. Use the `backlog` CLI so metadata, relationships, and history stay consistent.

Do not modify a Backlog task unless the user explicitly asks for that change.

### Backlog task scope and mutation boundary

Mentioning a task ID defines only the scope and context of the work. It does not authorize modifying the Backlog task.

Do not change the task status, plan, notes, comments, acceptance criteria, or any other fields unless the user explicitly asks you to.

"Continue task-7" means work on the code within task-7's scope, not run `backlog task edit`.

### Task - Implementation Notes

Implementation Notes are not a history of every change made during implementation. Use them only when useful to record
the main implementation principles, architectural decisions, important constraints, or significant verification results
for the ticket. Keep them concise; they describe the implementation approach, not the full change log.

</BACKLOG_INSTRUCTION>
<!-- BACKLOG.MD GUIDELINES END -->
