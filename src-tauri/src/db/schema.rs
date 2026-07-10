pub const SCHEMA_VERSION: i32 = 1;

pub const CREATE_SERVERS: &str = "CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 22,
    username TEXT NOT NULL,
    auth_type TEXT NOT NULL,
    password_encrypted TEXT,
    private_key_encrypted TEXT,
    passphrase_encrypted TEXT,
    group_name TEXT,
    status TEXT NOT NULL DEFAULT 'unknown',
    last_connected_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(host, port, username)
)";
