# In-memory services

An in-memory service implements the same application contract as a real service, but returns data kept in the application instead of calling an external API or database.

## Why use them in automated tests?

Tests should be fast, deterministic, and focused on the behaviour under test. An in-memory service helps because it:

- avoids starting a backend, configuring a database, or making network calls;
- returns known data, so assertions do not depend on shared or changing external state;
- can model useful cases directly, such as no appointments, one appointment, or a failed request;
- keeps unit and component tests quick enough to run frequently.

This lets a test verify that the UI displays appointments without also testing whether the API server is available.

## Why use them during manual development?

When manually checking a feature, a backend may be unfinished, offline, empty, or contain data that does not demonstrate the scenario being developed. An in-memory service gives developers stable sample data immediately.

It is useful for checking:

- page layout and appointment details;
- loading, empty, and error states;
- edge cases that would be inconvenient to create in a shared environment;
- a feature while working offline or before the API contract is ready.

Use the real service before release as well: the in-memory service validates the application's behaviour with controlled data, while the real service validates the integration with the API.

## Why not use a feature flag to select the service?

Feature flags are best for safely releasing or experimenting with user-facing product behaviour. Selecting an in-memory service or a production service is usually an application configuration concern instead: the choice determines where all data comes from, rather than which product behaviour a user sees.

Using a feature flag for this choice can create problems:

- the in-memory path may accidentally be enabled in a production environment, showing sample data instead of real data;
- each flag value creates another combination to test and support;
- the service choice can change at runtime, making a user's data source harder to reason about and diagnose;
- feature-flag infrastructure must be available before the application can determine how to obtain its data.

Prefer explicit test configuration for automated tests and explicit local or deployment configuration for manual development. This makes the selected data source visible at startup and keeps production integration separate from feature rollout decisions.

There can be exceptions, such as a short-lived internal demo or a carefully restricted support tool. In those cases, limit access, make the active data source obvious, and remove the flag when it is no longer needed.

## Select local data at build time

Keep production and local composition behind separate entry points. A secondary entry point is another import path into the same workspace library, so it can expose development composition without adding another Nx project.

For appointments, the two shell interfaces are:

```ts
// Production
import('@hexa/appointments-shell').then((m) => m.appointmentsRoutes({ apiBaseUrl }));

// Local memory build
import('@hexa/appointments-shell/memory').then((m) => m.appointmentsRoutes());
```

The build replaces the complete route module. It does not pass an `'api' | 'memory'` value into a module that imports both adapters. As a result, the production dependency graph has no path to the memory shell entry point, its adapter, or its fixtures.

Use the same pattern independently for another feature if it later needs a local adapter: give that feature its own `/memory` entry point and build-time route replacement. Do not introduce a global runtime data-source map, because doing so makes production import every selectable implementation.

## Switching implementations

Within each entry point, use dependency injection to provide the implementation behind the same port. Application behaviour depends on that port, not on the in-memory or HTTP adapter directly.

```ts
// Primary entry point
provideAppointmentsShell(httpAppointmentsProvider);

// /memory entry point
provideAppointmentsShell(inMemoryAppointmentsProvider);
```

The shared provider assembly is internal to the shell. Callers use only the route interface for their selected entry point, while the feature, state, and domain code remain unchanged.

The production build emits its module graph to `stats.json`. The `verify-production-bundle` target fails if either appointments `src/memory/` folder appears in that graph, turning the build-time separation into an enforced property rather than a convention.
