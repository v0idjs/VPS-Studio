
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useAppStore } from "@/stores/app-store";

interface ChartDataPoint {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
}

export function ResourceCharts() {
  const { serverStats } = useAppStore();

  const chartData: ChartDataPoint[] = Object.entries(serverStats).map(([_, stats]) => ({
    time: new Date(stats.updated_at).toLocaleTimeString(),
    cpu: stats.cpu_usage ?? 0,
    memory: stats.memory_usage ?? 0,
    disk: stats.disk_usage ?? 0,
  }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">Resource Usage</h2>
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          No server data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">CPU Usage</h2>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">Memory Usage</h2>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="memory" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">Disk Usage</h2>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="disk" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
