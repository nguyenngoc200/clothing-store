#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
// Attempt to load chalk in a way that supports both CJS and ESM builds.
let _chalk = null;
try {
  const chalkMod = require('chalk');
  _chalk = chalkMod && (chalkMod.default ?? chalkMod);
} catch (err) {
  // If chalk isn't available just fallback to plain text. Log the error to help debugging.
  console.debug('chalk load failed:', err);
  _chalk = null;
}

// Simple logging wrapper for the script. If chalk is unavailable, fall back to plain text.
const Logging = {
  log: (message) => console.log(message),
  error: (message) => console.error(_chalk ? _chalk.red(message) : message),
  warn: (message) => console.log(_chalk ? _chalk.yellow(message) : message),
  success: (message) => console.log(_chalk ? _chalk.green(message) : message),
  info: (message) => console.log(_chalk ? _chalk.blue(message) : message),
  header: (message) => console.log(_chalk ? _chalk.cyan(message) : message),
  critical: (message) => console.error(_chalk ? _chalk.red.bold(message) : message),
};

// Load environment variables from .env.local or .env
function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];

  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      Logging.info(`Loading environment from ${envFile}`);
      require('dotenv').config({ path: envPath });
      return;
    }
  }

  Logging.warn('No .env.local or .env file found, using system environment variables');
}

// Load environment variables
loadEnvFile();

const command = process.argv[2];
const runnerPath = path.join(__dirname, '../src/lib/migrations/runner.ts');

if (!command || !['up', 'down', 'status'].includes(command)) {
  Logging.error('Usage: npm run migrate:up | npm run migrate:down | npm run migrate:status');
  process.exit(1);
}

// Use tsx to run TypeScript directly
const child = spawn('npx', ['tsx', runnerPath, command], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env },
});

child.on('close', (code) => {
  process.exit(code);
});

child.on('error', (error) => {
  Logging.error('Failed to start migration process:');
  console.error(error);
  process.exit(1);
});
