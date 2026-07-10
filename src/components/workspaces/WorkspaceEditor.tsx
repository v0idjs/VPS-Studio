import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { save_workspace } from "@/hooks/use-ipc";
import type { Workspace } from "@/lib/workspace-types";

interface WorkspaceEditorProps {
  serverId: string;
  editWorkspace?: Workspace | null;
  onClose: () => void;
  onSave?: () => void;
}

const WORKSPACE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export function WorkspaceEditor({ serverId, editWorkspace, onClose, onSave }: WorkspaceEditorProps) {
  const [name, setName] = useState(editWorkspace?.name || "");
  const [description, setDescription] = useState(editWorkspace?.description || "");
  const [color, setColor] = useState(editWorkspace?.color || WORKSPACE_COLORS[0]);
  const [serverIds, setServerIds] = useState(editWorkspace?.server_ids?.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await save_workspace({
        server_id: serverId,
        workspace_name: name.trim(),
        description: description.trim(),
        color,
        server_ids: serverIds.split(",").map(s => s.trim()).filter(Boolean),
      });
      onSave?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{editWorkspace ? "Edit Workspace" : "Add Workspace"}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production Servers"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="All production servers"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Color</label>
            <div className="flex gap-2">
              {WORKSPACE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full ${
                    color === c ? "ring-2 ring-primary ring-offset-2" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm">Server IDs (comma-separated)</label>
            <input
              type="text"
              value={serverIds}
              onChange={(e) => setServerIds(e.target.value)}
              placeholder="server-1, server-2"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {error && (
            <div className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border border-input px-4 py-2 text-sm hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
