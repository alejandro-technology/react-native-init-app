import fs from "node:fs/promises";
import path from "node:path";
import { pathExists } from "../scaffold.use-case.js";
import {
  FIREBASE_MODULES,
  HTTP_MODULES,
  LOCAL_MODULES,
  MOCK_MODULES,
  NAVIGATION_MODULE,
  SUPABASE_MODULES,
} from "../backend-modules.registry.js";
import type { ScaffoldContext } from "../scaffold.context.js";

export async function patchDiInjectors(ctx: ScaffoldContext): Promise<void> {
  ctx.progress.next("Patching dependency injectors...");

  // Helper function to patch DI injectors for a module registry
  async function patchModules(
    modules: Record<string, any>,
    shouldRemoveModule: (name: string, mod: any) => boolean,
  ) {
    // Utiliti function for navigation module patching
    function contentReplace(content: string, regex: RegExp, replace: string) {
      if (Array.isArray(regex) && regex.length == 2) {
        return content.replace(regex[0], regex[1]);
      }
      return content.replace(regex, replace);
    }

    for (const [name, mod] of Object.entries(modules)) {
      if (!shouldRemoveModule(name, mod)) continue;

      // Singular DI pattern: one service file, one import regex, one case regex
      if ("diImportRegex" in mod && "diServiceFile" in mod) {
        const servicePath = path.join(ctx.projectDir, mod.diServiceFile);
        if (await pathExists(servicePath)) {
          let content = await fs.readFile(servicePath, "utf-8");
          content = content.replace(mod.diImportRegex, "");
          content = content.replace(mod.diCaseRegex, "");
          await fs.writeFile(servicePath, content);
        }
      }

      // Plural DI pattern: multiple service files with parallel regex arrays
      if ("diImportRegexes" in mod && "diServiceFiles" in mod) {
        for (let i = 0; i < mod.diServiceFiles.length; i++) {
          const servicePath = path.join(ctx.projectDir, mod.diServiceFiles[i]);
          if (await pathExists(servicePath)) {
            let content = await fs.readFile(servicePath, "utf-8");
            content = contentReplace(content, mod.diImportRegexes[i], "");
            content = contentReplace(content, mod.diCaseRegexes[i], "");
            await fs.writeFile(servicePath, content);
          }
        }
      }
    }
  }

  // Patch MOCK_MODULES
  await patchModules(MOCK_MODULES, () => true);

  // Patch NAVIGATION_MODULE
  await patchModules(NAVIGATION_MODULE, () => true);

  // Patch LOCAL_MODULES if local backend is not active
  if (!ctx.isLocal) {
    await patchModules(LOCAL_MODULES, () => true);
  }

  // Patch SUPABASE_MODULES if supabase backend is not active
  if (!ctx.isSupabase) {
    await patchModules(SUPABASE_MODULES, () => true);
  }

  // Patch HTTP_MODULES if http backend is not active
  if (!ctx.isHttp) {
    await patchModules(HTTP_MODULES, () => true);
  }

  // Patch FIREBASE_MODULES
  await patchModules(FIREBASE_MODULES, (name, _mod) => {
    return !ctx.isFirebase || !ctx.activeBackendModules.includes(name);
  });

  // Patch firebase/index.ts — remove exports for inactive modules
  if (ctx.isFirebase) {
    const firebaseIndexPath = path.join(ctx.projectDir, "src/modules/firebase/index.ts");
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
