import React, { useState, useEffect } from "react";
import { Box, Text, Spacer } from "ink";
import { ProgressBar } from "./ProgressBar.js";
import { StepList } from "./StepList.js";
import { SCAFFOLD_STEPS } from "../../domain/constants.js";
import type { CommandType } from "../../domain/command/command.model.js";
import type { ProjectConfig as ScaffoldData } from "../../domain/project/project.model.js";
import { runCommand } from "../../application/commands/run-command.use-case.js";
import { runScaffold } from "../commands/scaffold.handler.js";
import { useOutputBuffer } from "../hooks/use-output-buffer.js";
import { VERSION_OUTPUT } from "../content/version.js";
import { HELP_OUTPUT } from "../content/help.js";

// Module-level constants (no re-allocation per render)
const STATUS_CONFIG = {
  running: { color: "yellow", text: "⏳ Running" },
  success: { color: "green", text: "✅ Success" },
  error: { color: "red", text: "❌ Error" },
} as const;

const COMMAND_LABELS: Record<CommandType, string> = {
  scaffold: "Scaffold New Project",
  clean: "Clean",
  "pod-install": "Pod Install",
  "run-android": "Run Android",
  version: "Version Info",
  help: "Help",
};

// Static commands that need no async work
const STATIC_COMMANDS: Partial<Record<CommandType, { output: string }>> = {
  version: { output: VERSION_OUTPUT },
  help: { output: HELP_OUTPUT },
};

interface AppProps {
  command: CommandType;
  cleanOption?: string;
  scaffoldData?: ScaffoldData;
}

export const App: React.FC<AppProps> = ({
  command,
  cleanOption,
  scaffoldData,
}) => {
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"running" | "success" | "error">("running");
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(1);
  const [stepMessage, setStepMessage] = useState("");
  const [showSteps, setShowSteps] = useState(false);

  const { append, view, clear } = useOutputBuffer(10);

  const handleProgress = (step: number, total: number, message: string, log?: string) => {
    setCurrentStep(step);
    setTotalSteps(total);
    if (message) setStepMessage(message);
    if (log) append(log);
  };

  useEffect(() => {
    const run = async () => {
      clear();
      setShowSteps(false);
      setStatus("running");

      // Static commands (version, help)
      const staticCmd = STATIC_COMMANDS[command];
      if (staticCmd) {
        setOutput(staticCmd.output);
        setStatus("success");
        return;
      }

      // Show step UI for long-running commands
      setShowSteps(command === "scaffold");

      try {
        let result: { output: string; success: boolean };

        if (command === "scaffold" && scaffoldData) {
          result = await runScaffold(scaffoldData, handleProgress, append);
        } else {
          result = await runCommand(command, cleanOption, handleProgress);
        }

        setOutput(result.output);
        setStatus(result.success ? "success" : "error");
      } catch (err) {
        setOutput(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    };
    run();
  }, [command, cleanOption, scaffoldData]);

  const { color, text } = STATUS_CONFIG[status];
  const cmdLabel =
    scaffoldData && command === "scaffold"
      ? `Scaffold: ${scaffoldData.projectName}`
      : cleanOption && command === "clean"
        ? `Clean ${cleanOption}`
        : COMMAND_LABELS[command];

  const steps = showSteps ? SCAFFOLD_STEPS : ["Processing..."];

  return (
    <Box flexDirection="column" padding={1} borderStyle="classic" borderColor="cyan">
      <Box>
        <Text bold color="cyan">
          ⚡ React Native TUI
        </Text>
      </Box>
      <Spacer />
      <Box>
        <Text color="gray">Command: </Text>
        <Text bold>{cmdLabel}</Text>
      </Box>
      <Box>
        <Text color="gray">Status: </Text>
        <Text color={color}>{text}</Text>
      </Box>
      {showSteps && status === "running" && (
        <>
          <Spacer />
          <StepList steps={steps} currentStep={currentStep} />
          <Spacer />
          <ProgressBar current={currentStep} total={totalSteps} label={stepMessage} />
        </>
      )}
      <Spacer />
      <Box flexDirection="column">
        <Text bold color="gray">
          Output:
        </Text>
        <Box
          marginTop={1}
          padding={1}
          borderStyle="double"
          borderColor="gray"
          minHeight={18}
        >
          <Text>
            {status === "running" ? (view || "Processing...") : (output || view)}
          </Text>
        </Box>
      </Box>
      <Spacer />
      <Text color="gray" italic>
        Press Ctrl+C to exit
      </Text>
    </Box>
  );
};
