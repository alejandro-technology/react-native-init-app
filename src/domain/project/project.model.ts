import { PM_COMMANDS } from "../constants.js";

export type PmCommandType = keyof typeof PM_COMMANDS;

export interface ProjectConfig {
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
}

export interface PromptResult {
  command: string;
  cleanOption?: string;
  scaffoldData?: ProjectConfig;
}
