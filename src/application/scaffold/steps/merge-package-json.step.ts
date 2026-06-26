import path from "node:path";
import { readJson, writeJson } from "../scaffold.use-case.js";
import { getFirebaseDeps } from "../backend-modules.registry.js";
import type { ScaffoldContext } from "../scaffold.context.js";

export async function mergePackageJson(ctx: ScaffoldContext): Promise<void> {
  ctx.progress.next("Merging package.json...");

  const templatePackageJson = await readJson(path.join(ctx.templatePath, "package.json"));
  const newPackageJsonPath = path.join(ctx.projectDir, "package.json");
  const newPackageJson = await readJson(newPackageJsonPath);

  // Prune Firebase dependencies based on active modules
  const templateDeps = { ...templatePackageJson.dependencies };
  const firebaseDepsToKeep = ctx.isFirebase ? getFirebaseDeps(ctx.activeBackendModules) : {};

  Object.keys(templateDeps).forEach((dep) => {
    if (dep.startsWith("@react-native-firebase/") && !(dep in firebaseDepsToKeep)) {
      delete templateDeps[dep];
    }

    if (dep.startsWith("react-native-nitro-sqlite") && !ctx.isLocal) {
      delete templateDeps[dep];
    }

    if (dep.startsWith("@supabase/") && !ctx.isSupabase) {
      delete templateDeps[dep];
    }
  });

  const mergedPackageJson = {
    ...newPackageJson,
    name: ctx.projectName.toLowerCase().replace(/-/g, "_"),
    version: templatePackageJson.version,
    dependencies: templateDeps,
    devDependencies: templatePackageJson.devDependencies,
    scripts: templatePackageJson.scripts,
    "lint-staged": templatePackageJson["lint-staged"],
  };

  await writeJson(newPackageJsonPath, mergedPackageJson);

  // Update app.json with project name
  const appJsonPath = path.join(ctx.projectDir, "app.json");
  const appJson = await readJson(appJsonPath);
  appJson.name = ctx.projectName;
  appJson.displayName = ctx.projectName;
  await writeJson(appJsonPath, appJson);
}
