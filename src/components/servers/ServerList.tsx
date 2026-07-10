import { useEffect, useState } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { listServers, deleteServer, testServerConnection } from "@/hooks/use-ipc";
import { AddServerDialog } from "./AddServerDialog";
import { ServerCard } from "./ServerCard";

export function ServerList() {
  const { servers, setServers, removeServer, selectServer } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServers();
  }, []);

  async function loadServers() {
    setLoading(true);
    try {
      const data = await listServers();
      setServers(data);
    } catch (error) {
      console.error("Failed to load servers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this server?")) {
      try {
        await deleteServer(id);
        removeServer(id);
      } catch (error) {
        console.error("Failed to delete server:", error);
      }
    }
  }

  async function handleTestConnection(id: string) {
    try {
      const success = await testServerConnection(id);
      return success;
    } catch (error) {
      console.error("Failed to test connection:", error);
      return false;
    }
  }

  const filteredServers = servers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Servers</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={loadServers}
            className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            Add Server
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter servers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredServers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No servers found</p>
          <p className="text-sm">Add a server to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onSelect={() => selectServer(server.id)}
              onDelete={() => handleDelete(server.id)}
              onTestConnection={() => handleTestConnection(server.id)}
            />
          ))}
        </div>
      )}

      {showAddDialog && (
        <AddServerDialog onClose={() => setShowAddDialog(false)} />
      )}
    </div>
  );
}
