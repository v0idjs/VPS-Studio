import { useState, useEffect } from "react";
import { RefreshCw, Search, Play, Square, RotateCcw, Power } from "lucide-react";
import type { ServiceInfo } from "@/lib/service-types";
import { list_services, service_action } from "@/hooks/use-ipc";

interface ServiceListProps {
  serverId: string;
  onSelectService?: (service: ServiceInfo) => void;
  onViewLogs?: (service: ServiceInfo) => void;
}

export function ServiceList({ serverId, onSelectService, onViewLogs }: ServiceListProps) {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, [serverId]);

  async function loadServices() {
    setLoading(true);
    try {
      const data = await list_services({ server_id: serverId });
      setServices(data);
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleServiceAction(serviceName: string, action: string) {
    setActionLoading(`${serviceName}-${action}`);
    try {
      await service_action({ server_id: serverId, service_name: serviceName, action });
      await loadServices();
    } catch (error) {
      console.error(`Failed to ${action} service:`, error);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function getStatusColor(service: ServiceInfo): string {
    if (service.active_state === "active") return "text-green-500";
    if (service.active_state === "failed") return "text-red-500";
    if (service.active_state === "inactive") return "text-muted-foreground";
    return "text-yellow-500";
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded border border-input bg-background pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          onClick={loadServices}
          className="rounded p-1 hover:bg-accent"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && services.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No services found</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-48">Name</span>
              <span className="w-24">Status</span>
              <span className="w-24">Active</span>
              <span className="w-24">Sub</span>
              <span className="flex-1">Description</span>
              <span className="w-32">Actions</span>
            </div>
            {filteredServices.map((service) => (
              <div
                key={service.name}
                onClick={() => setSelectedService(service)}
                onDoubleClick={() => onSelectService?.(service)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedService?.name === service.name ? "bg-accent" : ""
                }`}
              >
                <span className="w-48 truncate text-sm font-medium">{service.name}</span>
                <span className="w-24 text-sm">
                  <span className={getStatusColor(service)}>{service.load_state}</span>
                </span>
                <span className="w-24 text-sm">
                  <span className={getStatusColor(service)}>{service.active_state}</span>
                </span>
                <span className="w-24 text-sm text-muted-foreground">{service.sub_state}</span>
                <span className="flex-1 truncate text-sm text-muted-foreground">
                  {service.description}
                </span>
                <div className="flex w-32 gap-1">
                  {service.active_state === "inactive" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceAction(service.name, "start");
                      }}
                      disabled={actionLoading === `${service.name}-start`}
                      className="rounded p-1 text-muted-foreground hover:bg-green-500/10 hover:text-green-500 disabled:opacity-50"
                      title="Start"
                    >
                      <Play size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceAction(service.name, "stop");
                      }}
                      disabled={actionLoading === `${service.name}-stop`}
                      className="rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                      title="Stop"
                    >
                      <Square size={14} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceAction(service.name, "restart");
                    }}
                    disabled={actionLoading === `${service.name}-restart`}
                    className="rounded p-1 text-muted-foreground hover:bg-yellow-500/10 hover:text-yellow-500 disabled:opacity-50"
                    title="Restart"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewLogs?.(service);
                    }}
                    className="rounded p-1 text-muted-foreground hover:bg-accent"
                    title="View logs"
                  >
                    <Power size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {filteredServices.length} services
        {selectedService && ` | Selected: ${selectedService.name}`}
      </div>
    </div>
  );
}
