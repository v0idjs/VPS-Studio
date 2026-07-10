import { Search, Bell, Settings } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export function TopBar() {
  const { setActiveView, selectedServerId } = useAppStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search servers..."
            className="h-9 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => { if (selectedServerId) setActiveView("notifications"); }}
          disabled={!selectedServerId}
          className={`rounded-md p-2 hover:bg-accent ${!selectedServerId ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          onClick={() => { if (selectedServerId) setActiveView("settings"); }}
          disabled={!selectedServerId}
          className={`rounded-md p-2 hover:bg-accent ${!selectedServerId ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
