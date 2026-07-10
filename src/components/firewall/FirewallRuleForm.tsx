import { useState } from "react";
import { X, Shield, Loader2 } from "lucide-react";
import { add_firewall_rule } from "@/hooks/use-ipc";

interface FirewallRuleFormProps {
  serverId: string;
  onClose: () => void;
  onSave?: () => void;
}

export function FirewallRuleForm({ serverId, onClose, onSave }: FirewallRuleFormProps) {
  const [port, setPort] = useState("");
  const [protocol, setProtocol] = useState("tcp");
  const [fromIp, setFromIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!port.trim()) {
      setError("Port is required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await add_firewall_rule({
        server_id: serverId,
        port: port.trim(),
        protocol,
        from_ip: fromIp.trim() || "any",
      });
      onSave?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add rule");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Firewall Rule</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">Port</label>
            <input
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="22"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Single port (22), range (1000-2000), or multiple (22,80,443)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm">Protocol</label>
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm">Source IP (optional)</label>
            <input
              type="text"
              value={fromIp}
              onChange={(e) => setFromIp(e.target.value)}
              placeholder="any"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Leave blank for "any" (all IPs)
            </p>
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
            disabled={loading || !port.trim()}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            {loading ? "Adding..." : "Add Rule"}
          </button>
        </div>
      </div>
    </div>
  );
}
