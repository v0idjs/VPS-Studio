import { useState, useEffect } from "react";
import { RefreshCw, Search, Play, Square, RotateCcw, Trash2 } from "lucide-react";
import type { DockerContainer } from "@/lib/docker-types";
import { list_docker_containers, docker_container_action, docker_stop_container, docker_restart_container, docker_remove_container } from "@/hooks/use-ipc";

interface ContainerListProps {
  serverId: string;
  onSelectContainer?: (container: DockerContainer) => void;
}

export function ContainerList({ serverId, onSelectContainer }: ContainerListProps) {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContainer, setSelectedContainer] = useState<DockerContainer | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadContainers();
    const interval = setInterval(loadContainers, 10000);
    return () => clearInterval(interval);
  }, [serverId]);

  async function loadContainers() {
    setLoading(true);
    try {
      const data = await list_docker_containers({ server_id: serverId });
      setContainers(data);
    } catch (error) {
      console.error("Failed to load containers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(containerId: string, action: string) {
    setActionLoading(`${containerId}-${action}`);
    try {
      switch (action) {
        case "start":
          await docker_container_action({ server_id: serverId, container_id: containerId });
          break;
        case "stop":
          await docker_stop_container({ server_id: serverId, container_id: containerId });
          break;
        case "restart":
          await docker_restart_container({ server_id: serverId, container_id: containerId });
          break;
        case "remove":
          await docker_remove_container({ server_id: serverId, container_id: containerId });
          break;
      }
      await loadContainers();
    } catch (error) {
      console.error(`Failed to ${action} container:`, error);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredContainers = containers.filter((c) =>
    c.names.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.image.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function getStatusColor(container: DockerContainer): string {
    if (container.status.includes("Up")) return "text-green-500";
    if (container.status.includes("Exited")) return "text-red-500";
    return "text-yellow-500";
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter containers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded border border-input bg-background pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button onClick={loadContainers} className="rounded p-1 hover:bg-accent" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && containers.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredContainers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No containers found</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-24">ID</span>
              <span className="w-40">Image</span>
              <span className="w-32">Status</span>
              <span className="w-40">Ports</span>
              <span className="flex-1">Names</span>
              <span className="w-32">Actions</span>
            </div>
            {filteredContainers.map((container) => (
              <div
                key={container.id}
                onClick={() => setSelectedContainer(container)}
                onDoubleClick={() => onSelectContainer?.(container)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedContainer?.id === container.id ? "bg-accent" : ""
                }`}
              >
                <span className="w-24 truncate text-sm">{container.id}</span>
                <span className="w-40 truncate text-sm text-muted-foreground">{container.image}</span>
                <span className="w-32 text-sm">
                  <span className={getStatusColor(container)}>{container.status}</span>
                </span>
                <span className="w-40 truncate text-sm text-muted-foreground">{container.ports}</span>
                <span className="flex-1 truncate text-sm">{container.names}</span>
                <div className="flex w-32 gap-1">
                  {container.status.includes("Up") ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAction(container.id, "stop"); }}
                      disabled={actionLoading === `${container.id}-stop`}
                      className="rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                      title="Stop"
                    >
                      <Square size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAction(container.id, "start"); }}
                      disabled={actionLoading === `${container.id}-start`}
                      className="rounded p-1 text-muted-foreground hover:bg-green-500/10 hover:text-green-500 disabled:opacity-50"
                      title="Start"
                    >
                      <Play size={14} />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAction(container.id, "restart"); }}
                    disabled={actionLoading === `${container.id}-restart`}
                    className="rounded p-1 text-muted-foreground hover:bg-yellow-500/10 hover:text-yellow-500 disabled:opacity-50"
                    title="Restart"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAction(container.id, "remove"); }}
                    disabled={actionLoading === `${container.id}-remove`}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    title="Remove"
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
        {filteredContainers.length} containers
        {selectedContainer && ` | Selected: ${selectedContainer.names}`}
      </div>
    </div>
  );
}
