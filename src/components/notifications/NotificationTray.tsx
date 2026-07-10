import { useState } from "react";
import { Bell, BellOff, Settings } from "lucide-react";

interface NotificationTrayProps {
  onOpenSettings?: () => void;
}

export function NotificationTray({ onOpenSettings }: NotificationTrayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [unreadCount] = useState(0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded p-2 hover:bg-accent"
        title="Notifications"
      >
        {notificationsEnabled ? (
          <Bell size={18} className="text-muted-foreground" />
        ) : (
          <BellOff size={18} className="text-muted-foreground" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border p-3">
              <span className="text-sm font-medium">Notifications</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className="rounded p-1 hover:bg-accent"
                  title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
                >
                  {notificationsEnabled ? (
                    <Bell size={14} className="text-muted-foreground" />
                  ) : (
                    <BellOff size={14} className="text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={onOpenSettings}
                  className="rounded p-1 hover:bg-accent"
                  title="Notification settings"
                >
                  <Settings size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-auto">
              {unreadCount === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {/* Notification items would go here */}
                </div>
              )}
            </div>

            <div className="border-t border-border p-2 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
