import { useState, useEffect, useRef } from "react";
import { RefreshCw, Download } from "lucide-react";
import type { LogEntry } from "@/lib/log-types";
import { read_logs } from "@/hooks/use-ipc";

interface LogViewerProps {
  serverId: string;
}

const LOG_SOURCES = [
  { value: "journalctl", label: "Journal (systemd)" },
  { value: "syslog", label: "Syslog" },
  { value: "auth", label: "Auth Log" },
  { value: "nginx", label: "Nginx Access" },
  { value: "nginx_error", label: "Nginx Error" },
];

const LOG_LEVELS = [
  { value: "", label: "All" },
  { value: "emerg", label: "Emergency" },
  { value: "alert", label: "Alert" },
  { value: "crit", label: "Critical" },
  { value: "err", label: "Error" },
  { value: "warning", label: "Warning" },
  { value: "notice", label: "Notice" },
  { value: "info", label: "Info" },
  { value: "debug", label: "Debug" },
];

export function LogViewer({ serverId }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("journalctl");
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState(100);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLogs();
  }, [serverId, source, level, lines]);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await read_logs({
        server_id: serverId,
        source,
        level: level || undefined,
        lines,
        search: search || undefined,
      });
      setLogs(data);
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${source}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getLevelColor(level: string) {
    switch (level.toLowerCase()) {
      case "error": case "err": case "crit": case "alert": case "emerg":
        return "text-red-400";
      case "warn": case "warning":
        return "text-yellow-400";
      case "debug":
        return "text-gray-400";
      default:
        return "text-foreground";
    }
  }

  const filteredLogs = search
    ? logs.filter(l => l.message.toLowerCase().includes(search.toLowerCase()))
    : logs;

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="flex items-center gap-4">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded border border-input bg-background px-2 py-1 text-sm"
          >
            {LOG_SOURCES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded border border-input bg-background px-2 py-1 text-sm"
          >
            {LOG_LEVELS.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          
          <select
            value={lines}
            onChange={(e) => setLines(parseInt(e.target.value))}
            className="rounded border border-input bg-background px-2 py-1 text-sm"
          >
            <option value="50">50 lines</option>
            <option value="100">100 lines</option>
            <option value="200">200 lines</option>
            <option value="500">500 lines</option>
            <option value="1000">1000 lines</option>
          </select>
          
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter logs..."
            className="rounded border border-input bg-background px-2 py-1 text-sm w-48"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={loadLogs} className="rounded p-1 hover:bg-accent" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={handleExport} className="rounded p-1 hover:bg-accent" title="Export">
            <Download size={16} />
          </button>
        </div>
      </div>

      <div ref={logRef} className="flex-1 overflow-auto font-mono text-xs">
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No logs found</div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredLogs.map((log, i) => (
              <div key={i} className="flex gap-3 px-4 py-1 hover:bg-accent/30">
                <span className="w-40 shrink-0 text-muted-foreground">{log.timestamp}</span>
                <span className={`w-16 shrink-0 font-medium ${getLevelColor(log.level)}`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="w-24 shrink-0 text-muted-foreground">{log.service}</span>
                <span className="flex-1 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {filteredLogs.length} entries
        {search && ` (filtered from ${logs.length})`}
      </div>
    </div>
  );
}
