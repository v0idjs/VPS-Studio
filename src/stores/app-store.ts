import { create } from "zustand";
import type { Server, Settings, ServerStats, ActivityEvent, TerminalSession } from "@/lib/types";

interface AppState {
  servers: Server[];
  selectedServerId: string | null;
  activeView: string;
  settings: Settings;
  sidebarCollapsed: boolean;
  serverStats: Record<string, ServerStats>;
  recentActivity: ActivityEvent[];
  dashboardStats: {
    total: number;
    online: number;
    offline: number;
  };
  terminalSessions: TerminalSession[];

  setServers: (servers: Server[]) => void;
  addServer: (server: Server) => void;
  updateServer: (server: Server) => void;
  removeServer: (id: string) => void;
  selectServer: (id: string | null) => void;
  setActiveView: (view: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  toggleSidebar: () => void;
  setServerStats: (serverId: string, stats: ServerStats) => void;
  setRecentActivity: (activity: ActivityEvent[]) => void;
  setDashboardStats: (total: number, online: number, offline: number) => void;
  addTerminalSession: (session: TerminalSession) => void;
  removeTerminalSession: (sessionId: string) => void;
  setTerminalSessions: (sessions: TerminalSession[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  servers: [],
  selectedServerId: null,
  activeView: "servers",
  settings: {
    theme: "dark",
    terminal_font_size: 14,
    terminal_font_family: "Fira Code",
    dashboard_refresh_interval: 30,
    notification_enabled: true,
  },
  sidebarCollapsed: false,
  serverStats: {},
  recentActivity: [],
  dashboardStats: { total: 0, online: 0, offline: 0 },

  setServers: (servers) => set({ servers }),

  addServer: (server) =>
    set((state) => ({ servers: [...state.servers, server] })),

  updateServer: (server) =>
    set((state) => ({
      servers: state.servers.map((s) => (s.id === server.id ? server : s)),
    })),

  removeServer: (id) =>
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== id),
      selectedServerId: state.selectedServerId === id ? null : state.selectedServerId,
    })),

  selectServer: (id) => set({ selectedServerId: id }),

  setActiveView: (view) => set({ activeView: view }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setServerStats: (serverId, stats) =>
    set((state) => ({
      serverStats: { ...state.serverStats, [serverId]: stats },
    })),

  setRecentActivity: (activity) => set({ recentActivity: activity }),

  setDashboardStats: (total, online, offline) =>
    set({ dashboardStats: { total, online, offline } }),

  terminalSessions: [],

  addTerminalSession: (session) =>
    set((state) => ({
      terminalSessions: [...state.terminalSessions, session],
    })),

  removeTerminalSession: (sessionId) =>
    set((state) => ({
      terminalSessions: state.terminalSessions.filter((s) => s.id !== sessionId),
    })),

  setTerminalSessions: (sessions) => set({ terminalSessions: sessions }),
}));
