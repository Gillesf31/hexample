import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const statsPath = fileURLToPath(
  new URL('../dist/apps/book/stats.json', import.meta.url),
);

let stats;

try {
  stats = JSON.parse(await readFile(statsPath, 'utf8'));
} catch (error) {
  console.error(`Cannot read the production build graph at ${statsPath}.`);
  console.error('Run the book production build with statsJson enabled first.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const inputs = Object.keys(stats.inputs ?? {}).map((path) =>
  path.replaceAll('\\', '/'),
);

if (inputs.length === 0) {
  console.error('The production build graph contains no input modules.');
  process.exit(1);
}

const requiredHttpAdapter =
  'libs/appointments/infrastructure/src/lib/http-appointments.adapter.ts';
const forbiddenMemoryRoots = [
  'libs/appointments/infrastructure/src/memory/',
  'libs/appointments/shell/src/memory/',
];

if (!inputs.some((path) => path.endsWith(requiredHttpAdapter))) {
  console.error(
    'The production build graph does not contain the HTTP adapter.',
  );
  process.exit(1);
}

const forbiddenInputs = inputs.filter((path) =>
  forbiddenMemoryRoots.some((root) => path.includes(root)),
);

if (forbiddenInputs.length > 0) {
  console.error(
    'The production build contains development-only memory modules:',
  );
  forbiddenInputs.forEach((path) => console.error(`- ${path}`));
  process.exit(1);
}

console.log(
  'Verified: the production build uses HTTP and excludes appointment memory entry points.',
);
