use rusqlite::Connection;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ServerStats {
    pub server_id: String,
    pub hostname: Option<String>,
    pub os_name: Option<String>,
    pub os_version: Option<String>,
    pub kernel_version: Option<String>,
    pub uptime: Option<String>,
    pub cpu_usage: Option<f64>,
    pub memory_total: Option<u64>,
    pub memory_used: Option<u64>,
    pub memory_usage: Option<f64>,
    pub disk_total: Option<u64>,
    pub disk_used: Option<u64>,
    pub disk_usage: Option<f64>,
    pub load_average: Option<String>,
    pub network_in: Option<u64>,
    pub network_out: Option<u64>,
    pub updated_at: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RecentActivity {
    pub id: i64,
    pub server_id: String,
    pub server_name: String,
    pub activity_type: String,
    pub message: String,
    pub created_at: String,
}

pub fn get_server_stats(conn: &Connection, server_id: &str) -> Result<ServerStats, rusqlite::Error> {
    conn.query_row(
        "SELECT server_id, hostname, os_name, os_version, kernel_version, uptime,
                cpu_usage, memory_total, memory_used, memory_usage,
                disk_total, disk_used, disk_usage, load_average,
                network_in, network_out, updated_at
         FROM server_stats WHERE server_id = ?1",
        rusqlite::params![server_id],
        |row| {
            Ok(ServerStats {
                server_id: row.get(0)?,
                hostname: row.get(1)?,
                os_name: row.get(2)?,
                os_version: row.get(3)?,
                kernel_version: row.get(4)?,
                uptime: row.get(5)?,
                cpu_usage: row.get(6)?,
                memory_total: row.get(7)?,
                memory_used: row.get(8)?,
                memory_usage: row.get(9)?,
                disk_total: row.get(10)?,
                disk_used: row.get(11)?,
                disk_usage: row.get(12)?,
                load_average: row.get(13)?,
                network_in: row.get(14)?,
                network_out: row.get(15)?,
                updated_at: row.get(16)?,
            })
        },
    )
}

pub fn upsert_server_stats(
    conn: &Connection,
    stats: &ServerStats,
) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO server_stats (server_id, hostname, os_name, os_version, kernel_version, uptime,
                                   cpu_usage, memory_total, memory_used, memory_usage,
                                   disk_total, disk_used, disk_usage, load_average,
                                   network_in, network_out, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)
         ON CONFLICT(server_id) DO UPDATE SET
             hostname = excluded.hostname, os_name = excluded.os_name,
             os_version = excluded.os_version, kernel_version = excluded.kernel_version,
             uptime = excluded.uptime, cpu_usage = excluded.cpu_usage,
             memory_total = excluded.memory_total, memory_used = excluded.memory_used,
             memory_usage = excluded.memory_usage, disk_total = excluded.disk_total,
             disk_used = excluded.disk_used, disk_usage = excluded.disk_usage,
             load_average = excluded.load_average, network_in = excluded.network_in,
             network_out = excluded.network_out, updated_at = excluded.updated_at",
        rusqlite::params![
            stats.server_id,
            stats.hostname,
            stats.os_name,
            stats.os_version,
            stats.kernel_version,
            stats.uptime,
            stats.cpu_usage,
            stats.memory_total,
            stats.memory_used,
            stats.memory_usage,
            stats.disk_total,
            stats.disk_used,
            stats.disk_usage,
            stats.load_average,
            stats.network_in,
            stats.network_out,
            stats.updated_at,
        ],
    )?;
    Ok(())
}

pub fn get_recent_activity(
    conn: &Connection,
    limit: i64,
) -> Result<Vec<RecentActivity>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT ae.id, ae.server_id, s.name as server_name, ae.activity_type, ae.message, ae.created_at
         FROM activity_events ae
         JOIN servers s ON ae.server_id = s.id
         ORDER BY ae.created_at DESC
         LIMIT ?1",
    )?;

    let activities = stmt
        .query_map(rusqlite::params![limit], |row| {
            Ok(RecentActivity {
                id: row.get(0)?,
                server_id: row.get(1)?,
                server_name: row.get(2)?,
                activity_type: row.get(3)?,
                message: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?
        .filter_map(|r| {
            r.map_err(|e| eprintln!("DB row error: {}", e)).ok()
        })
        .collect();

    Ok(activities)
}

pub fn get_server_activity(
    conn: &Connection,
    server_id: &str,
    limit: i64,
) -> Result<Vec<RecentActivity>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT ae.id, ae.server_id, s.name as server_name, ae.activity_type, ae.message, ae.created_at
         FROM activity_events ae
         JOIN servers s ON ae.server_id = s.id
         WHERE ae.server_id = ?1
         ORDER BY ae.created_at DESC
         LIMIT ?2",
    )?;

    let activities = stmt
        .query_map(rusqlite::params![server_id, limit], |row| {
            Ok(RecentActivity {
                id: row.get(0)?,
                server_id: row.get(1)?,
                server_name: row.get(2)?,
                activity_type: row.get(3)?,
                message: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?
        .filter_map(|r| {
            r.map_err(|e| eprintln!("DB row error: {}", e)).ok()
        })
        .collect();

    Ok(activities)
}

pub fn insert_activity_event(
    conn: &Connection,
    server_id: &str,
    activity_type: &str,
    message: &str,
) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO activity_events (server_id, activity_type, message)
         VALUES (?1, ?2, ?3)",
        rusqlite::params![server_id, activity_type, message],
    )?;
    Ok(())
}

pub fn get_all_server_stats(conn: &Connection) -> Result<Vec<ServerStats>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT server_id, hostname, os_name, os_version, kernel_version, uptime,
                cpu_usage, memory_total, memory_used, memory_usage,
                disk_total, disk_used, disk_usage, load_average,
                network_in, network_out, updated_at
         FROM server_stats ORDER BY server_id",
    )?;

    let stats = stmt
        .query_map([], |row| {
            Ok(ServerStats {
                server_id: row.get(0)?,
                hostname: row.get(1)?,
                os_name: row.get(2)?,
                os_version: row.get(3)?,
                kernel_version: row.get(4)?,
                uptime: row.get(5)?,
                cpu_usage: row.get(6)?,
                memory_total: row.get(7)?,
                memory_used: row.get(8)?,
                memory_usage: row.get(9)?,
                disk_total: row.get(10)?,
                disk_used: row.get(11)?,
                disk_usage: row.get(12)?,
                load_average: row.get(13)?,
                network_in: row.get(14)?,
                network_out: row.get(15)?,
                updated_at: row.get(16)?,
            })
        })?
        .filter_map(|r| {
            r.map_err(|e| eprintln!("DB row error: {}", e)).ok()
        })
        .collect();

    Ok(stats)
}
