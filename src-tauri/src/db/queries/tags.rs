use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
    pub created_at: String,
}

pub fn create_tag(conn: &Connection, name: &str, color: Option<&str>) -> Result<Tag, rusqlite::Error> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO tags (id, name, color) VALUES (?1, ?2, ?3)",
        rusqlite::params![id, name, color],
    )?;
    Ok(Tag {
        id,
        name: name.to_string(),
        color: color.map(|s| s.to_string()),
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

pub fn get_all_tags(conn: &Connection) -> Result<Vec<Tag>, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT id, name, color, created_at FROM tags ORDER BY name")?;
    let tags = stmt
        .query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();
    Ok(tags)
}

pub fn delete_tag(conn: &Connection, id: &str) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM server_tags WHERE tag_id = ?1", rusqlite::params![id])?;
    conn.execute("DELETE FROM tags WHERE id = ?1", rusqlite::params![id])?;
    Ok(())
}

pub fn add_tag_to_server(conn: &Connection, server_id: &str, tag_id: &str) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT OR IGNORE INTO server_tags (server_id, tag_id) VALUES (?1, ?2)",
        rusqlite::params![server_id, tag_id],
    )?;
    Ok(())
}

pub fn remove_tag_from_server(conn: &Connection, server_id: &str, tag_id: &str) -> Result<(), rusqlite::Error> {
    conn.execute(
        "DELETE FROM server_tags WHERE server_id = ?1 AND tag_id = ?2",
        rusqlite::params![server_id, tag_id],
    )?;
    Ok(())
}

pub fn get_tags_for_server(conn: &Connection, server_id: &str) -> Result<Vec<Tag>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT t.id, t.name, t.color, t.created_at
         FROM tags t
         INNER JOIN server_tags st ON t.id = st.tag_id
         WHERE st.server_id = ?1
         ORDER BY t.name",
    )?;
    let tags = stmt
        .query_map(rusqlite::params![server_id], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();
    Ok(tags)
}

pub fn get_servers_for_tag(conn: &Connection, tag_id: &str) -> Result<Vec<String>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT server_id FROM server_tags WHERE tag_id = ?1",
    )?;
    let server_ids = stmt
        .query_map(rusqlite::params![tag_id], |row| row.get(0))?
        .filter_map(|r| r.ok())
        .collect();
    Ok(server_ids)
}
