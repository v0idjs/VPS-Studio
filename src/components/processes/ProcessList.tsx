import { useState, useEffect } from "react";
import { RefreshCw, Search, Trash2, ArrowUpDown } from "lucide-react";
import type { ProcessInfo } from "@/lib/process-types";
import { list_processes, kill_process } from "@/hooks/use-ipc";

interface ProcessListProps {
  serverId: string;
  onSelectProcess?: (process: ProcessInfo) => void;
}

export function ProcessList({ serverId, onSelectProcess }: ProcessListProps) {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"cpu" | "mem" | "pid">("cpu");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ProcessInfo | null>(null);

  useEffect(() => {
    loadProcesses();
    const interval = setInterval(loadProcesses, 5000);
    return () => clearInterval(interval);
  }, [serverId]);

  async function loadProcesses() {
    setLoading(true);
    try {
      const data = await list_processes(serverId);
      setProcesses(data);
    } catch (error) {
      console.error("Failed to load processes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleKillProcess(pid: number, signal: string = "SIGTERM") {
    if (!confirm(`Send ${signal} to process ${pid}?`)) return;
    try {
      await kill_process({ server_id: serverId, pid, signal });
      loadProcesses();
    } catch (error) {
      console.error("Failed to kill process:", error);
    }
  }

  function handleSort(field: "cpu" | "mem" | "pid") {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  }

  const filteredProcesses = processes
    .filter((p) => p.command.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const multiplier = sortAsc ? 1 : -1;
      if (sortBy === "cpu") return (a.cpu - b.cpu) * multiplier;
      if (sortBy === "mem") return (a.mem - b.mem) * multiplier;
      return (a.pid - b.pid) * multiplier;
    });

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter processes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded border border-input bg-background pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          onClick={loadProcesses}
          className="rounded p-1 hover:bg-accent"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && processes.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProcesses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No processes found</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-20">PID</span>
              <span className="w-24">User</span>
              <button
                onClick={() => handleSort("cpu")}
                className="flex w-20 items-center gap-1 hover:text-foreground"
              >
                CPU%
                {sortBy === "cpu" && <ArrowUpDown size={12} />}
              </button>
              <button
                onClick={() => handleSort("mem")}
                className="flex w-20 items-center gap-1 hover:text-foreground"
              >
                MEM%
                {sortBy === "mem" && <ArrowUpDown size={12} />}
              </button>
              <span className="w-20">RSS</span>
              <span className="w-24">Status</span>
              <span className="flex-1">Command</span>
              <span className="w-20">Actions</span>
            </div>
            {filteredProcesses.map((process) => (
              <div
                key={process.pid}
                onClick={() => setSelectedProcess(process)}
                onDoubleClick={() => onSelectProcess?.(process)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedProcess?.pid === process.pid ? "bg-accent" : ""
                }`}
              >
                <span className="w-20 text-sm">{process.pid}</span>
                <span className="w-24 truncate text-sm text-muted-foreground">
                  {process.user}
                </span>
                <span className="w-20 text-sm">
                  <span
                    className={
                      process.cpu > 80
                        ? "text-red-500"
                        : process.cpu > 50
                          ? "text-yellow-500"
                          : ""
                    }
                  >
                    {process.cpu.toFixed(1)}%
                  </span>
                </span>
                <span className="w-20 text-sm">
                  <span
                    className={
                      process.mem > 80
                        ? "text-red-500"
                        : process.mem > 50
                          ? "text-yellow-500"
                          : ""
                    }
                  >
                    {process.mem.toFixed(1)}%
                  </span>
                </span>
                <span className="w-20 truncate text-sm text-muted-foreground">
                  {formatRss(process.rss)}
                </span>
                <span className="w-24 text-sm text-muted-foreground">{process.stat}</span>
                <span className="flex-1 truncate text-sm">{process.command}</span>
                <div className="flex w-20 gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleKillProcess(process.pid, "SIGTERM");
                    }}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="SIGTERM"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {filteredProcesses.length} processes
        {selectedProcess && ` | PID: ${selectedProcess.pid}`}
      </div>
    </div>
  );
}

function formatRss(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${(kb / (1024 * 1024)).toFixed(1)} GB`;
}
