import { useState, useEffect } from "react";
import { Save, RotateCcw, Download, Upload, Database } from "lucide-react";
import type { AppSettings } from "@/lib/settings-types";
import { defaultSettings } from "@/lib/settings-types";

interface SettingsPanelProps {
  serverId?: string;
}

export function SettingsPanel({ serverId }: SettingsPanelProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [serverId]);

  async function loadSettings() {
    try {
      // In a real implementation, this would load from SQLite
      setSettings(defaultSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // In a real implementation, this would save to SQLite
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setSettings(defaultSettings);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Settings</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded border border-input px-3 py-2 text-sm hover:bg-accent"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium">SSH Defaults</h3>
          
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Default SSH Port</label>
            <input
              type="number"
              value={settings.default_ssh_port}
              onChange={(e) => setSettings({ ...settings, default_ssh_port: parseInt(e.target.value) || 22 })}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Auto-connect on startup</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.auto_connect}
                onChange={(e) => setSettings({ ...settings, auto_connect: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Enable auto-connect</span>
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium">Display</h3>
          
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Font Size</label>
            <input
              type="number"
              value={settings.font_size}
              onChange={(e) => setSettings({ ...settings, font_size: parseInt(e.target.value) || 14 })}
              min="10"
              max="24"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Compact Mode</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.compact_mode}
                onChange={(e) => setSettings({ ...settings, compact_mode: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Enable compact mode</span>
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Show Tooltips</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.show_tooltips}
                onChange={(e) => setSettings({ ...settings, show_tooltips: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Show tooltips on hover</span>
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium">Performance</h3>
          
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Polling Interval (seconds)</label>
            <input
              type="number"
              value={settings.polling_interval}
              onChange={(e) => setSettings({ ...settings, polling_interval: parseInt(e.target.value) || 30 })}
              min="5"
              max="300"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Max Terminal Lines</label>
            <input
              type="number"
              value={settings.max_terminal_lines}
              onChange={(e) => setSettings({ ...settings, max_terminal_lines: parseInt(e.target.value) || 1000 })}
              min="100"
              max="10000"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium">Data Management</h3>
          
          <div className="flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-2 rounded border border-input px-3 py-2 text-sm hover:bg-accent">
              <Download size={14} />
              Export Data
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded border border-input px-3 py-2 text-sm hover:bg-accent">
              <Upload size={14} />
              Import Data
            </button>
          </div>

          <div className="flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-2 rounded border border-input px-3 py-2 text-sm hover:bg-accent">
              <Database size={14} />
              Backup DB
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded border border-input px-3 py-2 text-sm hover:bg-accent">
              <Database size={14} />
              Restore DB
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
