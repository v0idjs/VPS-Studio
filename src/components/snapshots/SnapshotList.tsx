import { useState, useEffect } from "react";
import { RefreshCw, Camera, Trash2, GitCompare } from "lucide-react";
import type { Snapshot } from "@/lib/snapshot-types";
import { create_snapshot } from "@/hooks/use-ipc";

interface SnapshotListProps {
  serverId: string;
  onCreate?: (snapshot: Snapshot) => void;
  onCompare?: (snapshot: Snapshot) => void;
}

export function SnapshotList({ serverId, onCreate, onCompare }: SnapshotListProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    loadSnapshots();
  }, [serverId]);

  async function loadSnapshots() {
    setLoading(true);
    try {
      // In a real implementation, this would load from SQLite
      setSnapshots([]);
    } catch (error) {
      console.error("Failed to load snapshots:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    const name = prompt("Snapshot name:");
    if (!name) return;
    
    try {
      const snapshot = await create_snapshot({
        server_id: serverId,
        snapshot_name: name,
      });
      setSnapshots(prev => [...prev, snapshot]);
      onCreate?.(snapshot);
    } catch (error) {
      console.error("Failed to create snapshot:", error);
    }
  }

  function handleDelete(snapshot: Snapshot) {
    if (!confirm(`Delete snapshot: ${snapshot.name}?`)) return;
    setSnapshots(prev => prev.filter(s => s.id !== snapshot.id));
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Snapshots</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadSnapshots} className="rounded p-1 hover:bg-accent" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={handleCreate} className="rounded p-1 hover:bg-accent" title="Create snapshot">
            <Camera size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && snapshots.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : snapshots.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No snapshots yet</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="flex-1">Name</span>
              <span className="w-32">Created</span>
              <span className="w-32">Host</span>
              <span className="w-24">Actions</span>
            </div>
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                onClick={() => setSelectedSnapshot(snapshot)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedSnapshot?.id === snapshot.id ? "bg-accent" : ""
                }`}
              >
                <span className="flex-1 truncate text-sm font-medium">{snapshot.name}</span>
                <span className="w-32 truncate text-xs text-muted-foreground">
                  {new Date(snapshot.created_at).toLocaleString()}
                </span>
                <span className="w-32 truncate text-xs text-muted-foreground">{snapshot.hostname}</span>
                <div className="flex w-24 gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onCompare?.(snapshot); }}
                    className="rounded p-1 text-muted-foreground hover:bg-accent"
                    title="Compare"
                  >
                    <GitCompare size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(snapshot); }}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Delete"
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
        {snapshots.length} snapshots
        {selectedSnapshot && ` | Selected: ${selectedSnapshot.name}`}
      </div>
    </div>
  );
}
