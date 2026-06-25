export type CommandType =
  | "scaffold"
  | "clean"
  | "pod-install"
  | "run-android"
  | "version"
  | "help";

export interface CleanOption {
  label: string;
  script: string;
  cleanMessage: string;
  destructive?: boolean;
}

export type ProgressCallback = (
  step: number,
  total: number,
  message: string,
  log?: string
) => void;
