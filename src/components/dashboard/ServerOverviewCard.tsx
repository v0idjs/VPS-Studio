import { Wifi, WifiOff, HelpCircle } from "lucide-react";
import type { ServerStats } from "@/lib/types";

interface ServerOverviewCardProps {
  stats: ServerStats;
  serverName: string;
  onClick?: () => void;
}

function StatusIndicator({ status }: { status: "online" | "offline" | "unknown" }) {
  switch (status) {
    case "online":
      return <Wifi className="h-4 w-4 text-green-500" />;
    case "offline":
      return <WifiOff className="h-4 w-4 text-red-500" />;
    default:
      return <HelpCircle className="h-4 w-4 text-yellow-500" />;
  }
}

function ProgressBar({ value, label }: { value: number | null; label: string }) {
  const percent = value ?? 0;
  const color =
    percent > 90 ? "bg-red-500" : percent > 70 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span>{percent.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-accent">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function ServerOverviewCard({ stats, serverName, onClick }: ServerOverviewCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">{serverName}</h3>
        <StatusIndicator status={stats.hostname ? "online" : "unknown"} />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <span className="block">OS</span>
          <span className="text-foreground">{stats.os_name ?? "N/A"}</span>
        </div>
        <div>
          <span className="block">Kernel</span>
          <span className="text-foreground">{stats.kernel_version ?? "N/A"}</span>
        </div>
        <div>
          <span className="block">Uptime</span>
          <span className="text-foreground">{stats.uptime ?? "N/A"}</span>
        </div>
        <div>
          <span className="block">Load</span>
          <span className="text-foreground">{stats.load_average ?? "N/A"}</span>
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar value={stats.cpu_usage} label="CPU" />
        <ProgressBar value={stats.memory_usage} label="Memory" />
        <ProgressBar value={stats.disk_usage} label="Disk" />
      </div>

      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>Mem: {formatBytes(stats.memory_used)} / {formatBytes(stats.memory_total)}</span>
        <span>Disk: {formatBytes(stats.disk_used)} / {formatBytes(stats.disk_total)}</span>
      </div>
    </div>
  );
}
