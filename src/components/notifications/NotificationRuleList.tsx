import { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2, Bell, BellOff, BellRing } from "lucide-react";
import type { NotificationRule } from "@/lib/notification-types";
import { list_notification_rules, delete_notification_rule } from "@/hooks/use-ipc";

interface NotificationRuleListProps {
  serverId: string;
  onAdd?: () => void;
  onEdit?: (rule: NotificationRule) => void;
}

export function NotificationRuleList({ serverId, onAdd, onEdit }: NotificationRuleListProps) {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);

  useEffect(() => {
    loadRules();
  }, [serverId]);

  async function loadRules() {
    setLoading(true);
    try {
      const data = await list_notification_rules({ server_id: serverId });
      setRules(data);
    } catch (error) {
      console.error("Failed to load notification rules:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(rule: NotificationRule) {
    if (!confirm(`Delete rule: ${rule.name}?`)) return;
    try {
      await delete_notification_rule({ server_id: serverId, rule_name: rule.name });
      await loadRules();
    } catch (error) {
      console.error("Failed to delete rule:", error);
    }
  }

  function getEventIcon(eventType: string) {
    switch (eventType) {
      case "server_down": return <BellOff size={14} className="text-red-400" />;
      case "high_cpu": return <BellRing size={14} className="text-yellow-400" />;
      case "high_memory": return <BellRing size={14} className="text-orange-400" />;
      case "disk_full": return <BellRing size={14} className="text-red-400" />;
      default: return <Bell size={14} className="text-muted-foreground" />;
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Notification Rules</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadRules} className="rounded p-1 hover:bg-accent" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={onAdd} className="rounded p-1 hover:bg-accent" title="Add rule">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && rules.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No notification rules</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-8"></span>
              <span className="flex-1">Name</span>
              <span className="w-24">Event</span>
              <span className="w-16">Status</span>
              <span className="w-20">Actions</span>
            </div>
            {rules.map((rule) => (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedRule?.id === rule.id ? "bg-accent" : ""
                }`}
              >
                <span className="w-8">{getEventIcon(rule.event_type)}</span>
                <span className="flex-1 truncate text-sm font-medium">{rule.name}</span>
                <span className="w-24 truncate text-xs text-muted-foreground">{rule.event_type}</span>
                <span className="w-16">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    rule.enabled ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                  }`}>
                    {rule.enabled ? "On" : "Off"}
                  </span>
                </span>
                <div className="flex w-20 gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit?.(rule); }}
                    className="rounded p-1 text-muted-foreground hover:bg-accent"
                    title="Edit"
                  >
                    <Bell size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(rule); }}
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
        {rules.length} rules
        {selectedRule && ` | Selected: ${selectedRule.name}`}
      </div>
    </div>
  );
}
