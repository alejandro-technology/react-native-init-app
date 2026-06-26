import fs from "node:fs/promises";
import path from "node:path";
import { pathExists, FILES_TO_DELETE } from "../scaffold.use-case.js";
import type { ScaffoldContext } from "../scaffold.context.js";

export async function deleteDefaultFiles(ctx: ScaffoldContext): Promise<void> {
  ctx.progress.next("Cleaning up default files...");

  for (const file of FILES_TO_DELETE) {
    const filePath = path.join(ctx.projectDir, file);
    if (await pathExists(filePath)) {
      await fs.rm(filePath, { recursive: true, force: true });
    }
  }
}
