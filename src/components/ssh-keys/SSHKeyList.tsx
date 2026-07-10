import { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2, Download, Key, Copy } from "lucide-react";
import type { SSHKey } from "@/lib/ssh-key-types";
import { list_ssh_keys, delete_ssh_key, export_ssh_key } from "@/hooks/use-ipc";

interface SSHKeyListProps {
  serverId: string;
  onGenerate?: () => void;
  onImport?: () => void;
}

export function SSHKeyList({ serverId, onGenerate, onImport }: SSHKeyListProps) {
  const [keys, setKeys] = useState<SSHKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<SSHKey | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadKeys();
  }, [serverId]);

  async function loadKeys() {
    setLoading(true);
    try {
      const data = await list_ssh_keys({ server_id: serverId });
      setKeys(data);
    } catch (error) {
      console.error("Failed to load SSH keys:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(key: SSHKey) {
    if (!confirm(`Delete SSH key: ${key.name}?`)) return;
    try {
      await delete_ssh_key({ server_id: serverId, key_name: key.name });
      await loadKeys();
    } catch (error) {
      console.error("Failed to delete SSH key:", error);
    }
  }

  async function handleCopy(key: SSHKey) {
    try {
      const publicKey = await export_ssh_key({ server_id: serverId, key_name: key.name });
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy key:", error);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">SSH Keys</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadKeys} className="rounded p-1 hover:bg-accent" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={onGenerate} className="rounded p-1 hover:bg-accent" title="Generate key">
            <Plus size={16} />
          </button>
          <button onClick={onImport} className="rounded p-1 hover:bg-accent" title="Import key">
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && keys.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No SSH keys found</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-32">Name</span>
              <span className="w-20">Type</span>
              <span className="flex-1">Public Key</span>
              <span className="w-24">Actions</span>
            </div>
            {keys.map((key) => (
              <div
                key={key.id}
                onClick={() => setSelectedKey(key)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedKey?.id === key.id ? "bg-accent" : ""
                }`}
              >
                <span className="w-32 truncate text-sm font-medium">{key.name}</span>
                <span className="w-20 truncate text-xs text-muted-foreground">{key.key_type}</span>
                <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
                  {key.public_key.slice(0, 50)}...
                </span>
                <div className="flex w-24 gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(key); }}
                    className="rounded p-1 text-muted-foreground hover:bg-accent"
                    title="Copy public key"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(key); }}
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
        {keys.length} keys
        {selectedKey && ` | Selected: ${selectedKey.name}`}
        {copied && " | Copied!"}
      </div>
    </div>
  );
}
