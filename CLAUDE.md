# hexa

An appointment-booking exercise whose deliverable is the _structure_, not the
feature. Three small business rules sit behind eight Nx libraries, and that ratio
is deliberate — advice that would be right on a product ("this is over-built for
what it does") is usually wrong here. What is genuinely under review is whether
the second feature reuses `domain`, `ports` and `application` as they stand.

## The rules are written down

[`docs/appointment-booking-business-requirements.md`](docs/appointment-booking-business-requirements.md)
states the three rules, the acceptance criteria, and — as load-bearing as the
rest — what this increment deliberately leaves out. Read it before adding
behaviour, not after.

It is the authority the rest of this file appeals to. The reasons it gives are
the specification: re-routing is a _predicate_ and the empty customer name is a
_filter_, and swapping one for the other changes the requirement rather than the
implementation. Nothing in the "Not included" list — booking, overlap checks,
opening hours, a named advisor — is an omission waiting to be helpfully filled
in.

The architecture review in the same folder is dated and has already been
superseded once. Prefer this file and the README for what is true now; read the
review for how the code got here.

## The API is not ours to bend

`server/db.json` and the json-server routes stand in for a backend owned by
another team. Treat them as if they were.

**Never reshape the API to suit the front-end.** When the domain wants a field
the API does not have, or wants two of its fields folded into one, that
translation belongs in
[`HttpAppointmentsAdapter`](libs/appointments/infrastructure/src/lib/http-appointments.adapter.ts).
Editing the server so the two shapes already agree deletes the reason the adapter
exists. This repository shipped that bug once: the domain type _was_ the wire
schema, and nothing caught it because both happened to have identical fields.

Off-limits without a stated change to
[the business requirements](docs/appointment-booking-business-requirements.md):

- renaming, adding, or removing a field so it matches the domain model;
- merging `date` and `startTime` because `Appointment` wants one `startsAt`;
- adding an endpoint because some component would be easier to write with it;
- moving a rule into the server to avoid implementing it in the domain.

**The line is contract versus content.** The _shape_ of the API belongs to the
other team. The _rows_ are demo fixtures, and may be edited, regenerated or
reseeded freely — moving an appointment to next Tuesday is fine, giving it a
`startsAt` is not.

When the API is genuinely wrong — it returns something no real backend should —
the answer is still not to quietly correct it at the source. Say so, and hold the
boundary in the adapter, which is where payloads are validated today.

## The Bruno collection follows the API, not the app

[`bruno/appointment-booking-api`](bruno/appointment-booking-api) documents what
the server does, independently of anything Angular. It is the same contract seen
from the other side, so the same rule holds: a request changes when the API
changes, never to match what a component would find convenient.

It must keep working. A request that returns nothing because the demo data moved
underneath it is a broken document, not a passing test — it describes an API that
no longer answers the way it claims. Fixture edits are allowed by the rule above,
so anything that reseeds `server/db.json` has to keep these requests answering
too.

## A test has to earn its place

The bar is not coverage. It is whether the test would catch a mistake someone
could plausibly make, and the way to find out is to **make that mistake**: break
the thing deliberately, watch the test go red, restore it. A test that stays
green through the bug it supposedly guards is worse than no test, because it
reads as protection.

Do not write:

- **provider-identity assertions** — asserting that a token resolves to the class
  the provider names restates configuration in a second language. It fails only
  when someone edits both files, and passes when the wiring is wrong in a way
  that matters;
- **tests for type-only code** — `libs/appointments/ports` is interfaces. The
  compiler already checks them, which is why that project has a `lint` target and
  no `test` target;
- **scaffolding in anticipation** — a second e2e assertion, a spec for a
  component nobody has broken yet. Wait for the bug that motivates it.

Do write the test that pins a decision someone would otherwise undo by accident —
the empty-`customerName` case is the model: it exists to stop `.min(1)` quietly
moving a business rule out of the domain.

## Traps that have already cost time here

**Vitest does not typecheck.** It transpiles, so a type error can sit in green
tests indefinitely. Two real ones this session: a structural fake `{ today: () =>
… }` kept compiling after the port renamed the method to `now()`, silently
returning `undefined`; and a `PropertyKey` reaching string interpolation. Lint
missed both too. After changing a signature, run:

```sh
npx nx run-many -t typecheck
```

Class-based fakes fail at compile time. Object literals fail at runtime, in a
test that looks fine.

**Typecheck has to run `tsconfig.spec.json`, not only `tsconfig.lib.json`.** The
lib config carries `"exclude": ["src/**/*.spec.ts", "src/**/*.test.ts"]`, so it
cannot see test code — and the structural-fake escape above lived in a spec.
Checked by putting that exact fake back: the lib config exits `0`, the spec
config reports `TS2353`. Both are still worth running, because the lib config
sets `"types": []` and would catch library code leaning on Vitest globals.

**`tsc --noEmit` does not check Angular templates.** `{{ appointment.nope }}`
passes every `typecheck` target and fails `npx nx build book`, because only the
AOT compiler reads the template. That is why the pre-push gate builds.

**An undeclared `lint` target is silently skipped.** `@nx/eslint` infers a target
named `eslint:lint`, which `nx run-many -t lint` does not match. Every project
needs `"lint": { "executor": "@nx/eslint:lint" }` in its `project.json`. Check the
project count in the output, not just that it passed. `typecheck` has the same
shape and no inference at all behind it: ten projects, ten explicit entries.

**An unknown key in `lefthook.yml` is dropped without a word.** `skip_empty:` is
not a v2 job key; lefthook parsed the file, discarded it and ran. `npx lefthook
dump` prints the config as lefthook actually understood it, which is the only
way to tell a key that took effect from a key that was ignored.

**A static import of a lazy library is a lint error on purpose.** Importing
`@hexa/appointments-shell` from `app.config.ts` pulls the whole feature into the
initial bundle. The production route dynamically imports the primary shell entry
point; the memory build replaces that route with one importing
`@hexa/appointments-shell/memory`. Do not replace those entry points with a
runtime data-source branch: it makes both adapters reachable by production.
`book:verify-production-bundle` enforces their separation from Angular's
`stats.json`. If lint refuses an import, that is usually the rule working.

**The workflow file has to pass the gate it defines.** `npx prettier --check .`
now covers `.github/workflows/*.yml`, and Prettier rewrites double-quoted YAML
scalars to single quotes — so `branches: ["main"]`, copied from GitHub's own
docs, fails the first stage of the workflow that contains it. Run `npx prettier
--check .` after editing it, not only after editing TypeScript.

**`includedScripts: []` in `package.json` is load-bearing.** Without it Nx infers
targets from `scripts`, so `npm test` (`nx run-many -t test`) finds a `test`
script and recurses.

**`.claude` is excluded in `vitest.config.mts`** because worktrees hold full
copies of the workspace, and a path filter would otherwise count stale code twice.

**json-server serves `db.json` from memory.** `git restore server/db.json` does
not reach a running server — restart it, or you will read a stale payload and
believe it.

## Documentation conventions

Numbers that describe current state rot silently, and a reader cannot tell a
stale one from a fresh one. Prefer the reason a number holds ("chained validators
hang off the schema instance, so a bundler cannot drop them") over the number
itself, and name the command that reprints it.

Every entry under **Deliberate trade-offs** in the README carries the condition
that should reverse it. A trade-off without a trigger is indistinguishable from
an oversight a year later.
