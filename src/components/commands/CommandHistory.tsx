import { useState, useEffect } from "react";
import { RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react";
import type { CommandHistoryEntry } from "@/lib/command-types";

interface CommandHistoryProps {
  serverId: string;
}

export function CommandHistory({ serverId }: CommandHistoryProps) {
  const [history, setHistory] = useState<CommandHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<CommandHistoryEntry | null>(null);

  useEffect(() => {
    loadHistory();
  }, [serverId]);

  async function loadHistory() {
    setLoading(true);
    try {
      // In a real implementation, this would load from SQLite
      setHistory([]);
    } catch (error) {
      console.error("Failed to load command history:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Command History</span>
        </div>
        <button onClick={loadHistory} className="rounded p-1 hover:bg-accent" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && history.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No command history</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-32">Time</span>
              <span className="flex-1">Command</span>
              <span className="w-16">Status</span>
              <span className="w-20">Duration</span>
            </div>
            {history.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedEntry?.id === entry.id ? "bg-accent" : ""
                }`}
              >
                <span className="w-32 truncate text-xs text-muted-foreground">
                  {new Date(entry.executed_at).toLocaleString()}
                </span>
                <span className="flex-1 truncate font-mono text-xs">{entry.command_id}</span>
                <span className="w-16">
                  {entry.success ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <XCircle size={14} className="text-red-400" />
                  )}
                </span>
                <span className="w-20 text-xs text-muted-foreground">
                  {entry.duration_ms}ms
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {history.length} entries
        {selectedEntry && ` | Selected`}
      </div>
    </div>
  );
}
