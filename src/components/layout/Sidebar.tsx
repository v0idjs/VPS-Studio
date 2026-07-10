import { Server, Terminal, Folder, Play, Package, Clock, Shield, Key, FileText, Camera, Layers, Bell, Settings2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

const menuItems = [
  { icon: Server, label: "Servers", id: "servers" },
  { icon: Terminal, label: "Terminal", id: "terminal" },
  { icon: Folder, label: "Files", id: "files" },
  { icon: Play, label: "Processes", id: "processes" },
  { icon: Package, label: "Docker", id: "docker" },
  { icon: Clock, label: "Cron", id: "cron" },
  { icon: Shield, label: "Firewall", id: "firewall" },
  { icon: Key, label: "SSH Keys", id: "ssh-keys" },
  { icon: FileText, label: "Logs", id: "logs" },
  { icon: Camera, label: "Snapshots", id: "snapshots" },
  { icon: Layers, label: "Workspaces", id: "workspaces" },
  { icon: Bell, label: "Notifications", id: "notifications" },
  { icon: Settings2, label: "Settings", id: "settings" },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, activeView, setActiveView, selectedServerId, selectServer } = useAppStore();

  function handleNav(id: string) {
    if (id === "servers") {
      selectServer(null);
      setActiveView("servers");
    } else if (selectedServerId) {
      setActiveView(id);
    }
  }

  return (
    <aside
      className={`flex flex-col border-r border-border bg-card transition-all duration-200 ${
        sidebarCollapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!sidebarCollapsed && (
          <span className="text-lg font-semibold">VPS Studio</span>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1 hover:bg-accent"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const disabled = item.id !== "servers" && !selectedServerId;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              disabled={disabled}
              className={`flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "hover:bg-accent"
              } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
