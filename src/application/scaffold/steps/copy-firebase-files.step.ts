import fs from "node:fs/promises";
import path from "node:path";
import {
  pathExists,
  replaceInFileIfExists,
  patchAndroidAppGradle,
  FIREBASE_FILES,
  TEMPLATE_NAME,
  TEMPLATE_BUNDLE_ID,
} from "../scaffold.use-case.js";
import type { ScaffoldContext } from "../scaffold.context.js";

export async function copyFirebaseFiles(ctx: ScaffoldContext): Promise<void> {
  // Copy Firebase-specific files with different src/dest paths
  for (const { src, dest } of FIREBASE_FILES(ctx.projectName)) {
    const srcPath = path.join(ctx.templatePath, src);
    const destPath = path.join(ctx.projectDir, dest);
    if (await pathExists(srcPath)) {
      await fs.cp(srcPath, destPath, { recursive: true });
    }
  }

  // iOS replacements
  await replaceInFileIfExists(path.join(ctx.projectDir, "ios/Podfile"), (content) =>
    content.replaceAll(TEMPLATE_NAME, ctx.projectName),
  );

  await replaceInFileIfExists(
    path.join(ctx.projectDir, `ios/${ctx.projectName}/AppDelegate.swift`),
    (content) => content.replaceAll(TEMPLATE_NAME, ctx.projectName),
  );

  await replaceInFileIfExists(
    path.join(ctx.projectDir, "ios/GoogleService-Info.plist"),
    (content) => content.replaceAll(TEMPLATE_BUNDLE_ID, ctx.bundleId),
  );

  // Android replacements
  await replaceInFileIfExists(path.join(ctx.projectDir, "android/build.gradle"), (content) =>
    content.replaceAll(TEMPLATE_NAME, ctx.projectName),
  );

  await replaceInFileIfExists(path.join(ctx.projectDir, "android/app/build.gradle"), (content) =>
    patchAndroidAppGradle(content.replaceAll(TEMPLATE_NAME, ctx.projectName), ctx.bundleId),
  );

  await replaceInFileIfExists(
    path.join(ctx.projectDir, "android/app/google-services.json"),
    (content) => content.replaceAll(TEMPLATE_BUNDLE_ID, ctx.bundleId),
  );
}
