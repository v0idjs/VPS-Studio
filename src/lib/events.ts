import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export type TerminalDataEvent = {
  sessionId: string;
  data: string;
};

export type NotificationEvent = {
  id: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
};

export type ServerStatusEvent = {
  serverId: string;
  status: "online" | "offline" | "unknown" | "error";
};

export async function listenTerminalData(
  sessionId: string,
  callback: (data: string) => void
): Promise<UnlistenFn> {
  return listen<TerminalDataEvent>(`terminal:data:${sessionId}`, (event) => {
    callback(event.payload.data);
  });
}

export async function listenNotification(
  callback: (notification: NotificationEvent) => void
): Promise<UnlistenFn> {
  return listen<NotificationEvent>("notification", (event) => {
    callback(event.payload);
  });
}

export async function listenServerStatus(
  serverId: string,
  callback: (status: ServerStatusEvent["status"]) => void
): Promise<UnlistenFn> {
  return listen<ServerStatusEvent>(`server:status:${serverId}`, (event) => {
    callback(event.payload.status);
  });
}

export async function listenAllServerStatus(
  callback: (event: ServerStatusEvent) => void
): Promise<UnlistenFn> {
  return listen<ServerStatusEvent>("server:status", (event) => {
    callback(event.payload);
  });
}
