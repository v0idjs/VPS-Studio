import { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2, FolderOpen, Edit2 } from "lucide-react";
import type { Workspace } from "@/lib/workspace-types";
import { list_workspaces, delete_workspace } from "@/hooks/use-ipc";

interface WorkspaceListProps {
  serverId: string;
  onAdd?: () => void;
  onEdit?: (workspace: Workspace) => void;
  onSelect?: (workspace: Workspace) => void;
}

export function WorkspaceList({ serverId, onAdd, onEdit, onSelect }: WorkspaceListProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, [serverId]);

  async function loadWorkspaces() {
    setLoading(true);
    try {
      const data = await list_workspaces({ server_id: serverId });
      setWorkspaces(data);
    } catch (error) {
      console.error("Failed to load workspaces:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(workspace: Workspace) {
    if (!confirm(`Delete workspace: ${workspace.name}?`)) return;
    try {
      await delete_workspace({ server_id: serverId, workspace_name: workspace.name });
      await loadWorkspaces();
    } catch (error) {
      console.error("Failed to delete workspace:", error);
    }
  }

  function handleSelect(workspace: Workspace) {
    setSelectedWorkspace(workspace);
    onSelect?.(workspace);
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Workspaces</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadWorkspaces} className="rounded p-1 hover:bg-accent" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={onAdd} className="rounded p-1 hover:bg-accent" title="Add workspace">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && workspaces.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No workspaces</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-8"></span>
              <span className="flex-1">Name</span>
              <span className="w-20">Servers</span>
              <span className="w-20">Actions</span>
            </div>
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => handleSelect(workspace)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedWorkspace?.id === workspace.id ? "bg-accent" : ""
                }`}
              >
                <span className="w-8">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: workspace.color }}
                  />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{workspace.name}</div>
                  {workspace.description && (
                    <div className="text-xs text-muted-foreground">{workspace.description}</div>
                  )}
                </div>
                <span className="w-20 text-xs text-muted-foreground">
                  {workspace.server_ids.length} servers
                </span>
                <div className="flex w-20 gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit?.(workspace); }}
                    className="rounded p-1 text-muted-foreground hover:bg-accent"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(workspace); }}
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
        {workspaces.length} workspaces
        {selectedWorkspace && ` | Selected: ${selectedWorkspace.name}`}
      </div>
    </div>
  );
}
