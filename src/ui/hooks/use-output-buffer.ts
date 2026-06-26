import { useState, useCallback } from "react";

export function useOutputBuffer(maxLines: number = 10) {
  const [buffer, setBuffer] = useState<string[]>([]);

  const append = useCallback(
    (chunk: string) => {
      setBuffer((prev) => {
        const next = [...prev, ...chunk.split("\n").filter(Boolean)];
        return next.slice(-maxLines);
      });
    },
    [maxLines]
  );

  const view = buffer.join("\n");

  const clear = useCallback(() => setBuffer([]), []);

  return { append, view, clear };
}
