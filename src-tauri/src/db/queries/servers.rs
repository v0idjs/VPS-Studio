use crate::commands::servers::{Server, row_to_server, SERVER_COLUMNS};
use rusqlite::Connection;

pub fn get_all_servers(conn: &Connection) -> Result<Vec<Server>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        &format!("SELECT {} FROM servers ORDER BY name", SERVER_COLUMNS),
    )?;

    let servers = stmt
        .query_map([], row_to_server)?
        .filter_map(|r| {
            r.map_err(|e| eprintln!("DB row error: {}", e)).ok()
        })
        .collect();

    Ok(servers)
}

pub fn get_server_by_id(conn: &Connection, id: &str) -> Result<Server, rusqlite::Error> {
    conn.query_row(
        &format!("SELECT {} FROM servers WHERE id = ?1", SERVER_COLUMNS),
        rusqlite::params![id],
        row_to_server,
    )
}
