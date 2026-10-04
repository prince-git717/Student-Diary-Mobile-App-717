const path = require('node:path');
const { spawnSync } = require('node:child_process');

const isWindows = process.platform === 'win32';
const packageManager = isWindows ? 'pnpm.cmd' : 'pnpm';
const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: isWindows,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const projectDirectory = process.cwd();
run(
  packageManager,
  ['exec', 'expo', 'prebuild', '--platform', 'android', '--no-install'],
  projectDirectory,
);

run(
  isWindows ? 'gradlew.bat' : './gradlew',
  ['assembleRelease'],
  path.join(projectDirectory, 'android'),
);