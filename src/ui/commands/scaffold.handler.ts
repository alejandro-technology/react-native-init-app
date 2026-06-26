import type { ProjectConfig as ScaffoldData } from "../../domain/project/project.model.js";
import type { ProgressCallback } from "../../domain/command/command.model.js";
import { GithubTemplateRepository } from "../../infrastructure/template/github-template.repository.js";
import { scaffoldProject } from "../../application/scaffold/scaffold.use-case.js";

export async function runScaffold(
  scaffoldData: ScaffoldData,
  onProgress: ProgressCallback,
  onOutput: (chunk: string) => void
): Promise<{ output: string; success: boolean }> {
  const templateRepo = new GithubTemplateRepository();

  const downloadResult = await templateRepo.download({
    projectName: scaffoldData.projectName,
    onProgress: (msg) => {
      onProgress(0, 1, msg);
      onOutput(`\n${msg}`);
    },
  });

  if (!downloadResult.success) {
    return {
      output: `Failed to download template: ${downloadResult.error}`,
      success: false,
    };
  }

  try {
    const result = await scaffoldProject({
      ...scaffoldData,
      templatePath: downloadResult.templatePath,
      onProgress: (step, total, message, log) => {
        onProgress(step, total, message, log);
        if (log) onOutput(log);
      },
    });

    await templateRepo.cleanup(downloadResult.tempDir);

    if (!result.success && result.error) {
      return { output: `Error during scaffold: ${result.error}`, success: false };
    }

    return { output: result.output, success: result.success };
  } catch (err) {
    await templateRepo.cleanup(downloadResult.tempDir);
    throw err;
  }
}
