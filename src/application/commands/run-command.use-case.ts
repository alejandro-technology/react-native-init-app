import type { CommandType, ProgressCallback } from "../../domain/command/command.model.js";
import { CLEAN_OPTIONS } from "../../domain/constants.js";
import { execStreamed } from "./exec-streamed.js";
import { Progress } from "./progress.js";

interface CommandResult {
  success: boolean;
  output: string;
}

interface ScriptCommand {
  script: string;
  message: string;
  totalSteps: number;
}

const COMMANDS: Partial<Record<CommandType, ScriptCommand>> = {
  clean: { script: "clean", message: "Cleaning...", totalSteps: 4 },
  "pod-install": { script: "pod-install", message: "Running pod install...", totalSteps: 1 },
  "run-android": { script: "android", message: "Running on Android...", totalSteps: 1 },
};

async function executeClean(
  cleanOption: string | undefined,
  onStepChange?: ProgressCallback
): Promise<CommandResult> {
  const selectedClean = CLEAN_OPTIONS.find((opt) => opt.label === cleanOption);

  if (!selectedClean) {
    return { success: false, output: "❌ Error: Invalid clean option" };
  }

  if (cleanOption === "All") {
    const steps = CLEAN_OPTIONS.filter((opt) => opt.label !== "All");
    const progress = new Progress(steps.length, onStepChange);

    for (const step of steps) {
      progress.next(`Cleaning ${step.label}...`);
      await execStreamed("npm", ["run", step.script], {
        onLog: (log) => onStepChange?.(progress.step, progress.total, "", log),
      });
    }

    progress.current("All cleaned!");
    return { success: true, output: "✅ All caches cleaned successfully!" };
  }

  const progress = new Progress(1, onStepChange);
  progress.next(`Cleaning ${selectedClean.label}...`);
  await execStreamed("npm", ["run", selectedClean.script], {
    onLog: (log) => onStepChange?.(progress.step, progress.total, "", log),
  });

  return { success: true, output: "✅ Command completed successfully!" };
}

async function executeScript(
  commandType: CommandType,
  onStepChange?: ProgressCallback
): Promise<CommandResult> {
  const config = COMMANDS[commandType];
  if (!config) {
    return { success: false, output: `❌ Error: Unknown command "${commandType}"` };
  }

  const progress = new Progress(config.totalSteps, onStepChange);
  progress.next(config.message);
  await execStreamed("npm", ["run", config.script], {
    onLog: (log) => onStepChange?.(progress.step, progress.total, "", log),
  });

  return { success: true, output: "✅ Command completed successfully!" };
}

export async function runCommand(
  commandType: CommandType,
  cleanOption?: string,
  onStepChange?: ProgressCallback
): Promise<CommandResult> {
  try {
    if (commandType === "clean") {
      return await executeClean(cleanOption, onStepChange);
    }
    return await executeScript(commandType, onStepChange);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, output: `❌ Error: ${errorMessage}` };
  }
}
