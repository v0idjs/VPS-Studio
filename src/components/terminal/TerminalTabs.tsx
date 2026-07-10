import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Terminal } from "./Terminal";
import type { TerminalSession } from "@/lib/types";

interface TerminalTabsProps {
  sessions: TerminalSession[];
  onNewSession: () => void;
  onCloseSession: (sessionId: string) => void;
  activeSessionId?: string;
  onSessionSelect?: (sessionId: string) => void;
}

export function TerminalTabs({
  sessions,
  onNewSession,
  onCloseSession,
  activeSessionId,
  onSessionSelect,
}: TerminalTabsProps) {
  const [selectedTab, setSelectedTab] = useState<string>(
    activeSessionId || sessions[0]?.id || ""
  );

  const activeSession = sessions.find((s) => s.id === selectedTab);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-border bg-background">
        <div className="flex flex-1 overflow-x-auto">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => {
                setSelectedTab(session.id);
                onSessionSelect?.(session.id);
              }}
              className={`group flex items-center gap-2 border-r border-border px-4 py-2 text-sm ${
                selectedTab === session.id
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              <span className="max-w-[120px] truncate">{session.server_name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseSession(session.id);
                  if (selectedTab === session.id) {
                    const remaining = sessions.filter((s) => s.id !== session.id);
                    setSelectedTab(remaining[0]?.id || "");
                  }
                }}
                className="ml-1 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-accent"
              >
                <X size={12} />
              </button>
            </button>
          ))}
        </div>
        <button
          onClick={onNewSession}
          className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Plus size={14} />
          New
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeSession ? (
          <Terminal sessionId={activeSession.id} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">No terminal sessions</p>
              <p className="text-sm">Click "New" to start a terminal session</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
