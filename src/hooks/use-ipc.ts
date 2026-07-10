import { invoke } from "@tauri-apps/api/core";
import type { Server, AddServerInput, UpdateServerInput, ServerStats, ActivityEvent, DashboardOverview, TerminalSession } from "@/lib/types";
import type { FileInfo, FileBookmark } from "@/lib/file-types";
import type { ProcessInfo } from "@/lib/process-types";
import type { ServiceInfo } from "@/lib/service-types";
import type { DockerContainer, DockerImage } from "@/lib/docker-types";
import type { PackageInfo } from "@/lib/package-types";
import type { CronJob } from "@/lib/cron-types";
import type { SSHKey } from "@/lib/ssh-key-types";
import type { FirewallRule } from "@/lib/firewall-types";
import type { LogEntry } from "@/lib/log-types";
import type { Snapshot, SnapshotComparison } from "@/lib/snapshot-types";
import type { Command, CommandCategory } from "@/lib/command-types";
import type { NotificationRule } from "@/lib/notification-types";
import type { Workspace } from "@/lib/workspace-types";

export async function addServer(input: AddServerInput): Promise<Server> {
  return invoke<Server>("add_server", { input });
}

export async function updateServer(input: UpdateServerInput): Promise<Server> {
  return invoke<Server>("update_server", { input });
}

export async function deleteServer(id: string): Promise<void> {
  return invoke<void>("delete_server", { id });
}

export async function listServers(): Promise<Server[]> {
  return invoke<Server[]>("list_servers");
}

export async function searchServers(query: string): Promise<Server[]> {
  return invoke<Server[]>("search_servers", { query });
}

export async function testServerConnection(id: string): Promise<boolean> {
  return invoke<boolean>("test_server_connection", { id });
}

export async function getServer(id: string): Promise<Server> {
  return invoke<Server>("get_server", { id });
}

export async function getServerStatus(id: string): Promise<string> {
  return invoke<string>("get_server_status", { id });
}

export async function getServerStats(serverId: string): Promise<ServerStats> {
  return invoke<ServerStats>("get_server_stats", { serverId });
}

export async function getRecentActivity(limit?: number): Promise<ActivityEvent[]> {
  return invoke<ActivityEvent[]>("get_recent_activity", { limit });
}

export async function getServerActivity(serverId: string, limit?: number): Promise<ActivityEvent[]> {
  return invoke<ActivityEvent[]>("get_server_activity", { serverId, limit });
}

export async function getDashboardData(): Promise<DashboardOverview> {
  return invoke<DashboardOverview>("get_dashboard_data");
}

export async function insertActivityEvent(
  serverId: string,
  activityType: string,
  message: string
): Promise<void> {
  return invoke<void>("insert_activity_event", { serverId, activityType, message });
}

export async function createTerminalSession(serverId: string): Promise<TerminalSession> {
  return invoke<TerminalSession>("create_terminal_session", { input: { serverId } });
}

export async function closeTerminalSession(sessionId: string): Promise<void> {
  return invoke<void>("close_terminal_session", { sessionId });
}

export async function listTerminalSessions(): Promise<TerminalSession[]> {
  return invoke<TerminalSession[]>("list_terminal_sessions");
}

export async function sendTerminalInput(sessionId: string, data: string): Promise<void> {
  return invoke<void>("send_terminal_input", { sessionId, data });
}

export async function resizeTerminal(sessionId: string, cols: number, rows: number): Promise<void> {
  return invoke<void>("resize_terminal", { sessionId, cols, rows });
}

export async function listDirectory(serverId: string, path: string): Promise<FileInfo[]> {
  return invoke<FileInfo[]>("list_directory", { input: { serverId, path } });
}

export async function readFile(input: { server_id: string; source_path: string }): Promise<string> {
  return invoke<string>("read_file", { input });
}

export async function writeFile(input: { server_id: string; path: string; content: string }): Promise<void> {
  return invoke<void>("write_file", { input });
}

export async function deleteFile(input: { server_id: string; source_path: string }): Promise<void> {
  return invoke<void>("delete_file", { input });
}

export async function renameFile(input: { server_id: string; source_path: string; dest_path: string }): Promise<void> {
  return invoke<void>("rename_file", { input });
}

export async function createDirectory(input: { server_id: string; source_path: string }): Promise<void> {
  return invoke<void>("create_directory", { input });
}

export async function downloadFile(input: { server_id: string; source_path: string }): Promise<number[]> {
  return invoke<number[]>("download_file", { input });
}

export async function uploadFile(input: { server_id: string; path: string; content: string }): Promise<void> {
  return invoke<void>("upload_file", { input });
}

export async function getFileBookmarks(serverId: string): Promise<FileBookmark[]> {
  return invoke<FileBookmark[]>("get_file_bookmarks", { serverId });
}

export async function addFileBookmark(input: { server_id: string; path: string; name: string }): Promise<FileBookmark> {
  return invoke<FileBookmark>("add_file_bookmark", { input });
}

export async function removeFileBookmark(id: number): Promise<void> {
  return invoke<void>("remove_file_bookmark", { id });
}

export async function list_processes(serverId: string): Promise<ProcessInfo[]> {
  return invoke<ProcessInfo[]>("list_processes", { input: { server_id: serverId } });
}

export async function kill_process(input: { server_id: string; pid: number; signal?: string }): Promise<void> {
  return invoke<void>("kill_process", { input });
}

export async function list_services(input: { server_id: string; filter?: string }): Promise<ServiceInfo[]> {
  return invoke<ServiceInfo[]>("list_services", { input });
}

export async function service_action(input: { server_id: string; service_name: string; action: string }): Promise<void> {
  return invoke<void>("service_action", { input });
}

export async function get_service_logs(input: { server_id: string; filter?: string }, service_name: string, lines?: number): Promise<string> {
  return invoke<string>("get_service_logs", { input, service_name, lines });
}

export async function list_docker_containers(input: { server_id: string }): Promise<DockerContainer[]> {
  return invoke<DockerContainer[]>("list_docker_containers", { input });
}

export async function list_docker_images(input: { server_id: string }): Promise<DockerImage[]> {
  return invoke<DockerImage[]>("list_docker_images", { input });
}

export async function docker_container_action(input: { server_id: string; container_id?: string }): Promise<void> {
  return invoke<void>("docker_container_action", { input });
}

export async function docker_stop_container(input: { server_id: string; container_id?: string }): Promise<void> {
  return invoke<void>("docker_stop_container", { input });
}

export async function docker_restart_container(input: { server_id: string; container_id?: string }): Promise<void> {
  return invoke<void>("docker_restart_container", { input });
}

export async function docker_remove_container(input: { server_id: string; container_id?: string }): Promise<void> {
  return invoke<void>("docker_remove_container", { input });
}

export async function docker_pull_image(input: { server_id: string; image_name?: string }): Promise<void> {
  return invoke<void>("docker_pull_image", { input });
}

export async function docker_remove_image(input: { server_id: string; image_name?: string }): Promise<void> {
  return invoke<void>("docker_remove_image", { input });
}

export async function docker_get_logs(input: { server_id: string; container_id?: string }, lines?: number): Promise<string> {
  return invoke<string>("docker_get_logs", { input, lines });
}

export async function list_packages(input: { server_id: string; filter?: string }): Promise<PackageInfo[]> {
  return invoke<PackageInfo[]>("list_packages", { input });
}

export async function search_packages(input: { server_id: string; filter?: string }): Promise<PackageInfo[]> {
  return invoke<PackageInfo[]>("search_packages", { input });
}

export async function install_package(input: { server_id: string; package_name: string }): Promise<void> {
  return invoke<void>("install_package", { input });
}

export async function remove_package(input: { server_id: string; package_name: string }): Promise<void> {
  return invoke<void>("remove_package", { input });
}

export async function list_cron_jobs(input: { server_id: string }): Promise<CronJob[]> {
  return invoke<CronJob[]>("list_cron_jobs", { input });
}

export async function add_cron_job(input: { server_id: string; schedule: string; command: string }): Promise<void> {
  return invoke<void>("add_cron_job", { input });
}

export async function remove_cron_job(input: { server_id: string; job_id: string }): Promise<void> {
  return invoke<void>("remove_cron_job", { input });
}

export async function list_ssh_keys(input: { server_id: string }): Promise<SSHKey[]> {
  return invoke<SSHKey[]>("list_ssh_keys", { input });
}

export async function generate_ssh_key(input: { server_id: string; key_name?: string; key_type?: string; key_bits?: number }): Promise<SSHKey> {
  return invoke<SSHKey>("generate_ssh_key", { input });
}

export async function import_ssh_key(input: { server_id: string; key_name?: string; public_key?: string }): Promise<SSHKey> {
  return invoke<SSHKey>("import_ssh_key", { input });
}

export async function export_ssh_key(input: { server_id: string; key_name?: string }): Promise<string> {
  return invoke<string>("export_ssh_key", { input });
}

export async function delete_ssh_key(input: { server_id: string; key_name?: string }): Promise<void> {
  return invoke<void>("delete_ssh_key", { input });
}

export async function list_firewall_rules(input: { server_id: string }): Promise<FirewallRule[]> {
  return invoke<FirewallRule[]>("list_firewall_rules", { input });
}

export async function add_firewall_rule(input: { server_id: string; port?: string; protocol?: string; from_ip?: string }): Promise<void> {
  return invoke<void>("add_firewall_rule", { input });
}

export async function delete_firewall_rule(input: { server_id: string; rule_number?: number }): Promise<void> {
  return invoke<void>("delete_firewall_rule", { input });
}

export async function enable_firewall(input: { server_id: string }): Promise<void> {
  return invoke<void>("enable_firewall", { input });
}

export async function disable_firewall(input: { server_id: string }): Promise<void> {
  return invoke<void>("disable_firewall", { input });
}

export async function read_logs(input: { server_id: string; source?: string; level?: string; lines?: number; search?: string }): Promise<LogEntry[]> {
  return invoke<LogEntry[]>("read_logs", { input });
}

export async function create_snapshot(input: { server_id: string; snapshot_name?: string }): Promise<Snapshot> {
  return invoke<Snapshot>("create_snapshot", { input });
}

export async function compare_snapshots(input: { server_id: string; snapshot_id?: string }): Promise<SnapshotComparison> {
  return invoke<SnapshotComparison>("compare_snapshots", { input });
}

export async function list_commands(input: { server_id: string }): Promise<Command[]> {
  return invoke<Command[]>("list_commands", { input });
}

export async function save_command(input: { server_id: string; command_name?: string; command_text?: string; description?: string; category?: string; tags?: string[] }): Promise<Command> {
  return invoke<Command>("save_command", { input });
}

export async function delete_command(input: { server_id: string; command_name?: string }): Promise<void> {
  return invoke<void>("delete_command", { input });
}

export async function execute_command(input: { server_id: string; command_text?: string }): Promise<[string, boolean, number]> {
  return invoke<[string, boolean, number]>("execute_command", { input });
}

export async function list_command_categories(input: { server_id: string }): Promise<CommandCategory[]> {
  return invoke<CommandCategory[]>("list_command_categories", { input });
}

export async function list_notification_rules(input: { server_id: string }): Promise<NotificationRule[]> {
  return invoke<NotificationRule[]>("list_notification_rules", { input });
}

export async function save_notification_rule(input: { server_id: string; rule_name?: string; event_type?: string; condition?: string; server_ids?: string[]; enabled?: boolean }): Promise<NotificationRule> {
  return invoke<NotificationRule>("save_notification_rule", { input });
}

export async function delete_notification_rule(input: { server_id: string; rule_name?: string }): Promise<void> {
  return invoke<void>("delete_notification_rule", { input });
}

export async function trigger_notification(input: { server_id: string }): Promise<void> {
  return invoke<void>("trigger_notification", { input });
}

export async function list_workspaces(input: { server_id: string }): Promise<Workspace[]> {
  return invoke<Workspace[]>("list_workspaces", { input });
}

export async function save_workspace(input: { server_id: string; workspace_name?: string; description?: string; server_ids?: string[]; color?: string }): Promise<Workspace> {
  return invoke<Workspace>("save_workspace", { input });
}

export async function delete_workspace(input: { server_id: string; workspace_name?: string }): Promise<void> {
  return invoke<void>("delete_workspace", { input });
}

export async function assign_server_to_workspace(input: { server_id: string; workspace_name?: string; server_ids?: string[] }): Promise<void> {
  return invoke<void>("assign_server_to_workspace", { input });
}
