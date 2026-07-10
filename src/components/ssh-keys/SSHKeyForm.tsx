import { useState } from "react";
import { X, Key, Loader2 } from "lucide-react";
import { generate_ssh_key, import_ssh_key } from "@/hooks/use-ipc";

interface SSHKeyFormProps {
  serverId: string;
  mode: "generate" | "import";
  onClose: () => void;
  onSave?: () => void;
}

export function SSHKeyForm({ serverId, mode, onClose, onSave }: SSHKeyFormProps) {
  const [keyName, setKeyName] = useState("id_rsa");
  const [keyType, setKeyType] = useState("rsa");
  const [keyBits, setKeyBits] = useState("4096");
  const [publicKey, setPublicKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    
    try {
      if (mode === "generate") {
        await generate_ssh_key({
          server_id: serverId,
          key_name: keyName,
          key_type: keyType,
          key_bits: parseInt(keyBits),
        });
      } else {
        if (!publicKey.trim()) {
          setError("Public key is required");
          setLoading(false);
          return;
        }
        await import_ssh_key({
          server_id: serverId,
          key_name: keyName,
          public_key: publicKey.trim(),
        });
      }
      onSave?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save key");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === "generate" ? "Generate SSH Key" : "Import SSH Key"}
          </h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">Key Name</label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="id_rsa"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {mode === "generate" && (
            <>
              <div>
                <label className="mb-1 block text-sm">Key Type</label>
                <select
                  value={keyType}
                  onChange={(e) => setKeyType(e.target.value)}
                  className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="rsa">RSA</option>
                  <option value="ed25519">Ed25519</option>
                  <option value="ecdsa">ECDSA</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm">Key Bits</label>
                <select
                  value={keyBits}
                  onChange={(e) => setKeyBits(e.target.value)}
                  className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="2048">2048</option>
                  <option value="4096">4096</option>
                </select>
              </div>
            </>
          )}

          {mode === "import" && (
            <div>
              <label className="mb-1 block text-sm">Public Key</label>
              <textarea
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="ssh-rsa AAAA..."
                rows={6}
                className="w-full rounded border border-input bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}

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
            disabled={loading}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
            {loading ? "Saving..." : mode === "generate" ? "Generate" : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
