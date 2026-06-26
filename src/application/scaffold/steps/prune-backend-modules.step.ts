import fs from "node:fs/promises";
import path from "node:path";
import { pathExists } from "../scaffold.use-case.js";
import { FIREBASE_MODULES } from "../backend-modules.registry.js";
import type { ScaffoldContext } from "../scaffold.context.js";

export async function pruneBackendModules(ctx: ScaffoldContext): Promise<void> {
  ctx.progress.next("Pruning unused modules...");

  if (!ctx.isFirebase) {
    // Remove all firebase module files from every registered module
    for (const mod of Object.values(FIREBASE_MODULES)) {
      for (const file of mod.files) {
        const filePath = path.join(ctx.projectDir, file);
        if (await pathExists(filePath)) {
          await fs.rm(filePath, { force: true });
        }
      }
    }

    // Patch config to remove 'firebase' from ServiceProvider type
    const configPath = path.join(ctx.projectDir, "src/config/config.ts");
    if (await pathExists(configPath)) {
      let configContent = await fs.readFile(configPath, "utf-8");
      configContent = configContent.replace(
        /export type ServiceProvider = 'http' \| 'firebase' \| 'mock';/,
        "export type ServiceProvider = 'http' | 'mock';",
      );
      await fs.writeFile(configPath, configContent);
    }
  } else {
    // Remove files for inactive modules only
    for (const [name, mod] of Object.entries(FIREBASE_MODULES)) {
      if (!ctx.activeBackendModules.includes(name)) {
        for (const file of mod.files) {
          const filePath = path.join(ctx.projectDir, file);
          if (await pathExists(filePath)) {
            await fs.rm(filePath, { force: true });
          }
        }
      }
    }
  }
}
