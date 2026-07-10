import { useState } from "react";
import { TERMINAL_THEMES } from "@/lib/terminal-themes";

export function TerminalThemes() {
  const [selectedTheme, setSelectedTheme] = useState("dark");

  const themes = Object.entries(TERMINAL_THEMES);

  function handleThemeChange(themeName: string) {
    setSelectedTheme(themeName);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Terminal Themes</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {themes.map(([name, theme]) => (
          <button
            key={name}
            onClick={() => handleThemeChange(name)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              selectedTheme === name
                ? "border-primary bg-accent"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div
              className="mb-2 h-16 rounded"
              style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.cursor}`,
              }}
            >
              <div className="flex h-full items-end gap-1 p-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.red }} />
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.green }} />
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.blue }} />
                <div
                  className="ml-auto h-3 w-3 rounded"
                  style={{ backgroundColor: theme.cursor }}
                />
              </div>
            </div>
            <p className="text-sm font-medium">{theme.name}</p>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-2 font-medium">Theme Preview</h4>
        <div
          className="rounded-md p-4 font-mono text-sm"
          style={{
            backgroundColor: TERMINAL_THEMES[selectedTheme].background,
            color: TERMINAL_THEMES[selectedTheme].foreground,
          }}
        >
          <div>
            <span style={{ color: TERMINAL_THEMES[selectedTheme].green }}>$</span> ls -la
          </div>
          <div>
            <span style={{ color: TERMINAL_THEMES[selectedTheme].blue }}>total 32</span>
          </div>
          <div>
            <span style={{ color: TERMINAL_THEMES[selectedTheme].yellow }}>-rw-r--r--</span>{" "}
            <span style={{ color: TERMINAL_THEMES[selectedTheme].cyan }}>1</span>{" "}
            <span style={{ color: TERMINAL_THEMES[selectedTheme].magenta }}>user</span>{" "}
            <span style={{ color: TERMINAL_THEMES[selectedTheme].foreground }}>4096</span>{" "}
            <span style={{ color: TERMINAL_THEMES[selectedTheme].green }}>file.txt</span>
          </div>
          <div>
            <span style={{ color: TERMINAL_THEMES[selectedTheme].yellow }}>-rw-r--r--</span>{" "}
            <span style={{ color: TERMINAL_THEMES[selectedTheme].cyan }}>1</span>{" "}
            <span style={{ color: TERMINAL_THEMES[selectedTheme].magenta }}>user</span>{" "}
            <span style={{ color: TERMINAL_THEMES[selectedTheme].foreground }}>2048</span>{" "}
            <span style={{ color: TERMINAL_THEMES[selectedTheme].green }}>script.sh</span>
          </div>
        </div>
      </div>
    </div>
  );
}
