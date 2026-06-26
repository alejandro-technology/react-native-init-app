import { execStreamed } from "../../commands/exec-streamed.js";
import { PM_COMMANDS } from "../../../domain/constants.js";
import type { ScaffoldContext } from "../scaffold.context.js";

export async function initReactNative(ctx: ScaffoldContext): Promise<void> {
  ctx.progress.next("Initializing React Native project...");

  await execStreamed(
    PM_COMMANDS[ctx.packageManager as keyof typeof PM_COMMANDS].exec,
    [
      "@react-native-community/cli",
      "init",
      ctx.projectName,
      "--directory",
      ctx.projectDir,
      "--package-name",
      ctx.bundleId,
      "--skip-install",
      "--version",
      "0.83.4",
    ],
  );
}
