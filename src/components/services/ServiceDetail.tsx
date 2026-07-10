import { useState, useEffect } from "react";
import { X, RefreshCw, Play, Square, RotateCcw, PowerOff, Power } from "lucide-react";
import type { ServiceInfo } from "@/lib/service-types";
import { service_action, get_service_logs } from "@/hooks/use-ipc";

interface ServiceDetailProps {
  service: ServiceInfo;
  serverId: string;
  onClose: () => void;
}

export function ServiceDetail({ service, serverId, onClose }: ServiceDetailProps) {
  const [logs, setLogs] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentService, setCurrentService] = useState(service);

  useEffect(() => {
    loadLogs();
  }, [service.name]);

  async function loadLogs() {
    setLogsLoading(true);
    try {
      const data = await get_service_logs({ server_id: serverId }, service.name, 100);
      setLogs(data);
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLogsLoading(false);
    }
  }

  async function handleAction(action: string) {
    setActionLoading(action);
    try {
      await service_action({ server_id: serverId, service_name: service.name, action });
      setCurrentService({
        ...currentService,
        active_state: action === "start" ? "active" : action === "stop" ? "inactive" : currentService.active_state,
      });
    } catch (error) {
      console.error(`Failed to ${action} service:`, error);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{currentService.name}</span>
          <span
            className={`rounded px-2 py-0.5 text-xs ${
              currentService.active_state === "active"
                ? "bg-green-500/20 text-green-500"
                : currentService.active_state === "failed"
                  ? "bg-red-500/20 text-red-500"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {currentService.active_state}
          </span>
        </div>
        <button onClick={onClose} className="rounded p-1 hover:bg-accent">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <p className="text-sm">{currentService.name}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Status</label>
              <p className="text-sm">{currentService.load_state}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Active State</label>
              <p className="text-sm">{currentService.active_state}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Sub State</label>
              <p className="text-sm">{currentService.sub_state}</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Description</label>
            <p className="text-sm">{currentService.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {currentService.active_state === "inactive" ? (
              <button
                onClick={() => handleAction("start")}
                disabled={actionLoading === "start"}
                className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                <Play size={14} />
                Start
              </button>
            ) : (
              <button
                onClick={() => handleAction("stop")}
                disabled={actionLoading === "stop"}
                className="flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Square size={14} />
                Stop
              </button>
            )}
            <button
              onClick={() => handleAction("restart")}
              disabled={actionLoading === "restart"}
              className="flex items-center gap-1 rounded border border-input px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Restart
            </button>
            <button
              onClick={() => handleAction("enable")}
              disabled={actionLoading === "enable"}
              className="flex items-center gap-1 rounded border border-input px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
            >
              <Power size={14} />
              Enable
            </button>
            <button
              onClick={() => handleAction("disable")}
              disabled={actionLoading === "disable"}
              className="flex items-center gap-1 rounded border border-input px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
            >
              <PowerOff size={14} />
              Disable
            </button>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Logs</label>
              <button onClick={loadLogs} className="rounded p-1 hover:bg-accent">
                <RefreshCw size={14} />
              </button>
            </div>
            <pre className="max-h-[300px] overflow-auto rounded bg-muted p-3 text-sm">
              {logsLoading ? "Loading logs..." : logs || "No logs available"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
