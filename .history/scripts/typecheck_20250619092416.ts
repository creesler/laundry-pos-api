import { spawn } from 'child_process';
import { resolve } from 'path';
import chalk from 'chalk';

const ROOT_DIR = resolve(__dirname, '..');

function runTypeCheck() {
  console.log(chalk.cyan('Running type check...'));

  const tscPath = resolve(ROOT_DIR, 'node_modules', '.bin', 'tsc');
  
  const tsc = spawn(tscPath, ['--noEmit'], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: true
  });

  tsc.on('exit', (code) => {
    if (code === 0) {
      console.log(chalk.green('✓ Type check passed'));
      process.exit(0);
    } else {
      console.error(chalk.red('✗ Type check failed'));
      process.exit(1);
    }
  });
}

runTypeCheck(); 