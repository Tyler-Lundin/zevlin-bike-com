#!/usr/bin/env node

import { spawn } from "node:child_process";

const defaultPort = process.argv[2];
const port = process.env.PORT?.trim() || defaultPort;

if (!port) {
  console.error("PORT is required");
  process.exit(1);
}

const pnpmExecPath = process.env.npm_execpath;
const command = pnpmExecPath ? process.execPath : "pnpm";
const args = pnpmExecPath
  ? [pnpmExecPath, "exec", "next", "start", "-p", port]
  : ["exec", "next", "start", "-p", port];

const child = spawn(command, args, {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
