import fs from "node:fs/promises";
import path from "node:path";
import { NAVIGATION_MODULE } from "../backend-modules.registry.js";
import type { ScaffoldContext } from "../scaffold.context.js";
import { pathExists } from "../scaffold.use-case.js";

export async function pruneNavigationModule(ctx: ScaffoldContext): Promise<void> {
  ctx.progress.next("Pruning navigation module...");

  for (const mod of Object.values(NAVIGATION_MODULE)) {
    // Remove all navigation module files from every registered module
    for (const file of mod.files) {
      const filePath = path.join(ctx.projectDir, file);
      if (await pathExists(filePath)) {
        await fs.rm(filePath, { force: true });
      }
    }
  }
}
