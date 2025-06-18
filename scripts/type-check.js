const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue('🔍 Starting TypeScript type checking...'));

try {
  // Run TypeScript compiler in type checking mode
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  
  // Run Next.js type checking
  execSync('npx next build --no-lint', { stdio: 'inherit' });
  
  console.log(chalk.green('✅ TypeScript type checking completed successfully!'));
} catch (error) {
  console.error(chalk.red('❌ TypeScript type checking failed!'));
  process.exit(1);
} 