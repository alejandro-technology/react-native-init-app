import path from "node:path";
import { FIREBASE_MODULES } from "../../application/scaffold/backend-modules.registry.js";
import { PM_COMMANDS } from "../../domain/constants.js";
import type { ProjectConfig } from "../../domain/project/project.model.js";
import type { AiProvider, BackendSelection } from "../../domain/scaffold/scaffold.model.js";

export function parseScaffoldArgs(
  values: Record<string, string | boolean | undefined>,
): ProjectConfig {
  const projectName = values.name as string;
  if (!projectName) {
    throw new Error("Missing required flag: --name");
  }

  const safeName = projectName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const bundleId = (values["bundle-id"] as string) || `com.company.${safeName || "app"}`;
  const directory = (values.directory as string) || path.resolve(process.cwd(), projectName);

  const pm = (values.pm as string) || "npm";
  if (!(pm in PM_COMMANDS)) {
    throw new Error(
      `Invalid package manager: ${pm}. Must be one of: ${Object.keys(PM_COMMANDS).join(", ")}`,
    );
  }

  const installDeps = Boolean(values["install-deps"]);
  const podInstall = Boolean(values["pod-install"]);

  const aiProvidersStr = values.ai as string;
  const aiProviders: AiProvider[] = [];
  if (aiProvidersStr) {
    const providers = aiProvidersStr.split(",").map((s) => s.trim());
    const validProviders = new Set(["claude", "opencode", "trae"]);
    for (const p of providers) {
      if (!validProviders.has(p)) {
        throw new Error(`Invalid AI provider: ${p}. Valid options: claude, opencode, trae`);
      }
      aiProviders.push(p as AiProvider);
    }
  }

  const backendStr = values.backend as string;
  let backend: BackendSelection | undefined;

  if (backendStr === "firebase") {
    const fbModulesStr = values["firebase-modules"] as string;
    const validFbModules = Object.keys(FIREBASE_MODULES);
    let modules = validFbModules; // Default to all if not specified

    if (fbModulesStr) {
      const specified = fbModulesStr.split(",").map((s) => s.trim());
      for (const m of specified) {
        if (!validFbModules.includes(m)) {
          throw new Error(
            `Invalid Firebase module: ${m}. Valid options: ${validFbModules.join(", ")}`,
          );
        }
      }
      modules = specified;
    }

    backend = {
      name: "firebase",
      modules,
    };
  } else if (backendStr && backendStr !== "none") {
    throw new Error(`Invalid backend: ${backendStr}. Valid options: none, firebase`);
  }

  return {
    projectName,
    bundleId,
    directory,
    packageManager: pm,
    installDeps,
    podInstall,
    aiProviders,
    backend,
  };
}
