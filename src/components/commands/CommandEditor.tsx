import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { save_command } from "@/hooks/use-ipc";

interface CommandEditorProps {
  serverId: string;
  editCommand?: { name: string; command: string; description: string; category: string; tags: string[] } | null;
  onClose: () => void;
  onSave?: () => void;
}

export function CommandEditor({ serverId, editCommand, onClose, onSave }: CommandEditorProps) {
  const [name, setName] = useState(editCommand?.name || "");
  const [command, setCommand] = useState(editCommand?.command || "");
  const [description, setDescription] = useState(editCommand?.description || "");
  const [category, setCategory] = useState(editCommand?.category || "general");
  const [tags, setTags] = useState(editCommand?.tags?.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim() || !command.trim()) {
      setError("Name and command are required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await save_command({
        server_id: serverId,
        command_name: name.trim(),
        command_text: command.trim(),
        description: description.trim(),
        category: category.trim(),
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      });
      onSave?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save command");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{editCommand ? "Edit Command" : "Add Command"}</h2>
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
              placeholder="Backup Script"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Command</label>
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="/usr/local/bin/backup.sh"
              rows={3}
              className="w-full rounded border border-input bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Daily backup of important files"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="general"
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="backup, daily, cron"
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
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
            disabled={loading || !name.trim() || !command.trim()}
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
