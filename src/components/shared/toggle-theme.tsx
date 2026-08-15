"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) {
    return (
      <ToggleGroup key={"before-mounted"} disabled={true} className="w-full flex over">
        <ToggleGroupItem value="system" aria-label="Toggle system" className="flex-1">
          SYSTEM
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" aria-label="Toggle dark" className="flex-1">
          DARK
        </ToggleGroupItem>
        <ToggleGroupItem value="light" aria-label="Toggle light" className="flex-1">
          LIGHT
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }

  return (
    <ToggleGroup
      key={"after-mounted"}
      value={[theme ?? "system"]}
      onValueChange={(values) => setTheme(values[0])}
      className="w-full flex over"
    >
      <ToggleGroupItem value="system" aria-label="Toggle system" className="flex-1">
        SYSTEM
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Toggle dark" className="flex-1">
        DARK
      </ToggleGroupItem>
      <ToggleGroupItem value="light" aria-label="Toggle light" className="flex-1">
        LIGHT
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
