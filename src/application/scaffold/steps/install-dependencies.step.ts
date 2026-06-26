import { execStreamed } from "../../commands/exec-streamed.js";
import { PM_COMMANDS } from "../../../domain/constants.js";
import type { ScaffoldContext } from "../scaffold.context.js";

export async function installDependencies(ctx: ScaffoldContext): Promise<void> {
  const pm = PM_COMMANDS[ctx.packageManager as keyof typeof PM_COMMANDS];

  ctx.progress.next(`Installing dependencies (${ctx.packageManager})...`);
  const [cmd, ...args] = pm.install.split(" ");
  await execStreamed(cmd, args, { cwd: ctx.projectDir });

  if (ctx.podInstall && process.platform === "darwin") {
    ctx.progress.next("Running pod install...");
    await execStreamed(cmd, ["run", "pod-cocoa"], { cwd: ctx.projectDir });
    await execStreamed(cmd, ["run", "pod-install"], { cwd: ctx.projectDir });
  }
}
