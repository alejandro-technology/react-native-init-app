import { parseArgs, stripVTControlCharacters } from "node:util";
import { parseScaffoldArgs } from "./cli-parsers.js";
import { CliLogger } from "./cli-logger.js";
import { runScaffold } from "../commands/scaffold.handler.js";
import { runCommand } from "../../application/commands/run-command.use-case.js";
import { CLEAN_TARGETS } from "../../domain/constants.js";
import { VERSION_OUTPUT } from "../content/version.js";
import { HELP_OUTPUT } from "../content/help.js";
import type { CommandType } from "../../domain/command/command.model.js";

export async function runCli(args: string[]) {
  const commandArg = args[0] as CommandType;

  if (commandArg === "version") {
    console.log(VERSION_OUTPUT);
    process.exit(0);
  }

  if (commandArg === "help") {
    console.log(HELP_OUTPUT);
    process.exit(0);
  }

  // Parse args
  let parsed;
  try {
    parsed = parseArgs({
      args: args.slice(1),
      options: {
        name: { type: "string" },
        "bundle-id": { type: "string" },
        directory: { type: "string" },
        pm: { type: "string" },
        "install-deps": { type: "boolean" },
        "pod-install": { type: "boolean" },
        ai: { type: "string" },
        backend: { type: "string" },
        "firebase-modules": { type: "string" },
        target: { type: "string" }, // For clean command
        json: { type: "boolean" },
      },
      strict: false,
    });
  } catch (err) {
    console.error(`Invalid arguments: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(2);
  }

  const { values } = parsed;
  const jsonMode = Boolean(values.json);
  const logger = new CliLogger(jsonMode);

  try {
    let result: { success: boolean; output: string };

    if (commandArg === "scaffold") {
      const config = parseScaffoldArgs(values);
      result = await runScaffold(config, logger.onProgress, logger.onOutput);
    } else if (commandArg === "clean") {
      const target = values.target as string;
      if (!target) {
        throw new Error("Missing required flag: --target");
      }
      const cleanLabel = CLEAN_TARGETS[target.toLowerCase()];
      if (!cleanLabel) {
        throw new Error(
          `Invalid clean target: ${target}. Valid options: ${Object.keys(CLEAN_TARGETS).join(", ")}`,
        );
      }
      result = await runCommand("clean", cleanLabel, logger.onProgress);
    } else if (commandArg === "pod-install" || commandArg === "run-android") {
      result = await runCommand(commandArg, undefined, logger.onProgress);
    } else {
      throw new Error(`Unknown command: ${commandArg}`);
    }

    if (jsonMode) {
      console.log(
        JSON.stringify(
          {
            success: result.success,
            output: stripVTControlCharacters(result.output.trim()),
          },
          null,
          2,
        ),
      );
    } else if (result.success) {
      console.log(`\n${result.output}\n`);
    } else {
      console.error(`\n${result.output}\n`);
    }

    process.exit(result.success ? 0 : 1);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (jsonMode) {
      console.log(
        JSON.stringify({ success: false, error: stripVTControlCharacters(errorMsg) }, null, 2),
      );
    } else {
      console.error(`\n❌ Error: ${errorMsg}\n`);
    }
    process.exit(2);
  }
}
