import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@hexa/appointments-domain': fileURLToPath(
        new URL('./libs/appointments/domain/src/index.ts', import.meta.url),
      ),
      '@hexa/appointments-ports': fileURLToPath(
        new URL('./libs/appointments/ports/src/index.ts', import.meta.url),
      ),
      '@hexa/appointments-infrastructure/memory': fileURLToPath(
        new URL(
          './libs/appointments/infrastructure/src/memory/index.ts',
          import.meta.url,
        ),
      ),
      '@hexa/appointments-infrastructure': fileURLToPath(
        new URL(
          './libs/appointments/infrastructure/src/index.ts',
          import.meta.url,
        ),
      ),
      '@hexa/appointments-state': fileURLToPath(
        new URL('./libs/appointments/state/src/index.ts', import.meta.url),
      ),
      '@hexa/appointments-ui': fileURLToPath(
        new URL('./libs/appointments/ui/src/index.ts', import.meta.url),
      ),
      '@hexa/appointments-feature': fileURLToPath(
        new URL('./libs/appointments/feature/src/index.ts', import.meta.url),
      ),
      '@hexa/appointments-shell/memory': fileURLToPath(
        new URL(
          './libs/appointments/shell/src/memory/index.ts',
          import.meta.url,
        ),
      ),
      '@hexa/appointments-shell': fileURLToPath(
        new URL('./libs/appointments/shell/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    setupFiles: [fileURLToPath(new URL('./vitest.setup.ts', import.meta.url))],
    // Component specs need the Angular AOT compiler for signal inputs, so the ui
    // and feature libraries run through `nx test <project>` (@nx/angular:unit-test).
    // `.claude/worktrees` holds full copies of the workspace; without this a
    // path filter like `libs/appointments/domain/src` matches them too and every
    // count is doubled against stale code.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.claude/**',
      'libs/appointments/ui/**',
      'libs/appointments/feature/**',
    ],
  },
});
