import type { CleanOption } from "./command/command.model.js";
export const VERSION = "1.1.0";
export const RN_VERSION = "0.83.4";

export const PM_COMMANDS = {
  npm: {
    install: "npm install",
    run: (script: string) => `npm run ${script}`,
    pm: "npm",
    exec: "npx",
  },
  yarn: {
    install: "yarn install",
    run: (script: string) => `yarn ${script}`,
    pm: "yarn",
    exec: "yarn",
  },
  pnpm: {
    install: "pnpm install",
    run: (script: string) => `pnpm ${script}`,
    pm: "pnpm",
    exec: "pnpm",
  },
  bun: {
    install: "bun install",
    run: (script: string) => `bun run ${script}`,
    pm: "bun",
    exec: "bunx",
  },
};

export const PROGRESS_BAR_WIDTH = 20;

export const CLEAN_OPTIONS: CleanOption[] = [
  {
    label: "Android",
    script: "clean-android",
    cleanMessage: "Android build folder cleaned",
  },
  {
    label: "iOS",
    script: "clean-ios",
    cleanMessage: "iOS build folder cleaned",
  },
  {
    label: "Node Modules",
    script: "clean-node",
    cleanMessage: "Node modules removed",
    destructive: true,
  },
  {
    label: "Watchman",
    script: "clean-watch",
    cleanMessage: "Watchman cache cleared",
  },
  {
    label: "All",
    script: "scaffold",
    cleanMessage: "All caches cleaned",
    destructive: true,
  },
];

export const CLEAN_TARGETS: Record<string, string> = {
  android: "Android",
  ios: "iOS",
  "node-modules": "Node Modules",
  watchman: "Watchman",
  all: "All",
};

export const SCAFFOLD_STEPS = [
  "Initializing React Native project...",
  "Cleaning up default files...",
  "Copying template files...",
  "Merging package.json...",
  "Pruning unused modules...",
  "Patching dependency injectors...",
  "Configuring git...",
  "Installing dependencies...",
  "Running pod install...",
];
