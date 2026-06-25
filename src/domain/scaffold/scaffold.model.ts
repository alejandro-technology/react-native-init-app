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

export interface ScaffoldResult {
  success: boolean;
  output: string;
  error?: string;
}
