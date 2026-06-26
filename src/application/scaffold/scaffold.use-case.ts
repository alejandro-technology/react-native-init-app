import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { PM_COMMANDS } from "../../domain/constants.js";
import type { PmCommandType } from "../../domain/project/project.model.js";
import type { ScaffoldOptions } from "../../domain/scaffold/scaffold.model.js";
import { Progress } from "../commands/progress.js";
import type { ScaffoldContext } from "./scaffold.context.js";
import { initReactNative } from "./steps/init-react-native.step.js";
import { deleteDefaultFiles } from "./steps/delete-default-files.step.js";
import { copyTemplateFiles } from "./steps/copy-template-files.step.js";
import { copyFirebaseFiles } from "./steps/copy-firebase-files.step.js";
import { mergePackageJson } from "./steps/merge-package-json.step.js";
import { pruneBackendModules } from "./steps/prune-backend-modules.step.js";
import { patchDiInjectors } from "./steps/patch-di-injectors.step.js";
import { configureGit } from "./steps/configure-git.step.js";
import { installDependencies } from "./steps/install-dependencies.step.js";

// ---------------------------------------------------------------------------
// Constants (shared with step files via import)
// ---------------------------------------------------------------------------

export const FILES_TO_COPY = [
  "__mocks__",
  "__tests__",
  ".bundle",
  ".github",
  ".env.example",
  ".husky",
  // Folders
  "src",
  "vendor",
  // AI - (Set one of useClaude, useOpencode, useTrae to true)
  //".ai",
  //"AGENTS.md",
  //"opencode.json",
  //"CLAUDE.md",
  // Lint & Config
  ".eslintignore",
  ".eslintrc.js",
  ".nvmrc",
  ".prettierrc.js",
  ".watchmanconfig",
  "metro.config.js",
  // iOS
  "Gemfile",
  // Files
  "index.js",
  "App.tsx",
  "declarations.d.ts",
  "TEMPLATE_USAGE.md",
  // Test
  "jest.config.js",
  "jest.setup.js",
  // Config
  "babel.config.js",
  "tsconfig.json",
];

export const FILES_TO_DELETE = ["App.tsx", "src", "__tests__"];

export const CODE_AGENT_FILES = {
  claude: ["CLAUDE.md", ".claude"],
  opencode: ["AGENTS.md", "opencode.json", ".opencode"],
  trae: [".trae", "TRAE.md"],
} as const;

export const TEMPLATE_NAME = "rncatemplate";
export const TEMPLATE_BUNDLE_ID = "com.alejandrotechnology.rncatemplate";

export const FIREBASE_FILES = (projectName: string) =>
  [
    // Android
    { src: "android/build.gradle", dest: "android/build.gradle" },
    { src: "android/app/build.gradle", dest: "android/app/build.gradle" },
    {
      src: "android/app/google-services-dummy.json",
      dest: "android/app/google-services.json",
    },
    // iOS
    { src: "ios/Podfile", dest: "ios/Podfile" },
    {
      src: `ios/${TEMPLATE_NAME}/AppDelegate.swift`,
      dest: `ios/${projectName}/AppDelegate.swift`,
    },
    {
      src: "ios/GoogleService-Info-Dummy.plist",
      dest: "ios/GoogleService-Info.plist",
    },
  ] as const;

// ---------------------------------------------------------------------------
// Utility functions (shared with step files via import)
// ---------------------------------------------------------------------------

export async function pathExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJson(filePath: string) {
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

export async function writeJson(filePath: string, data: any) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function replaceInFileIfExists(
  filePath: string,
  replacer: (content: string) => string,
) {
  if (!(await pathExists(filePath))) return;
  const before = await fs.readFile(filePath, "utf-8");
  const after = replacer(before);
  if (after !== before) {
    await fs.writeFile(filePath, after);
  }
}

export function patchAndroidAppGradle(content: string, bundleId: string) {
  let next = content;
  next = next.replace(
    /(^\s*namespace\s+)(["'])[^\r\n"']+\2/m,
    `$1"${bundleId}"`,
  );
  next = next.replace(
    /(^\s*applicationId\s+)(["'])[^\r\n"']+\2/m,
    `$1"${bundleId}"`,
  );
  return next;
}

// ---------------------------------------------------------------------------
// Success output helpers
// ---------------------------------------------------------------------------

function generateNextStepInstall(
  installDeps: boolean,
  packageManager: PmCommandType,
) {
  if (!installDeps) {
    return `${chalk.yellow("Install dependencies")}
      • ${PM_COMMANDS[packageManager].install}
      • ${PM_COMMANDS[packageManager].run("start")}   # Start Metro bundler`;
  }
  return `• ${PM_COMMANDS[packageManager].run("start")}   # Start Metro bundler`;
}

function generateNextStepIos(
  podInstall: boolean,
  packageManager: PmCommandType,
) {
  if (!podInstall) {
    return `• Install Cocoapods
      • ${PM_COMMANDS[packageManager].run("pod-cocoa")}     # Install ruby Gems (iOS)
      • ${PM_COMMANDS[packageManager].run("pod-install")}   # Install CocoaPods
    
    • ${PM_COMMANDS[packageManager].run("ios")}       # Run on iOS`;
  }
  return `• ${PM_COMMANDS[packageManager].run("ios")}       # Run on iOS`;
}

function buildSuccessOutput(ctx: ScaffoldContext): string {
  const { projectDir, projectName, packageManager, installDeps, podInstall } =
    ctx;
  const pm = packageManager as PmCommandType;

  return `
✅ Setup complete!

📂 Project location: ${projectDir}
📦 Project name: ${projectName}
🛠️ Package manager: ${packageManager}

${chalk.yellow("Next steps:")}
  cd ${projectDir}

  ${generateNextStepInstall(installDeps, pm)}

  ${chalk.green("Run instructions for Android:")}
    • ${PM_COMMANDS[pm].run("android")}   # Run on Android

  ${chalk.blue("Run instructions for iOS:")}
    ${generateNextStepIos(podInstall, pm)}
`;
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export async function scaffoldProject(
  options: ScaffoldOptions,
): Promise<{ success: boolean; output: string; error?: string }> {
  const projectDir = path.resolve(options.directory);
  const isFirebase = options.backend?.name === "firebase";
  const activeBackendModules = options.backend?.modules ?? [];
  const totalSteps =
    8 +
    (options.installDeps ? 1 : 0) +
    (options.podInstall && process.platform === "darwin" ? 1 : 0);
  const progress = new Progress(totalSteps, options.onProgress);

  const ctx: ScaffoldContext = {
    projectDir,
    projectName: options.projectName,
    bundleId: options.bundleId,
    templatePath: options.templatePath,
    packageManager: options.packageManager,
    installDeps: options.installDeps,
    podInstall: options.podInstall,
    aiProviders: options.aiProviders,
    isFirebase,
    activeBackendModules,
    progress,
  };

  try {
    await initReactNative(ctx);
    await deleteDefaultFiles(ctx);
    await copyTemplateFiles(ctx);
    if (isFirebase) await copyFirebaseFiles(ctx);
    await mergePackageJson(ctx);
    await pruneBackendModules(ctx);
    await patchDiInjectors(ctx);
    await configureGit(ctx);
    if (ctx.installDeps) await installDependencies(ctx);

    return { success: true, output: buildSuccessOutput(ctx) };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, output: "", error: msg };
  }
}
