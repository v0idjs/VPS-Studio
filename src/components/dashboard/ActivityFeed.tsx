import { useEffect } from "react";
import { Activity, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { getRecentActivity } from "@/hooks/use-ipc";
import type { ActivityEvent } from "@/lib/types";

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "server_online":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "server_offline":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "command_executed":
      return <Activity className="h-4 w-4 text-blue-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed() {
  const { recentActivity, setRecentActivity } = useAppStore();

  useEffect(() => {
    loadActivity();
    const interval = setInterval(loadActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadActivity() {
    try {
      const activity = await getRecentActivity(20);
      setRecentActivity(activity);
    } catch (error) {
      console.error("Failed to load activity:", error);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="font-semibold">Recent Activity</h2>
      </div>
      <div className="max-h-[400px] overflow-auto">
        {recentActivity.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No recent activity</div>
        ) : (
          <div className="divide-y divide-border">
            {recentActivity.map((event) => (
              <ActivityItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ event }: { event: ActivityEvent }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <ActivityIcon type={event.activity_type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{event.server_name}</span>
          <span className="text-muted-foreground"> — </span>
          {event.message}
        </p>
        <p className="text-xs text-muted-foreground">{formatTimestamp(event.created_at)}</p>
      </div>
    </div>
  );
}
