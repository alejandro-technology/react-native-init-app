import fs from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";
import { PM_COMMANDS } from "./constants.js";

const FILES_TO_COPY = [
  "__tests__",
  ".bundle",
  ".github",
  ".env.example",
  // Folders
  "src",
  "vendor",
  // AI - (Set one of useClaude, useOpencode, useTrae to true)
  //".ai",
  //"AGENTS.md",
  //"opencode.json",
  //"CLAUDE.md",
  // Lint & Config
  ".eslintrc.js",
  ".prettierrc.js",
  ".watchmanconfig",
  "metro.config.js",
  // iOS
  "Gemfile",
  // Files
  "index.js",
  "App.tsx",
  // Test
  "jest.config.js",
  "jest.setup.js",
  // Config
  "babel.config.js",
  "tsconfig.json",
];

const FILES_TO_DELETE = ["App.tsx", "src", "__tests__"];

const CODE_AGENT_FILES = {
  claude: ["CLAUDE.md", ".claude"],
  opencode: ["AGENTS.md", "opencode.json", ".opencode"],
  trae: [".trae", "TRAE.md"],
} as const;

const TEMPLATE_NAME = "rncatemplate";

const FIREBASE_FILES = (projectName: string) =>
  [
    { src: "android/build.gradle", dest: "android/build.gradle" },
    { src: "android/app/build.gradle", dest: "android/app/build.gradle" },
    { src: "ios/Podfile", dest: "ios/Podfile" },
    {
      src: `ios/${TEMPLATE_NAME}/AppDelegate.swift`,
      dest: `ios/${projectName}/AppDelegate.swift`,
    },
  ] as const;

async function replaceInFileIfExists(
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

function patchAndroidAppGradle(content: string, bundleId: string) {
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

export interface ScaffoldOptions {
  projectName: string;
  bundleId: string;
  directory: string;
  packageManager: string;
  installDeps: boolean;
  podInstall: boolean;
  useClaude: boolean;
  useOpencode: boolean;
  useTrae: boolean;
  useFirebase: boolean;
  firebaseModules: string[];
  templatePath: string;
  onProgress?: (
    step: number,
    total: number,
    message: string,
    log?: string,
  ) => void;
}

async function pathExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath: string) {
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

async function writeJson(filePath: string, data: any) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function scaffoldProject(
  options: ScaffoldOptions,
): Promise<{ success: boolean; output: string; error?: string }> {
  const {
    projectName,
    bundleId,
    directory,
    packageManager,
    installDeps,
    podInstall,
    useClaude,
    useOpencode,
    useTrae,
    useFirebase,
    firebaseModules,
    templatePath,
    onProgress,
  } = options;

  const projectDir = path.resolve(directory);
  const totalSteps =
    7 +
    (installDeps ? 1 : 0) +
    (podInstall && process.platform === "darwin" ? 1 : 0);
  let step = 0;

  const runStreamed = async (
    cmd: string,
    args: string[],
    currentStep: number,
    message: string,
    cwd?: string,
  ) => {
    const childProcess = execa(cmd, args, {
      cwd: cwd || process.cwd(),
      cleanup: true,
    });

    childProcess.stdout?.on("data", (data) => {
      onProgress?.(currentStep, totalSteps, message, data.toString());
    });
    childProcess.stderr?.on("data", (data) => {
      onProgress?.(currentStep, totalSteps, message, data.toString());
    });

    return childProcess;
  };

  try {
    const initMessage = "Initializing React Native project...";
    onProgress?.(step, totalSteps, initMessage);

    await runStreamed(
      PM_COMMANDS[packageManager].exec,
      [
        "@react-native-community/cli",
        "init",
        projectName,
        "--directory",
        projectDir,
        "--package-name",
        bundleId,
        "--skip-install",
      ],
      step++,
      initMessage,
      // No cwd here, run in current dir
    );

    onProgress?.(step++, totalSteps, "Cleaning up default files...");

    for (const file of FILES_TO_DELETE) {
      const filePath = path.join(projectDir, file);
      if (await pathExists(filePath)) {
        await fs.rm(filePath, { recursive: true, force: true });
      }
    }

    onProgress?.(step++, totalSteps, "Copying template files...");

    const extraFiles: string[] = [
      ...(useClaude ? CODE_AGENT_FILES.claude : []),
      ...(useOpencode ? CODE_AGENT_FILES.opencode : []),
      ...(useTrae ? CODE_AGENT_FILES.trae : []),
    ];

    const filesToCopy = Array.from(new Set([...FILES_TO_COPY, ...extraFiles]));

    for (const file of filesToCopy) {
      let templateFile = file;

      const useAgent = useOpencode || useClaude || useTrae;
      const isAgentFolder =
        file.includes(".claude") ||
        file.includes(".opencode") ||
        file.includes(".trae");
      if (useAgent && isAgentFolder) {
        templateFile = ".ai/";
      }

      const srcPath = path.join(templatePath, templateFile);
      const destPath = path.join(projectDir, file);
      if (await pathExists(srcPath)) {
        await fs.cp(srcPath, destPath, { recursive: true });
      }
    }

    // Copy Firebase files separately (they have different src/dest paths)
    if (useFirebase) {
      for (const { src, dest } of FIREBASE_FILES(projectName)) {
        const srcPath = path.join(templatePath, src);
        const destPath = path.join(projectDir, dest);
        if (await pathExists(srcPath)) {
          await fs.cp(srcPath, destPath, { recursive: true });
        }
      }
    }

    await replaceInFileIfExists(
      path.join(projectDir, ".github/workflows/ios-build.yml"),
      (content) => content.replaceAll(TEMPLATE_NAME, projectName),
    );

    if (useFirebase) {
      await replaceInFileIfExists(
        path.join(projectDir, "ios/Podfile"),
        (content) => content.replaceAll(TEMPLATE_NAME, projectName),
      );

      await replaceInFileIfExists(
        path.join(projectDir, "android/build.gradle"),
        (content) => content.replaceAll(TEMPLATE_NAME, projectName),
      );

      await replaceInFileIfExists(
        path.join(projectDir, "android/app/build.gradle"),
        (content) =>
          patchAndroidAppGradle(content.replaceAll(TEMPLATE_NAME, projectName), bundleId),
      );

      await replaceInFileIfExists(
        path.join(projectDir, `ios/${projectName}/AppDelegate.swift`),
        (content) => content.replaceAll(TEMPLATE_NAME, projectName),
      );
    }

    onProgress?.(step++, totalSteps, "Merging package.json...");

    const templatePackageJson = await readJson(
      path.join(templatePath, "package.json"),
    );
    const newPackageJsonPath = path.join(projectDir, "package.json");
    const newPackageJson = await readJson(newPackageJsonPath);

    // Prune Firebase dependencies if needed
    const templateDeps = { ...templatePackageJson.dependencies };
    if (!useFirebase) {
      Object.keys(templateDeps).forEach((dep) => {
        if (dep.startsWith("@react-native-firebase/")) {
          delete templateDeps[dep];
        }
      });
    } else {
      if (!firebaseModules.includes("auth")) {
        delete templateDeps["@react-native-firebase/auth"];
      }
      if (!firebaseModules.includes("firestore")) {
        delete templateDeps["@react-native-firebase/firestore"];
      }
      if (!firebaseModules.includes("storage")) {
        delete templateDeps["@react-native-firebase/storage"];
      }
      // @react-native-firebase/app is always kept if useFirebase is true
    }

    const mergedPackageJson = {
      ...newPackageJson,
      name: projectName.toLowerCase().replace(/-/g, "_"),
      version: templatePackageJson.version,
      dependencies: templateDeps,
      devDependencies: templatePackageJson.devDependencies,
      scripts: templatePackageJson.scripts,
    };

    await writeJson(newPackageJsonPath, mergedPackageJson);

    const appJsonPath = path.join(projectDir, "app.json");
    const appJson = await readJson(appJsonPath);
    appJson.name = projectName;
    appJson.displayName = projectName;
    await writeJson(appJsonPath, appJson);

    onProgress?.(step++, totalSteps, "Pruning unused modules...");
    if (!useFirebase) {
      // Remove all firebase infrastructure files
      await fs.rm(path.join(projectDir, "src/modules/firebase"), { recursive: true, force: true });
      await fs.rm(path.join(projectDir, "src/modules/authentication/infrastructure/firebase-auth.service.ts"), { force: true });
      await fs.rm(path.join(projectDir, "src/modules/products/infrastructure/product.firebase.service.ts"), { force: true });
      await fs.rm(path.join(projectDir, "src/modules/users/infrastructure/user.firebase.service.ts"), { force: true });

      // Patch config
      const configPath = path.join(projectDir, "src/config/config.ts");
      if (await pathExists(configPath)) {
        let configContent = await fs.readFile(configPath, "utf-8");
        configContent = configContent.replace(
          /export type ServiceProvider = 'http' \| 'firebase' \| 'mock';/,
          "export type ServiceProvider = 'http' | 'mock';"
        );
        await fs.writeFile(configPath, configContent);
      }
    } else {
      if (!firebaseModules.includes("auth")) {
        await fs.rm(path.join(projectDir, "src/modules/authentication/infrastructure/firebase-auth.service.ts"), { force: true });
      }
      if (!firebaseModules.includes("firestore")) {
        await fs.rm(path.join(projectDir, "src/modules/firebase/infrastructure/firestore.service.ts"), { force: true });
        await fs.rm(path.join(projectDir, "src/modules/firebase/application/firestore.hooks.ts"), { force: true });
        await fs.rm(path.join(projectDir, "src/modules/firebase/domain/firestore.model.ts"), { force: true });
        await fs.rm(path.join(projectDir, "src/modules/firebase/domain/firestore.repository.ts"), { force: true });
        await fs.rm(path.join(projectDir, "src/modules/products/infrastructure/product.firebase.service.ts"), { force: true });
        await fs.rm(path.join(projectDir, "src/modules/users/infrastructure/user.firebase.service.ts"), { force: true });
      }
      if (!firebaseModules.includes("storage")) {
        await fs.rm(path.join(projectDir, "src/modules/firebase/infrastructure/storage.service.ts"), { force: true });
        await fs.rm(path.join(projectDir, "src/modules/firebase/application/storage.mutations.ts"), { force: true });
        await fs.rm(path.join(projectDir, "src/modules/firebase/application/storage.queries.ts"), { force: true });
        await fs.rm(path.join(projectDir, "src/modules/firebase/domain/storage.model.ts"), { force: true });
        await fs.rm(path.join(projectDir, "src/modules/firebase/domain/storage.repository.ts"), { force: true });
        await fs.rm(path.join(projectDir, "src/modules/firebase/domain/storage.adapter.ts"), { force: true });
      }
    }

    onProgress?.(step++, totalSteps, "Patching dependency injectors...");
    // Auth Service
    const authServicePath = path.join(projectDir, "src/modules/authentication/infrastructure/auth.service.ts");
    if (await pathExists(authServicePath)) {
      let authServiceContent = await fs.readFile(authServicePath, "utf-8");
      if (!useFirebase || !firebaseModules.includes("auth")) {
        authServiceContent = authServiceContent.replace(/import authFirebaseService from '\.\/firebase-auth\.service';\n/, "");
        authServiceContent = authServiceContent.replace(/    case 'firebase':\n      return authFirebaseService;\n/, "");
      }
      await fs.writeFile(authServicePath, authServiceContent);
    }

    // Product Service
    const productServicePath = path.join(projectDir, "src/modules/products/infrastructure/product.service.ts");
    if (await pathExists(productServicePath)) {
      let productServiceContent = await fs.readFile(productServicePath, "utf-8");
      if (!useFirebase || !firebaseModules.includes("firestore")) {
        productServiceContent = productServiceContent.replace(/import productFirebaseService from '\.\/product\.firebase\.service';\n/, "");
        productServiceContent = productServiceContent.replace(/    case 'firebase':\n      return productFirebaseService;\n/, "");
      }
      await fs.writeFile(productServicePath, productServiceContent);
    }

    // User Service
    const userServicePath = path.join(projectDir, "src/modules/users/infrastructure/user.service.ts");
    if (await pathExists(userServicePath)) {
      let userServiceContent = await fs.readFile(userServicePath, "utf-8");
      if (!useFirebase || !firebaseModules.includes("firestore")) {
        userServiceContent = userServiceContent.replace(/import userFirebaseService from '\.\/user\.firebase\.service';\n/, "");
        userServiceContent = userServiceContent.replace(/    case 'firebase':\n      return userFirebaseService;\n/, "");
      }
      await fs.writeFile(userServicePath, userServiceContent);
    }

    // Adjust firebase exports index if firebase is kept but some modules are pruned
    if (useFirebase) {
      const firebaseIndexPath = path.join(projectDir, "src/modules/firebase/index.ts");
      if (await pathExists(firebaseIndexPath)) {
        let indexContent = await fs.readFile(firebaseIndexPath, "utf-8");
        if (!firebaseModules.includes("firestore")) {
          indexContent = indexContent.replace(/export \{ default as firestoreService \} from '\.\/infrastructure\/firestore\.service';\n/, "");
        }
        if (!firebaseModules.includes("storage")) {
          indexContent = indexContent.replace(/export \{ default as storageService \} from '\.\/infrastructure\/storage\.service';\n/, "");
        }
        await fs.writeFile(firebaseIndexPath, indexContent);
      }
    }

    onProgress?.(step, totalSteps, "Configuring git...");

    try {
      await execa("git", ["init"], { cwd: projectDir });
      await execa("git", ["add", "."], { cwd: projectDir });
      await execa(
        "git",
        ["commit", "-m", "chore: apply OpenCode Clean Architecture template"],
        { cwd: projectDir },
      );
    } catch {
      // Git skipped if not available
    }
    step++;

    if (installDeps) {
      const pm = PM_COMMANDS[packageManager as keyof typeof PM_COMMANDS];
      const installMessage = `Installing dependencies (${packageManager})...`;
      onProgress?.(step, totalSteps, installMessage);

      const [cmd, ...args] = pm.install.split(" ");
      await runStreamed(cmd, args, step++, installMessage, projectDir);

      if (podInstall && process.platform === "darwin") {
        const podMessage = "Running pod install...";
        onProgress?.(step, totalSteps, podMessage);
        await runStreamed(
          cmd,
          ["run", "pod-cocoa"],
          step++,
          podMessage,
          projectDir,
        );
        await runStreamed(
          cmd,
          ["run", "pod-install"],
          step++,
          podMessage,
          projectDir,
        );
      }
    }

    const output = `
✅ Setup complete!

📂 Project location: ${projectDir}
📦 Project name: ${projectName}
📦 Package manager: ${packageManager}

Next steps:
  cd ${projectDir}
  ${PM_COMMANDS[packageManager as keyof typeof PM_COMMANDS].run(
    "start",
  )}   # Start Metro bundler
  ${PM_COMMANDS[packageManager as keyof typeof PM_COMMANDS].run(
    "ios",
  )} # Run on iOS
  ${PM_COMMANDS[packageManager as keyof typeof PM_COMMANDS].run(
    "android",
  )} # Run on Android
`;

    return { success: true, output };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, output: "", error: errorMessage };
  }
}
