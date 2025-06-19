import { exec } from 'child_process';
import { resolve } from 'path';
import chalk from 'chalk';

const ROOT_DIR = resolve(__dirname, '..');

function runTypeCheck() {
  console.log(chalk.cyan('Running type check...'));

  const command = process.platform === 'win32' 
    ? '.\\node_modules\\.bin\\tsc --noEmit'
    : './node_modules/.bin/tsc --noEmit';

  exec(command, { cwd: ROOT_DIR }, (error, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    if (error) {
      console.error(chalk.red('✗ Type check failed'));
      process.exit(1);
    } else {
      console.log(chalk.green('✓ Type check passed'));
      process.exit(0);
    }
  });
}

runTypeCheck(); 