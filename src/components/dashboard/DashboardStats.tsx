import { useEffect } from "react";
import { Server, Cpu } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { getDashboardData } from "@/hooks/use-ipc";

export function DashboardStats() {
  const { dashboardStats, setDashboardStats, setRecentActivity, setServerStats } = useAppStore();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    try {
      const data = await getDashboardData();
      setDashboardStats(data.total_servers, data.online_servers, data.offline_servers);
      setRecentActivity(data.recent_activity);
      data.servers.forEach((stats) => {
        setServerStats(stats.server_id, stats);
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<Server className="h-5 w-5 text-blue-500" />}
        label="Total Servers"
        value={dashboardStats.total}
      />
      <StatCard
        icon={<div className="h-2.5 w-2.5 rounded-full bg-green-500" />}
        label="Online"
        value={dashboardStats.online}
      />
      <StatCard
        icon={<div className="h-2.5 w-2.5 rounded-full bg-red-500" />}
        label="Offline"
        value={dashboardStats.offline}
      />
      <StatCard
        icon={<Cpu className="h-5 w-5 text-purple-500" />}
        label="Avg CPU"
        value={`${calculateAverageCpu()}%`}
      />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function calculateAverageCpu(): number {
  const stats = useAppStore.getState().serverStats;
  const values = Object.values(stats)
    .map((s) => s.cpu_usage)
    .filter((v): v is number => v !== null);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
