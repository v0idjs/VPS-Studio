-- Server statistics for dashboard
CREATE TABLE IF NOT EXISTS server_stats (
    server_id TEXT PRIMARY KEY,
    hostname TEXT,
    os_name TEXT,
    os_version TEXT,
    kernel_version TEXT,
    uptime TEXT,
    cpu_usage REAL,
    memory_total INTEGER,
    memory_used INTEGER,
    memory_usage REAL,
    disk_total INTEGER,
    disk_used INTEGER,
    disk_usage REAL,
    load_average TEXT,
    network_in INTEGER,
    network_out INTEGER,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

-- Activity events for audit trail and dashboard
CREATE TABLE IF NOT EXISTS activity_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_events_server_id ON activity_events(server_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON activity_events(created_at DESC);
