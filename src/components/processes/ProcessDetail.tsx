import { X, AlertTriangle } from "lucide-react";
import type { ProcessInfo } from "@/lib/process-types";

interface ProcessDetailProps {
  process: ProcessInfo;
  onClose: () => void;
}

export function ProcessDetail({ process, onClose }: ProcessDetailProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">Process {process.pid}</span>
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {process.stat}
          </span>
        </div>
        <button onClick={onClose} className="rounded p-1 hover:bg-accent">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">PID</label>
              <p className="text-sm">{process.pid}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">User</label>
              <p className="text-sm">{process.user}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">CPU</label>
              <p className="text-sm">
                <span className={process.cpu > 80 ? "text-red-500" : ""}>
                  {process.cpu.toFixed(1)}%
                </span>
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Memory</label>
              <p className="text-sm">
                <span className={process.mem > 80 ? "text-red-500" : ""}>
                  {process.mem.toFixed(1)}%
                </span>
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">VSZ</label>
              <p className="text-sm">{formatSize(process.vsz)}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">RSS</label>
              <p className="text-sm">{formatSize(process.rss)}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Start Time</label>
              <p className="text-sm">{process.start}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">CPU Time</label>
              <p className="text-sm">{process.time}</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Command</label>
            <pre className="mt-1 overflow-auto rounded bg-muted p-3 text-sm">
              {process.command}
            </pre>
          </div>

          {process.cpu > 90 && (
            <div className="flex items-center gap-2 rounded border border-yellow-500/50 bg-yellow-500/10 p-3">
              <AlertTriangle size={16} className="text-yellow-500" />
              <span className="text-sm">High CPU usage detected</span>
            </div>
          )}

          {process.mem > 90 && (
            <div className="flex items-center gap-2 rounded border border-red-500/50 bg-red-500/10 p-3">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-sm">High memory usage detected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${(kb / (1024 * 1024)).toFixed(1)} GB`;
}
