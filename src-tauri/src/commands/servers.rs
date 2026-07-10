use crate::db::DbState;
use crate::db::crypto;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;
use zeroize::Zeroize;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Server {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth_type: String,
    pub password: Option<String>,
    pub private_key: Option<String>,
    pub passphrase: Option<String>,
    pub group_name: Option<String>,
    pub status: String,
    pub last_connected_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct AddServerInput {
    pub name: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth_type: String,
    pub password: Option<String>,
    pub private_key: Option<String>,
    pub passphrase: Option<String>,
    pub group_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateServerInput {
    pub id: String,
    pub name: Option<String>,
    pub host: Option<String>,
    pub port: Option<u16>,
    pub username: Option<String>,
    pub auth_type: Option<String>,
    pub password: Option<String>,
    pub private_key: Option<String>,
    pub passphrase: Option<String>,
    pub group_name: Option<String>,
}

pub fn row_to_server(row: &rusqlite::Row) -> rusqlite::Result<Server> {
    Ok(Server {
        id: row.get(0)?,
        name: row.get(1)?,
        host: row.get(2)?,
        port: row.get(3)?,
        username: row.get(4)?,
        auth_type: row.get(5)?,
        password: row.get(6)?,
        private_key: row.get(7)?,
        passphrase: row.get(8)?,
        group_name: row.get(9)?,
        status: row.get(10)?,
        last_connected_at: row.get(11)?,
        created_at: row.get(12)?,
        updated_at: row.get(13)?,
    })
}

pub const SERVER_COLUMNS: &str = "id, name, host, port, username, auth_type, password_encrypted, private_key_encrypted, passphrase_encrypted, group_name, status, last_connected_at, created_at, updated_at";

fn encrypt_opt(val: &Option<String>) -> Result<Option<String>, String> {
    match val {
        Some(v) if !v.is_empty() => {
            let mut key = get_encryption_key()?;
            let encrypted = crypto::encrypt(v.as_bytes(), &key).map_err(|e| e.to_string())?;
            key.zeroize();
            Ok(Some(hex::encode(&encrypted)))
        }
        _ => Ok(None),
    }
}

fn decrypt_opt(val: &Option<String>) -> Result<Option<String>, String> {
    match val {
        Some(v) if !v.is_empty() => {
            let mut key = get_encryption_key()?;
            let bytes = hex::decode(v).map_err(|e| e.to_string())?;
            let decrypted = crypto::decrypt(&bytes, &key).map_err(|e| e.to_string())?;
            key.zeroize();
            Ok(Some(String::from_utf8(decrypted).map_err(|e| e.to_string())?))
        }
        _ => Ok(None),
    }
}

fn get_encryption_key() -> Result<[u8; 32], String> {
    crate::db::keychain::get_or_create_key().map_err(|e| format!("Encryption key error: {}", e))
}

#[tauri::command]
pub fn add_server(
    state: State<'_, DbState>,
    input: AddServerInput,
) -> Result<Server, String> {
    let id = Uuid::new_v4().to_string();
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let enc_password = encrypt_opt(&input.password)?;
    let enc_key = encrypt_opt(&input.private_key)?;
    let enc_passphrase = encrypt_opt(&input.passphrase)?;

    conn.execute(
        "INSERT INTO servers (id, name, host, port, username, auth_type, password_encrypted, private_key_encrypted, passphrase_encrypted, group_name, status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'unknown')",
        rusqlite::params![
            id,
            input.name,
            input.host,
            input.port,
            input.username,
            input.auth_type,
            enc_password,
            enc_key,
            enc_passphrase,
            input.group_name,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(Server {
        id,
        name: input.name,
        host: input.host,
        port: input.port,
        username: input.username,
        auth_type: input.auth_type,
        password: None,
        private_key: None,
        passphrase: None,
        group_name: input.group_name,
        status: "unknown".to_string(),
        last_connected_at: None,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub fn update_server(
    state: State<'_, DbState>,
    input: UpdateServerInput,
) -> Result<Server, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let existing: Server = conn
        .query_row(
            &format!("SELECT {} FROM servers WHERE id = ?1", SERVER_COLUMNS),
            rusqlite::params![input.id],
            row_to_server,
        )
        .map_err(|e| e.to_string())?;

    let name = input.name.unwrap_or(existing.name);
    let host = input.host.unwrap_or(existing.host);
    let port = input.port.unwrap_or(existing.port);
    let username = input.username.unwrap_or(existing.username);
    let auth_type = input.auth_type.unwrap_or(existing.auth_type);
    let group_name = input.group_name.or(existing.group_name);

    let enc_password = encrypt_opt(&input.password.or(existing.password))?;
    let enc_key = encrypt_opt(&input.private_key.or(existing.private_key))?;
    let enc_passphrase = encrypt_opt(&input.passphrase.or(existing.passphrase))?;

    conn.execute(
        "UPDATE servers SET name = ?1, host = ?2, port = ?3, username = ?4, auth_type = ?5,
         password_encrypted = ?6, private_key_encrypted = ?7, passphrase_encrypted = ?8,
         group_name = ?9, updated_at = datetime('now')
         WHERE id = ?10",
        rusqlite::params![name, host, port, username, auth_type, enc_password, enc_key, enc_passphrase, group_name, input.id],
    )
    .map_err(|e| e.to_string())?;

    Ok(Server {
        id: input.id,
        name,
        host,
        port,
        username,
        auth_type,
        password: None,
        private_key: None,
        passphrase: None,
        group_name,
        status: existing.status,
        last_connected_at: existing.last_connected_at,
        created_at: existing.created_at,
        updated_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub fn delete_server(state: State<'_, DbState>, id: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM servers WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_servers(state: State<'_, DbState>) -> Result<Vec<Server>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(&format!("SELECT {} FROM servers ORDER BY name", SERVER_COLUMNS))
        .map_err(|e| e.to_string())?;

    let servers = stmt
        .query_map([], row_to_server)
        .map_err(|e| e.to_string())?
        .filter_map(|r| {
            r.map_err(|e| eprintln!("DB row error: {}", e)).ok()
        })
        .collect();

    Ok(servers)
}

#[tauri::command]
pub fn search_servers(
    state: State<'_, DbState>,
    query: String,
) -> Result<Vec<Server>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let search_pattern = format!("%{}%", query);
    let mut stmt = conn
        .prepare(&format!(
            "SELECT {} FROM servers WHERE name LIKE ?1 OR host LIKE ?1 OR username LIKE ?1 OR group_name LIKE ?1 ORDER BY name",
            SERVER_COLUMNS
        ))
        .map_err(|e| e.to_string())?;

    let servers = stmt
        .query_map(rusqlite::params![search_pattern], row_to_server)
        .map_err(|e| e.to_string())?
        .filter_map(|r| {
            r.map_err(|e| eprintln!("DB row error: {}", e)).ok()
        })
        .collect();

    Ok(servers)
}

#[tauri::command]
pub fn test_server_connection(
    state: State<'_, DbState>,
    id: String,
) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let server: Server = conn
        .query_row(
            &format!("SELECT {} FROM servers WHERE id = ?1", SERVER_COLUMNS),
            rusqlite::params![id],
            row_to_server,
        )
        .map_err(|e| e.to_string())?;

    drop(conn);

    let addr = format!("{}:{}", server.host, server.port);
    let tcp = std::net::TcpStream::connect(&addr).map_err(|e| e.to_string())?;
    let mut sess = ssh2::Session::new().map_err(|e| e.to_string())?;
    sess.set_tcp_stream(tcp);
    sess.handshake().map_err(|e| e.to_string())?;

    let kh_path = {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| std::path::PathBuf::from("."));
        path.push("vps-studio");
        std::fs::create_dir_all(&path).ok();
        path.push("known_hosts");
        path
    };
    let mut known_hosts = sess.known_hosts();
    if kh_path.exists() {
        known_hosts.read_file(&kh_path).ok();
    }

    let success = match server.auth_type.as_str() {
        "password" => {
            let pw = server.password.as_deref().unwrap_or("");
            sess.userauth_password(&server.username, pw).is_ok()
        }
        "key" | "key_with_passphrase" => {
            let key_path = server.private_key.as_deref().unwrap_or("");
            let pass = server.passphrase.as_deref().filter(|p| !p.is_empty());
            sess.userauth_pubkey_file(&server.username, None, std::path::Path::new(key_path), pass).is_ok()
        }
        _ => false,
    };

    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let new_status = if success { "online" } else { "offline" };
    conn.execute(
        "UPDATE servers SET status = ?1, last_connected_at = datetime('now'), updated_at = datetime('now') WHERE id = ?2",
        rusqlite::params![new_status, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(success)
}

#[tauri::command]
pub fn get_server(state: State<'_, DbState>, id: String) -> Result<Server, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        &format!("SELECT {} FROM servers WHERE id = ?1", SERVER_COLUMNS),
        rusqlite::params![id],
        row_to_server,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_server_status(
    state: State<'_, DbState>,
    id: String,
) -> Result<String, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT status FROM servers WHERE id = ?1",
        rusqlite::params![id],
        |row| row.get(0),
    )
    .map_err(|e| e.to_string())
}
