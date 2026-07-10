import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : true;
        const altMatch = shortcut.alt ? event.altKey : true;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export const defaultShortcuts: KeyboardShortcut[] = [
  { key: "k", ctrl: true, action: () => {}, description: "Open command palette" },
  { key: "n", ctrl: true, action: () => {}, description: "Add new server" },
  { key: "r", ctrl: true, action: () => {}, description: "Refresh current view" },
  { key: ",", ctrl: true, action: () => {}, description: "Open settings" },
  { key: "Escape", action: () => {}, description: "Close modal/dialog" },
];
