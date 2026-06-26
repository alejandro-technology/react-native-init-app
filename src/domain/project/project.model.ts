import { PM_COMMANDS } from "../constants.js";
import type { AiProvider, BackendSelection } from "../scaffold/scaffold.model.js";

export type PmCommandType = keyof typeof PM_COMMANDS;

export interface ProjectConfig {
  projectName: string;
  bundleId: string;
  directory: string;
  packageManager: string;
  installDeps: boolean;
  podInstall: boolean;
  aiProviders: AiProvider[];
  backend?: BackendSelection;
}

export interface PromptResult {
  command: string;
  cleanOption?: string;
  scaffoldData?: ProjectConfig;
}
