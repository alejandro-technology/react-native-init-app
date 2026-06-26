import fs from "node:fs/promises";
import path from "node:path";
import { pathExists, SERVICE_PROVIDER_STRING } from "../scaffold.use-case.js";
import {
  FIREBASE_MODULES,
  HTTP_MODULES,
  LOCAL_MODULES,
  MOCK_MODULES,
  SUPABASE_MODULES,
} from "../backend-modules.registry.js";
import type { ScaffoldContext } from "../scaffold.context.js";
import { type BackendProviderName } from "../../../domain/scaffold/scaffold.model.js";

export async function pruneBackendModules(ctx: ScaffoldContext): Promise<void> {
  ctx.progress.next("Pruning unused modules...");

  // Remove all mock module files from every registered module
  for (const mod of Object.values(MOCK_MODULES)) {
    for (const file of mod.files) {
      const filePath = path.join(ctx.projectDir, file);
      if (await pathExists(filePath)) {
        await fs.rm(filePath, { force: true });
      }
    }
  }

  if (!ctx.isLocal) {
    // Remove all local module files from every registered module
    for (const mod of Object.values(LOCAL_MODULES)) {
      for (const file of mod.files) {
        const filePath = path.join(ctx.projectDir, file);
        if (await pathExists(filePath)) {
          await fs.rm(filePath, { force: true });
        }
      }
    }
  }

  if (!ctx.isSupabase) {
    // Remove all supabase module files from every registered module
    for (const mod of Object.values(SUPABASE_MODULES)) {
      for (const file of mod.files) {
        const filePath = path.join(ctx.projectDir, file);
        if (await pathExists(filePath)) {
          await fs.rm(filePath, { force: true });
        }
      }
    }
  }

  if (!ctx.isHttp) {
    // Remove all http module files from every registered module
    for (const mod of Object.values(HTTP_MODULES)) {
      for (const file of mod.files) {
        const filePath = path.join(ctx.projectDir, file);
        if (await pathExists(filePath)) {
          await fs.rm(filePath, { force: true });
        }
      }
    }
  }

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

  // Patch config to remove 'firebase' from ServiceProvider type
  const configPath = path.join(ctx.projectDir, "src/config/config.ts");
  if (await pathExists(configPath)) {
    let configContent = await fs.readFile(configPath, "utf-8");
    configContent = configContent.replace(
      SERVICE_PROVIDER_STRING,
      `export type ServiceProvider = '${getServiceProviderString(ctx)}' | 'mock';`,
    );
    await fs.writeFile(configPath, configContent);
  }
}

function getServiceProviderString(ctx: ScaffoldContext): BackendProviderName {
  if (ctx.isFirebase) {
    return "firebase";
  }
  if (ctx.isSupabase) {
    return "supabase";
  }
  if (ctx.isHttp) {
    return "http";
  }
  if (ctx.isLocal) {
    return "local";
  }
  return "mock";
}
