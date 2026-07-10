import { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2, Shield } from "lucide-react";
import type { FirewallRule } from "@/lib/firewall-types";
import { list_firewall_rules, delete_firewall_rule } from "@/hooks/use-ipc";

interface FirewallRuleListProps {
  serverId: string;
  onAdd?: () => void;
  onEdit?: (rule: FirewallRule) => void;
}

export function FirewallRuleList({ serverId, onAdd }: FirewallRuleListProps) {
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<FirewallRule | null>(null);

  useEffect(() => {
    loadRules();
  }, [serverId]);

  async function loadRules() {
    setLoading(true);
    try {
      const data = await list_firewall_rules({ server_id: serverId });
      setRules(data);
    } catch (error) {
      console.error("Failed to load firewall rules:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(rule: FirewallRule) {
    if (!confirm(`Delete rule #${rule.number}?`)) return;
    try {
      await delete_firewall_rule({ server_id: serverId, rule_number: rule.number });
      await loadRules();
    } catch (error) {
      console.error("Failed to delete rule:", error);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Firewall Rules</span>
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
          <div className="p-8 text-center text-muted-foreground">No firewall rules</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-12">#</span>
              <span className="w-20">Action</span>
              <span className="w-20">Protocol</span>
              <span className="flex-1">Port</span>
              <span className="w-24">From</span>
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
                <span className="w-12 text-sm text-muted-foreground">{rule.number}</span>
                <span className="w-20">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    rule.action === "ALLOW" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {rule.action}
                  </span>
                </span>
                <span className="w-20 text-sm text-muted-foreground">{rule.protocol}</span>
                <span className="flex-1 font-mono text-sm">{rule.port}</span>
                <span className="w-24 truncate text-sm text-muted-foreground">{rule.from_ip}</span>
                <div className="flex w-20 gap-1">
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
        {selectedRule && ` | Selected: Rule #${selectedRule.number}`}
      </div>
    </div>
  );
}
