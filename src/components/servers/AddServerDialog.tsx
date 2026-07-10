import { useState } from "react";
import { X } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { addServer } from "@/hooks/use-ipc";
import type { AddServerInput } from "@/lib/types";

interface AddServerDialogProps {
  onClose: () => void;
}

export function AddServerDialog({ onClose }: AddServerDialogProps) {
  const { addServer: addServerToStore } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddServerInput>({
    name: "",
    host: "",
    port: 22,
    username: "",
    auth_type: "password",
    password: "",
    private_key: "",
    passphrase: "",
    group_name: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const server = await addServer(formData);
      addServerToStore(server);
      onClose();
    } catch (error) {
      console.error("Failed to add server:", error);
      alert("Failed to add server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Server</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Server Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="My Server"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="host" className="mb-1 block text-sm font-medium">
                Host
              </label>
              <input
                id="host"
                type="text"
                required
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <label htmlFor="port" className="mb-1 block text-sm font-medium">
                Port
              </label>
              <input
                id="port"
                type="number"
                required
                value={formData.port}
                onChange={(e) =>
                  setFormData({ ...formData, port: parseInt(e.target.value) || 22 })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="root"
            />
          </div>

          <div>
            <label htmlFor="auth_type" className="mb-1 block text-sm font-medium">
              Authentication
            </label>
            <select
              id="auth_type"
              value={formData.auth_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  auth_type: e.target.value as AddServerInput["auth_type"],
                })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="password">Password</option>
              <option value="key">SSH Key</option>
              <option value="key_with_passphrase">SSH Key with Passphrase</option>
            </select>
          </div>

          {formData.auth_type === "password" && (
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {(formData.auth_type === "key" ||
            formData.auth_type === "key_with_passphrase") && (
            <>
              <div>
                <label
                  htmlFor="private_key"
                  className="mb-1 block text-sm font-medium"
                >
                  Private Key Path
                </label>
                <input
                  id="private_key"
                  type="text"
                  value={formData.private_key || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, private_key: e.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="~/.ssh/id_rsa"
                />
              </div>
              {formData.auth_type === "key_with_passphrase" && (
                <div>
                  <label
                    htmlFor="passphrase"
                    className="mb-1 block text-sm font-medium"
                  >
                    Passphrase
                  </label>
                  <input
                    id="passphrase"
                    type="password"
                    value={formData.passphrase || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, passphrase: e.target.value })
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label htmlFor="group_name" className="mb-1 block text-sm font-medium">
              Group (optional)
            </label>
            <input
              id="group_name"
              type="text"
              value={formData.group_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, group_name: e.target.value })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Production"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Server"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
