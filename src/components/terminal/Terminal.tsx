import { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { listenTerminalData } from "@/lib/events";
import { sendTerminalInput, resizeTerminal } from "@/hooks/use-ipc";
import { TERMINAL_THEMES } from "@/lib/terminal-themes";
import { useAppStore } from "@/stores/app-store";

interface TerminalProps {
  sessionId: string;
  theme?: string;
}

export function Terminal({ sessionId, theme = "dark" }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new XTerminal({
      theme: TERMINAL_THEMES[theme] || TERMINAL_THEMES.dark,
      fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
      fontSize: useAppStore.getState().settings.terminal_font_size,
      cursorBlink: true,
      scrollback: 10000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    let cleanupFn: (() => void) | null = null;
    
    listenTerminalData(sessionId, (data: string) => {
      terminal.write(data);
    }).then((unlisten) => {
      cleanupFn = unlisten;
    });

    terminal.onData((data: string) => {
      sendTerminalInput(sessionId, data);
    });

    terminal.onResize(({ cols, rows }: { cols: number; rows: number }) => {
      resizeTerminal(sessionId, cols, rows);
    });

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      if (cleanupFn) {
        cleanupFn();
      }
      terminal.dispose();
    };
  }, [sessionId, theme]);

  return <div ref={terminalRef} className="h-full w-full bg-[#1a1b26]" />;
}
