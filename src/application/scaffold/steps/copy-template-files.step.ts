import fs from "node:fs/promises";
import path from "node:path";
import {
  pathExists,
  replaceInFileIfExists,
  FILES_TO_COPY,
  CODE_AGENT_FILES,
  TEMPLATE_NAME,
  HTTP_FILES,
} from "../scaffold.use-case.js";
import type { ScaffoldContext } from "../scaffold.context.js";

export async function copyTemplateFiles(ctx: ScaffoldContext): Promise<void> {
  ctx.progress.next("Copying template files...");

  const extraFiles: string[] = [
    ...(ctx.aiProviders.includes("claude") ? CODE_AGENT_FILES.claude : []),
    ...(ctx.aiProviders.includes("opencode") ? CODE_AGENT_FILES.opencode : []),
    ...(ctx.aiProviders.includes("trae") ? CODE_AGENT_FILES.trae : []),
  ];

  const filesToCopy = Array.from(new Set([...FILES_TO_COPY, ...extraFiles]));

  for (const file of filesToCopy) {
    let templateFile = file;

    const useAgent = ctx.aiProviders.length > 0;
    const isAgentFolder =
      file.includes(".claude") || file.includes(".opencode") || file.includes(".trae");
    if (useAgent && isAgentFolder) {
      templateFile = ".ai/";
    }

    // For http backend remove network files in prune-backend-modules.step.ts
    // if (file.includes("modules/network") && !ctx.isHttp) {}

    if (file.includes("modules/sqlite") && !ctx.isLocal) {
      continue;
    }

    const isFirebaseFile =
      file.includes("modules/firebase") || file.includes("__tests__/modules/firebase");
    if (isFirebaseFile && !ctx.isFirebase) {
      continue;
    }

    const isSupabaseFile =
      file.includes("modules/supabase") || file.includes("__tests__/modules/supabase");
    if (isSupabaseFile && !ctx.isSupabase) {
      continue;
    }

    const srcPath = path.join(ctx.templatePath, templateFile);
    const destPath = path.join(ctx.projectDir, file);
    if (await pathExists(srcPath)) {
      await fs.cp(srcPath, destPath, { recursive: true });
    }
  }

  // Replace template name in GitHub workflow
  await replaceInFileIfExists(
    path.join(ctx.projectDir, ".github/workflows/ios-build.yml"),
    (content) => content.replaceAll(TEMPLATE_NAME, ctx.projectName),
  );
}
