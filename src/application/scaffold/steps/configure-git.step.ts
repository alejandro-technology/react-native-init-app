import { execa } from "execa";
import type { ScaffoldContext } from "../scaffold.context.js";

export async function configureGit(ctx: ScaffoldContext): Promise<void> {
  ctx.progress.next("Configuring git...");

  try {
    await execa("git", ["init"], { cwd: ctx.projectDir });
    await execa("git", ["add", "."], { cwd: ctx.projectDir });
    await execa("git", ["commit", "-m", "chore: apply Clean Architecture template"], {
      cwd: ctx.projectDir,
    });
  } catch {
    // Git skipped if not available
  }
}
