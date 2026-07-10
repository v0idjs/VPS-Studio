import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Server, ServerStats } from "@/lib/types";
import { getServerStats, createTerminalSession, listTerminalSessions, closeTerminalSession } from "@/hooks/use-ipc";
import { ServerOverviewCard, ActivityFeed, ResourceCharts } from "@/components/dashboard";
import { TerminalTabs } from "@/components/terminal";
import { FileExplorer, FileEditor } from "@/components/files";
import { ProcessList, ProcessDetail } from "@/components/processes";
import { ServiceList, ServiceDetail } from "@/components/services";
import { DockerDashboard } from "@/components/docker";
import { PackageList } from "@/components/packages";
import { SSHKeyList } from "@/components/ssh-keys";
import { FirewallRuleList } from "@/components/firewall";
import { LogViewer } from "@/components/logs";
import { SnapshotList } from "@/components/snapshots";
import { CommandLibrary } from "@/components/commands";
import { NotificationRuleList } from "@/components/notifications";
import { WorkspaceList } from "@/components/workspaces";
import { SettingsPanel } from "@/components/settings";
import { useAppStore } from "@/stores/app-store";
import type { FileInfo } from "@/lib/file-types";
import type { ProcessInfo } from "@/lib/process-types";
import type { ServiceInfo } from "@/lib/service-types";
import { StatusIcon } from "@/components/common/StatusIcon";

interface ServerDetailProps {
  server: Server;
  onBack: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

type Tab = "dashboard" | "terminal" | "files" | "processes" | "services" | "docker" | "packages" | "ssh-keys" | "firewall" | "logs" | "snapshots" | "commands" | "notifications" | "workspaces" | "settings";

const tabs: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "terminal", label: "Terminal" },
  { id: "files", label: "Files" },
  { id: "processes", label: "Processes" },
  { id: "services", label: "Services" },
  { id: "docker", label: "Docker" },
  { id: "packages", label: "Packages" },
  { id: "ssh-keys", label: "SSH Keys" },
  { id: "firewall", label: "Firewall" },
  { id: "logs", label: "Logs" },
  { id: "snapshots", label: "Snapshots" },
  { id: "commands", label: "Commands" },
  { id: "notifications", label: "Notifications" },
  { id: "workspaces", label: "Workspaces" },
  { id: "settings", label: "Settings" },
];

export function ServerDetail({ server, onBack, activeTab, onTabChange }: ServerDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{server.name}</h1>
          <div className="flex items-center gap-1">
            <StatusIcon status={server.status} />
            <span className="text-sm text-muted-foreground">{server.status}</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {server.username}@{server.host}:{server.port}
        {server.group_name && (
          <span className="ml-2 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
            {server.group_name}
          </span>
        )}
      </div>

      <div className="border-b border-border">
        <nav className="flex gap-1" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-background text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[400px] rounded-lg border border-border bg-card p-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Server Dashboard</h2>
            <DashboardTab serverId={server.id} />
          </div>
        )}
        {activeTab === "terminal" && (
          <TerminalTab serverId={server.id} />
        )}
        {activeTab === "files" && (
          <FilesTab serverId={server.id} />
        )}
        {activeTab === "processes" && (
          <ProcessesTab serverId={server.id} />
        )}
        {activeTab === "services" && (
          <ServicesTab serverId={server.id} />
        )}
        {activeTab === "docker" && (
          <div className="h-[500px]">
            <DockerDashboard serverId={server.id} />
          </div>
        )}
        {activeTab === "packages" && (
          <div className="h-[500px]">
            <PackageList serverId={server.id} />
          </div>
        )}
        {activeTab === "ssh-keys" && (
          <div className="h-[500px]">
            <SSHKeyList serverId={server.id} />
          </div>
        )}
        {activeTab === "firewall" && (
          <div className="h-[500px]">
            <FirewallRuleList serverId={server.id} />
          </div>
        )}
        {activeTab === "logs" && (
          <div className="h-[500px]">
            <LogViewer serverId={server.id} />
          </div>
        )}
        {activeTab === "snapshots" && (
          <div className="h-[500px]">
            <SnapshotList serverId={server.id} />
          </div>
        )}
        {activeTab === "commands" && (
          <div className="h-[500px]">
            <CommandLibrary serverId={server.id} />
          </div>
        )}
        {activeTab === "notifications" && (
          <div className="h-[500px]">
            <NotificationRuleList serverId={server.id} />
          </div>
        )}
        {activeTab === "workspaces" && (
          <div className="h-[500px]">
            <WorkspaceList serverId={server.id} />
          </div>
        )}
        {activeTab === "settings" && (
          <SettingsPanel serverId={server.id} />
        )}
      </div>
    </div>
  );
}

function DashboardTab({ serverId }: { serverId: string }) {
  const [stats, setStats] = useState<ServerStats | null>(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [serverId]);

  async function loadStats() {
    try {
      const data = await getServerStats(serverId);
      setStats(data);
    } catch (error) {
      console.error("Failed to load server stats:", error);
    }
  }

  return (
    <div className="space-y-6">
      {stats ? (
        <ServerOverviewCard
          stats={stats}
          serverName=""
          onClick={() => {}}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
          Loading server stats...
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed />
        <ResourceCharts />
      </div>
    </div>
  );
}

function TerminalTab({ serverId }: { serverId: string }) {
  const { terminalSessions, addTerminalSession, removeTerminalSession, setTerminalSessions } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const sessions = await listTerminalSessions();
      setTerminalSessions(sessions);
    } catch (error) {
      console.error("Failed to load terminal sessions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleNewSession() {
    try {
      const session = await createTerminalSession(serverId);
      addTerminalSession(session);
    } catch (error) {
      console.error("Failed to create terminal session:", error);
    }
  }

  async function handleCloseSession(sessionId: string) {
    try {
      await closeTerminalSession(sessionId);
      removeTerminalSession(sessionId);
    } catch (error) {
      console.error("Failed to close terminal session:", error);
    }
  }

  const serverSessions = terminalSessions.filter((s) => s.server_id === serverId);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading terminal sessions...</p>
      </div>
    );
  }

  return (
    <div className="h-[500px]">
      <TerminalTabs
        sessions={serverSessions}
        onNewSession={handleNewSession}
        onCloseSession={handleCloseSession}
      />
    </div>
  );
}

function FilesTab({ serverId }: { serverId: string }) {
  const [editingFile, setEditingFile] = useState<FileInfo | null>(null);

  return (
    <div className="h-[500px]">
      {editingFile ? (
        <FileEditor
          serverId={serverId}
          filePath={editingFile.path}
          onClose={() => setEditingFile(null)}
        />
      ) : (
        <FileExplorer
          serverId={serverId}
          onFileDoubleClick={(file) => {
            if (!file.is_dir) {
              setEditingFile(file);
            }
          }}
        />
      )}
    </div>
  );
}

function ProcessesTab({ serverId }: { serverId: string }) {
  const [selectedProcess, setSelectedProcess] = useState<ProcessInfo | null>(null);

  return (
    <div className="h-[500px]">
      {selectedProcess ? (
        <ProcessDetail
          process={selectedProcess}
          onClose={() => setSelectedProcess(null)}
        />
      ) : (
        <ProcessList
          serverId={serverId}
          onSelectProcess={setSelectedProcess}
        />
      )}
    </div>
  );
}

function ServicesTab({ serverId }: { serverId: string }) {
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null);

  return (
    <div className="h-[500px]">
      {selectedService ? (
        <ServiceDetail
          service={selectedService}
          serverId={serverId}
          onClose={() => setSelectedService(null)}
        />
      ) : (
        <ServiceList
          serverId={serverId}
          onSelectService={setSelectedService}
        />
      )}
    </div>
  );
}
