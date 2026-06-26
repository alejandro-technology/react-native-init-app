#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import chalk from "chalk";

import { runPrompt } from "./prompts/main.prompt.js";
import { App } from "./components/App.js";
import { LogoAnimation } from "./components/LogoAnimation.js";
import type { CommandType } from "../domain/command/command.model.js";

import { runCli } from "./cli/cli.js";

async function showIntroAnimation(): Promise<void> {
  if (!process.stdin.isTTY) {
    return;
  }
  process.stdout.write("\n".repeat(50));
  console.clear();

  return new Promise<void>((resolve) => {
    const { unmount } = render(
      <LogoAnimation
        onComplete={() => {
          unmount();
          process.stdout.write("\n".repeat(50));
          console.clear();
          
          // Let the event loop settle and let Ink complete its async cleanup before restoring stdin
          setTimeout(() => {
            if (process.stdin.isTTY) {
              process.stdin.ref();
              process.stdin.resume();
              try {
                process.stdin.read();
              } catch (e) {}
            }
            resolve();
          }, 100);
        }}
      />
    );
  });
}

async function main() {
  const args = process.argv.slice(2);
  const CLI_SUBCOMMANDS = new Set(["scaffold", "clean", "pod-install", "run-android", "version", "help"]);
  if (args.length > 0 && CLI_SUBCOMMANDS.has(args[0])) {
    await runCli(args);
    return; // runCli exits the process anyway
  }

  try {
    await showIntroAnimation();
    const { command, cleanOption, scaffoldData } = await runPrompt();

    // Clear screen before starting the Ink app
    process.stdout.write("\n".repeat(50));
    console.clear();

    const { unmount } = render(
      <App
        command={command as CommandType}
        cleanOption={cleanOption}
        scaffoldData={scaffoldData}
      />
    );

    // Ensure graceful exit on Ctrl+C
    process.on("SIGINT", () => {
      unmount();
      process.exit(0);
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "isCancel" in error &&
      (error as { isCancel?: boolean }).isCancel
    ) {
      console.log(chalk.yellow("\n❌ Cancelled by user"));
      process.exit(0);
    }
    console.error(chalk.red("\n❌ Error:"), error);
    process.exit(1);
  }
}

main();
