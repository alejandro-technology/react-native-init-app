import fs from "node:fs/promises";
import path from "node:path";
import { pathExists } from "../scaffold.use-case.js";
import { FIREBASE_MODULES } from "../backend-modules.registry.js";
import type { ScaffoldContext } from "../scaffold.context.js";

export async function patchDiInjectors(ctx: ScaffoldContext): Promise<void> {
  ctx.progress.next("Patching dependency injectors...");

  for (const [name, mod] of Object.entries(FIREBASE_MODULES)) {
    const shouldRemove =
      !ctx.isFirebase || !ctx.activeBackendModules.includes(name);
    if (!shouldRemove) continue;

    // Singular DI pattern (auth): one service file, one import regex, one case regex
    if ("diImportRegex" in mod) {
      const m = mod as (typeof FIREBASE_MODULES)["auth"];
      const servicePath = path.join(
        ctx.projectDir,
        "src/modules",
        m.diServiceFile,
      );
      if (await pathExists(servicePath)) {
        let content = await fs.readFile(servicePath, "utf-8");
        content = content.replace(m.diImportRegex, "");
        content = content.replace(m.diCaseRegex, "");
        await fs.writeFile(servicePath, content);
      }
    }

    // Plural DI pattern (firestore): multiple service files with parallel regex arrays
    if ("diImportRegexes" in mod) {
      const m = mod as (typeof FIREBASE_MODULES)["firestore"];
      for (let i = 0; i < m.diServiceFiles.length; i++) {
        const servicePath = path.join(
          ctx.projectDir,
          "src/modules",
          m.diServiceFiles[i],
        );
        if (await pathExists(servicePath)) {
          let content = await fs.readFile(servicePath, "utf-8");
          content = content.replace(m.diImportRegexes[i], "");
          content = content.replace(m.diCaseRegexes[i], "");
          await fs.writeFile(servicePath, content);
        }
      }
    }
  }

  // Patch firebase/index.ts — remove exports for inactive modules
  if (ctx.isFirebase) {
    const firebaseIndexPath = path.join(
      ctx.projectDir,
      "src/modules/firebase/index.ts",
    );
    if (await pathExists(firebaseIndexPath)) {
      let indexContent = await fs.readFile(firebaseIndexPath, "utf-8");
      for (const [name, mod] of Object.entries(FIREBASE_MODULES)) {
        if (!ctx.activeBackendModules.includes(name)) {
          indexContent = indexContent.replace(mod.firebaseIndexExport, "");
        }
      }
      await fs.writeFile(firebaseIndexPath, indexContent);
    }
  }
}
