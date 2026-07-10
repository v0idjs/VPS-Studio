-- VPS Studio Schema v1
-- All tables, indexes, and constraints

CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 22,
    username TEXT NOT NULL,
    auth_type TEXT NOT NULL CHECK (auth_type IN ('password', 'key', 'key_with_passphrase')),
    password_encrypted TEXT,
    private_key_encrypted TEXT,
    passphrase_encrypted TEXT,
    group_name TEXT,
    status TEXT NOT NULL DEFAULT 'unknown' CHECK (status IN ('online', 'offline', 'unknown', 'connecting')),
    last_connected_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS server_tags (
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (server_id, tag_id)
);

CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    server_ids TEXT DEFAULT '',
    color TEXT DEFAULT '#3b82f6',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS server_workspaces (
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    PRIMARY KEY (server_id, workspace_id)
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS snapshots (
    id TEXT PRIMARY KEY,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    hostname TEXT,
    os_name TEXT,
    os_version TEXT,
    kernel_version TEXT,
    uptime TEXT,
    cpu_summary TEXT,
    memory_summary TEXT,
    disk_summary TEXT,
    network_summary TEXT,
    load_average TEXT,
    mount_points TEXT,
    services TEXT,
    packages TEXT,
    docker_containers TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS snapshot_items (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS commands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    command_text TEXT NOT NULL,
    category_id TEXT REFERENCES command_categories(id) ON DELETE SET NULL,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    is_destructive INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS command_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS command_history (
    id TEXT PRIMARY KEY,
    command_id TEXT NOT NULL REFERENCES commands(id) ON DELETE CASCADE,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    command_text TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'error', 'cancelled')),
    exit_code INTEGER,
    duration_ms INTEGER,
    output_preview TEXT,
    executed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notification_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    event_type TEXT NOT NULL CHECK (event_type IN ('server_offline', 'server_online', 'high_cpu', 'low_disk', 'container_stopped', 'package_updates', 'snapshot_completed', 'command_failed')),
    threshold TEXT,
    condition TEXT DEFAULT '',
    server_ids TEXT DEFAULT '',
    is_enabled INTEGER NOT NULL DEFAULT 1,
    notify_desktop INTEGER NOT NULL DEFAULT 1,
    notify_sound INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notification_events (
    id TEXT PRIMARY KEY,
    rule_id TEXT NOT NULL REFERENCES notification_rules(id) ON DELETE CASCADE,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS file_bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS log_bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS execution_history (
    id TEXT PRIMARY KEY,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    command_text TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'error', 'cancelled')),
    exit_code INTEGER,
    duration_ms INTEGER,
    output_preview TEXT,
    executed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_servers_host ON servers(host, port, username);
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_server_tags_server ON server_tags(server_id);
CREATE INDEX IF NOT EXISTS idx_server_tags_tag ON server_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_server_workspaces_server ON server_workspaces(server_id);
CREATE INDEX IF NOT EXISTS idx_server_workspaces_workspace ON server_workspaces(workspace_id);
CREATE INDEX IF NOT EXISTS idx_commands_category ON commands(category_id);
CREATE INDEX IF NOT EXISTS idx_command_history_server ON command_history(server_id, executed_at);
CREATE INDEX IF NOT EXISTS idx_command_history_command ON command_history(command_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_server ON snapshots(server_id, created_at);
CREATE INDEX IF NOT EXISTS idx_snapshot_items_snapshot ON snapshot_items(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_notification_events_server ON notification_events(server_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_events_rule ON notification_events(rule_id);
CREATE INDEX IF NOT EXISTS idx_notes_server ON notes(server_id);
CREATE INDEX IF NOT EXISTS idx_file_bookmarks_server ON file_bookmarks(server_id);
CREATE INDEX IF NOT EXISTS idx_log_bookmarks_server ON log_bookmarks(server_id);
CREATE INDEX IF NOT EXISTS idx_execution_history_server ON execution_history(server_id, executed_at);

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('theme', 'dark'),
    ('terminal_font_size', '14'),
    ('refresh_interval', '30'),
    ('ssh_timeout', '10'),
    ('snapshot_frequency', 'null'),
    ('notification_cpu_threshold', '90'),
    ('notification_disk_threshold', '10');
