import chalk from "chalk";
import type { ProgressCallback } from "../../domain/command/command.model.js";

export class CliLogger {
  constructor(private readonly jsonMode: boolean) {}

  onProgress: ProgressCallback = (step, total, message, log) => {
    if (this.jsonMode) {
      if (message) {
        process.stderr.write(`[${step}/${total}] ${message}\n`);
      }
      if (log) {
        process.stderr.write(log);
      }
      return;
    }

    if (message) {
      console.log(chalk.cyan(`[${step}/${total}] `) + chalk.bold(message));
    }
    if (log) {
      process.stdout.write(chalk.dim(log));
    }
  };

  onOutput = (chunk: string) => {
    if (this.jsonMode) {
      process.stderr.write(chunk);
    } else {
      process.stdout.write(chalk.dim(chunk));
    }
  };
}
