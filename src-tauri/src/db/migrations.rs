use rusqlite::Connection;

pub fn run_migrations(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );",
    )?;

    let current_version: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_version",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    if current_version < 1 {
        conn.execute_batch(include_str!("migrations/001_init.sql"))?;
        conn.execute("INSERT INTO schema_version (version) VALUES (1)", [])?;
    }

    if current_version < 2 {
        conn.execute_batch(include_str!("migrations/002_dashboard.sql"))?;
        conn.execute("INSERT INTO schema_version (version) VALUES (2)", [])?;
    }

    Ok(())
}
