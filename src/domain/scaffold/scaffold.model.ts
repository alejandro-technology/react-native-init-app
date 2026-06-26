export type AiProvider = "claude" | "opencode" | "trae";

export type BackendProviderName = "firebase"; // extensible

export interface BackendSelection {
  name: BackendProviderName;
  modules: string[];
}

export interface ScaffoldOptions {
  projectName: string;
  bundleId: string;
  directory: string;
  packageManager: string;
  installDeps: boolean;
  podInstall: boolean;
  aiProviders: AiProvider[];
  backend?: BackendSelection;
  templatePath: string;
  onProgress?: (
    step: number,
    total: number,
    message: string,
    log?: string,
  ) => void;
}

export interface ScaffoldResult {
  success: boolean;
  output: string;
  error?: string;
}
