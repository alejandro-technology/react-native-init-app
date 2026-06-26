import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import chalk from "chalk";

interface LogoAnimationProps {
  onComplete: () => void;
}

interface Cell {
  char: string;
  color: string;
}

function renderFrame(frame: number): string {
  const width = 60;
  const height = 18;
  const cx = 30;
  const cy = 9;

  // Initialize grid
  const grid: Cell[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ char: " ", color: "none" })),
  );

  // 1. Draw nucleus
  grid[cy][cx] = { char: "●", color: "nucleus" };
  const glowPoints = [
    { dx: -2, dy: 0 },
    { dx: 2, dy: 0 },
    { dx: -1, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: 1 },
  ];
  for (const { dx, dy } of glowPoints) {
    const gx = cx + dx;
    const gy = cy + dy;
    if (gx >= 0 && gx < width && gy >= 0 && gy < height) {
      grid[gy][gx] = { char: "•", color: "nucleus-glow" };
    }
  }

  // Define orbits parameters
  const a = 15; // semi-major axis
  const b = 5.5; // semi-minor axis
  const baseAngles = [Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6];

  // Animation timelines
  const drawProgress = Math.min(1.0, frame / 25);
  const spinAngle = frame > 25 ? (frame - 25) * 0.03 : 0;

  // 2. Draw the three orbits
  for (let i = 0; i < 3; i++) {
    const angle = baseAngles[i] + spinAngle;
    const maxT = 2 * Math.PI * drawProgress;
    const step = 0.01;
    for (let t = 0; t <= maxT; t += step) {
      const x_e = a * Math.cos(t);
      const y_e = b * Math.sin(t);

      const xr = x_e * Math.cos(angle) - y_e * Math.sin(angle);
      const yr = x_e * Math.sin(angle) + y_e * Math.cos(angle);

      const px = Math.round(cx + xr);
      const py = Math.round(cy + yr / 2.0);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        grid[py][px] = { char: "·", color: "orbit" };
      }
    }
  }

  // 3. Draw electrons and trails (2 per orbit, offset by PI for symmetry)
  if (frame >= 10) {
    const electronSpeed = 0.12;
    const t_e = (frame - 10) * electronSpeed;
    const electronOffsets = [0, Math.PI];

    for (let i = 0; i < 3; i++) {
      const angle = baseAngles[i] + spinAngle;

      for (const offset of electronOffsets) {
        const t_base = t_e + offset;
        const trailLength = 4;
        for (let s = trailLength - 1; s >= 0; s--) {
          const t_trail = t_base - s * 0.12;
          const x_e = a * Math.cos(t_trail);
          const y_e = b * Math.sin(t_trail);

          const xr = x_e * Math.cos(angle) - y_e * Math.sin(angle);
          const yr = x_e * Math.sin(angle) + y_e * Math.cos(angle);

          const px = Math.round(cx + xr);
          const py = Math.round(cy + yr / 2.0);

          if (px >= 0 && px < width && py >= 0 && py < height) {
            if (s === 0) {
              grid[py][px] = { char: "●", color: "electron" };
            } else if (s === 1) {
              grid[py][px] = { char: "•", color: "trail-1" };
            } else if (s === 2) {
              grid[py][px] = { char: "•", color: "trail-2" };
            } else {
              grid[py][px] = { char: "·", color: "trail-3" };
            }
          }
        }
      }
    }
  }

  // Map grid to colored string
  const colorMap: Record<string, (s: string) => string> = {
    none: (s) => s,
    nucleus: (s) => chalk.bold.hex("#00D8FF")(s),
    "nucleus-glow": (s) => chalk.hex("#00A3C2")(s),
    orbit: (s) => chalk.hex("#005D70")(s),
    electron: (s) => chalk.bold.hex("#E6FAFF")(s),
    "trail-1": (s) => chalk.bold.hex("#00D8FF")(s),
    "trail-2": (s) => chalk.hex("#00A3C2")(s),
    "trail-3": (s) => chalk.hex("#005D70")(s),
  };

  const lines = grid.map((row) => row.map((cell) => colorMap[cell.color](cell.char)).join(""));

  return lines.join("\n");
}

export const LogoAnimation: React.FC<LogoAnimationProps> = ({ onComplete }) => {
  const [frame, setFrame] = useState(0);

  useInput(() => {
    onComplete();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => {
        if (prev >= 75) {
          clearInterval(interval);
          onComplete();
          return prev;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  const logoString = renderFrame(frame);

  const textProgress = Math.min(1.0, Math.max(0, frame - 15) / 15);
  const subtitle = "REACT NATIVE TUI";
  const charsToShow = Math.floor(subtitle.length * textProgress);
  const visibleSubtitle = subtitle.slice(0, charsToShow);

  return (
    <Box flexDirection="column" alignItems="center" padding={1}>
      <Box height={18} width={60}>
        <Text>{logoString}</Text>
      </Box>
      <Box marginTop={1} height={1}>
        <Text bold color="cyan">
          {visibleSubtitle}
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor italic>
          Press any key to skip
        </Text>
      </Box>
    </Box>
  );
};
