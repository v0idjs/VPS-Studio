import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle, Bell } from "lucide-react";
import type { NotificationEntry } from "@/lib/notification-types";

interface NotificationHistoryProps {
  serverId: string;
}

export function NotificationHistory({ serverId }: NotificationHistoryProps) {
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<NotificationEntry | null>(null);

  useEffect(() => {
    loadNotifications();
  }, [serverId]);

  async function loadNotifications() {
    setLoading(true);
    try {
      // In a real implementation, this would load from SQLite
      setNotifications([]);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Notification History</span>
        </div>
        <button onClick={loadNotifications} className="rounded p-1 hover:bg-accent" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No notifications</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="sticky top-0 flex items-center bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="w-8"></span>
              <span className="w-32">Time</span>
              <span className="flex-1">Message</span>
              <span className="w-16">Status</span>
            </div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => setSelectedNotification(notification)}
                className={`flex cursor-pointer items-center px-4 py-2 hover:bg-accent/50 ${
                  selectedNotification?.id === notification.id ? "bg-accent" : ""
                } ${!notification.read ? "bg-accent/20" : ""}`}
              >
                <span className="w-8">
                  {notification.severity === "error" ? (
                    <XCircle size={14} className="text-red-400" />
                  ) : (
                    <CheckCircle size={14} className="text-green-400" />
                  )}
                </span>
                <span className="w-32 truncate text-xs text-muted-foreground">
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
                <span className="flex-1 truncate text-sm">{notification.message}</span>
                <span className="w-16">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    notification.read ? "bg-gray-500/20 text-gray-400" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {notification.read ? "Read" : "New"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {notifications.length} notifications
        {selectedNotification && ` | Selected`}
      </div>
    </div>
  );
}
