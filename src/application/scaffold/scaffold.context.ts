import type { Progress } from "../commands/progress.js";

export interface ScaffoldContext {
  projectDir: string;
  projectName: string;
  bundleId: string;
  templatePath: string;
  packageManager: string;
  installDeps: boolean;
  podInstall: boolean;
  aiProviders: string[];
  isFirebase: boolean;
  activeBackendModules: string[];
  progress: Progress;
}
