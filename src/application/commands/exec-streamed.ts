import { execa, type Subprocess } from "execa";

export function execStreamed(
  cmd: string,
  args: string[],
  opts: { cwd?: string; onLog?: (chunk: string) => void } = {},
): Subprocess {
  const childProcess = execa(cmd, args, { cleanup: true, cwd: opts.cwd });

  childProcess.stdout?.on("data", (data: Buffer) => {
    opts.onLog?.(data.toString());
  });
  childProcess.stderr?.on("data", (data: Buffer) => {
    opts.onLog?.(data.toString());
  });

  return childProcess;
}
