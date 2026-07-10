import { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import type { Snapshot, SnapshotComparison } from "@/lib/snapshot-types";
import { compare_snapshots } from "@/hooks/use-ipc";

interface SnapshotComparisonProps {
  serverId: string;
  snapshot: Snapshot;
  onClose: () => void;
}

export function SnapshotComparisonView({ serverId, snapshot, onClose }: SnapshotComparisonProps) {
  const [comparison, setComparison] = useState<SnapshotComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparison();
  }, [serverId, snapshot]);

  async function loadComparison() {
    setLoading(true);
    try {
      const data = await compare_snapshots({
        server_id: serverId,
        snapshot_id: snapshot.id,
      });
      setComparison(data);
    } catch (error) {
      console.error("Failed to compare snapshots:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Compare: {snapshot.name}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comparison ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded border border-border p-4">
                <h3 className="mb-2 text-sm font-medium">Snapshot Info</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Hostname: {snapshot.hostname}</p>
                  <p>Kernel: {snapshot.kernel}</p>
                  <p>Uptime: {snapshot.uptime}</p>
                  <p>Created: {new Date(snapshot.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="rounded border border-border p-4">
                <h3 className="mb-2 text-sm font-medium">Current System</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Packages: {snapshot.packages.length}</p>
                  <p>Services: {snapshot.services.length}</p>
                  <p>Network Interfaces: {snapshot.network.length}</p>
                  <p>Disk Partitions: {snapshot.disk.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded border border-border p-4">
              <h3 className="mb-2 text-sm font-medium">Packages ({snapshot.packages.length})</h3>
              <div className="max-h-32 overflow-auto font-mono text-xs">
                {snapshot.packages.slice(0, 20).map((pkg, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{pkg.name}</span>
                    <span className="text-muted-foreground">{pkg.version}</span>
                  </div>
                ))}
                {snapshot.packages.length > 20 && (
                  <div className="text-muted-foreground">...and {snapshot.packages.length - 20} more</div>
                )}
              </div>
            </div>

            <div className="rounded border border-border p-4">
              <h3 className="mb-2 text-sm font-medium">Services ({snapshot.services.length})</h3>
              <div className="max-h-32 overflow-auto font-mono text-xs">
                {snapshot.services.slice(0, 20).map((svc, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{svc.name}</span>
                    <span className={svc.enabled ? "text-green-400" : "text-muted-foreground"}>
                      {svc.status}
                    </span>
                  </div>
                ))}
                {snapshot.services.length > 20 && (
                  <div className="text-muted-foreground">...and {snapshot.services.length - 20} more</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">Failed to load comparison</div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded border border-input px-4 py-2 text-sm hover:bg-accent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
