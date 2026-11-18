import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const serverPath = fileURLToPath(
  new URL("../src/pages/Server/Server.js", import.meta.url)
);
const vitePath = fileURLToPath(
  new URL("../node_modules/vite/bin/vite.js", import.meta.url)
);
const children = [];
let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  children.forEach((child) => child.kill());
}

function start(name, args) {
  const child = spawn(
    process.execPath,
    ["--env-file-if-exists=.env.local", ...args],
    { stdio: "inherit" }
  );

  children.push(child);
  child.on("error", (error) => {
    console.error(`Could not start ${name}:`, error);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) {
      console.error(`${name} stopped. Shutting down the development app.`);
      stop(code || 1);
    }
  });

  return child;
}

process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());

start("Assistant API", [serverPath]);
start("Vite", [vitePath, ...process.argv.slice(2)]);
