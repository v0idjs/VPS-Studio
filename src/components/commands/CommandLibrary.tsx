import { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2, Play, Terminal, Search } from "lucide-react";
import type { Command } from "@/lib/command-types";
import { list_commands, delete_command } from "@/hooks/use-ipc";

interface CommandLibraryProps {
  serverId: string;
  onAdd?: () => void;
  onEdit?: (command: Command) => void;
  onExecute?: (command: Command) => void;
}

export function CommandLibrary({ serverId, onAdd, onExecute }: CommandLibraryProps) {
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    loadCommands();
  }, [serverId]);

  async function loadCommands() {
    setLoading(true);
    try {
      const data = await list_commands({ server_id: serverId });
      setCommands(data);
    } catch (error) {
      console.error("Failed to load commands:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(command: Command) {
    if (!confirm(`Delete command: ${command.name}?`)) return;
    try {
      await delete_command({ server_id: serverId, command_name: command.name });
      await loadCommands();
    } catch (error) {
      console.error("Failed to delete command:", error);
    }
  }

  const categories = Array.from(new Set(commands.map(c => c.category)));
  
  const filteredCommands = commands.filter(cmd => {
    const matchesSearch = !search || 
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      cmd.command.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || cmd.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Command Library</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadCommands} className="rounded p-1 hover:bg-accent" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={onAdd} className="rounded p-1 hover:bg-accent" title="Add command">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border p-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands..."
            className="w-full rounded border border-input bg-background pl-7 pr-2 py-1 text-sm"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1 text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && commands.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCommands.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No commands found</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-32">Name</span>
              <span className="flex-1">Command</span>
              <span className="w-24">Category</span>
              <span className="w-24">Actions</span>
            </div>
            {filteredCommands.map((cmd) => (
              <div
                key={cmd.id}
                onClick={() => setSelectedCommand(cmd)}
                onDoubleClick={() => onExecute?.(cmd)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedCommand?.id === cmd.id ? "bg-accent" : ""
                }`}
              >
                <span className="w-32 truncate text-sm font-medium">{cmd.name}</span>
                <span className="flex-1 truncate font-mono text-xs text-muted-foreground">{cmd.command}</span>
                <span className="w-24 truncate text-xs text-muted-foreground">{cmd.category}</span>
                <div className="flex w-24 gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onExecute?.(cmd); }}
                    className="rounded p-1 text-muted-foreground hover:bg-green-500/10 hover:text-green-400"
                    title="Execute"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(cmd); }}
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
        {filteredCommands.length} commands
        {selectedCommand && ` | Selected: ${selectedCommand.name}`}
      </div>
    </div>
  );
}
