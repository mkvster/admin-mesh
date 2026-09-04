# Admin Mesh Rules

## Architecture and Source Structure

The project follows a vertical-slice architecture. Organize code by feature or functional area, not by technical type such as components, services, models, or utilities.

Components, templates, styles, tests, models, state, and services that belong to the same feature should be colocated within that feature's directory.

New files should be placed inside the feature they belong to. Do not create generic technical folders solely to group files of the same type.

When ownership of a file or the boundary of a feature is unclear, clarify it before making changes.

## Component Files

Each component should be placed in its own directory.

Components must use an external template file. An inline template is allowed only when the template contains no more than five lines.

Each component must have an external `.scss` stylesheet referenced by its component metadata. The stylesheet may be empty when the component currently requires no custom styles.

## API and HTTP

Components must not use `HttpClient` directly. HTTP requests should be encapsulated in feature-specific API services with explicitly typed request and response values.

## Error Handling

Errors must not be silently ignored.

Feature code is responsible for presenting expected errors in a user-appropriate way, including loading, empty, and error states where applicable.

Unexpected errors should preserve their original error value and remain observable for logging or diagnostics.

Global error handling should be limited to genuinely cross-cutting concerns, such as authentication failures, transport-level logging, or unhandled application errors.

## Testing

Use Vitest as the project's unit test framework. Do not use Jasmine APIs, Jasmine-specific types, or Karma-specific test configuration.

Test files must be colocated with the code under test and use the `.spec.ts` suffix.

Use Angular's `TestBed` when testing Angular dependency injection, components, directives, or pipes. Test pure functions and isolated logic without `TestBed` when possible.

Tests should verify observable behavior and public contracts rather than implementation details.

Tests must be deterministic and must not depend on live network services, execution order, or the current date and time unless those dependencies are explicitly controlled by the test.

When behavior changes or a bug is fixed, add or update tests that cover the changed behavior.

## CI/CD Workflows

GitHub Actions workflows must use action versions compatible with the currently supported Node.js runtime on GitHub-hosted runners.

Deprecated action runtimes must not be ignored. When GitHub announces the deprecation of an action runtime, the affected actions must be upgraded to compatible versions or replaced with supported alternatives.

The Node.js version used by the project and the Node.js runtime used internally by GitHub Actions are separate concerns. Updating the project's Node.js version does not update the runtime of third-party actions.

## Code Formatting and Verification

All source files must be formatted with Prettier using the repository configuration.

The project must provide npm scripts for checking and, when appropriate, applying formatting.

Formatting checks must run in CI.

Before considering a change complete, the relevant automated checks must pass, including the production build and unit tests.

CI checks must use the same commands and configuration as local development.
