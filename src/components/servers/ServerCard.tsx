import { Trash2, Edit, Terminal } from "lucide-react";
import type { Server } from "@/lib/types";
import { StatusIcon } from "@/components/common/StatusIcon";

interface ServerCardProps {
  server: Server;
  onSelect: () => void;
  onDelete: () => void;
  onTestConnection: () => void;
}

function StatusBadge({ status }: { status: Server["status"] }) {
  const colors = {
    online: "bg-green-500/10 text-green-500",
    offline: "bg-red-500/10 text-red-500",
    unknown: "bg-yellow-500/10 text-yellow-500",
    connecting: "bg-blue-500/10 text-blue-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colors[status]}`}
    >
      <StatusIcon status={status} />
      {status}
    </span>
  );
}

export function ServerCard({ server, onSelect, onDelete, onTestConnection }: ServerCardProps) {
  return (
    <div
      onClick={onSelect}
      className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">{server.name}</h3>
          <p className="text-sm text-muted-foreground">
            {server.username}@{server.host}:{server.port}
          </p>
        </div>
        <StatusBadge status={server.status} />
      </div>

      {server.group_name && (
        <div className="mt-2">
          <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
            {server.group_name}
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onTestConnection}
          className="flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-accent"
        >
          <Terminal size={12} />
          Test
        </button>
        <button
          className="flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-accent"
          aria-label="Edit server"
        >
          <Edit size={12} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
          aria-label="Delete server"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </div>
  );
}
