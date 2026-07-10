use crate::db::queries::servers::get_server_by_id;
use crate::db::DbState;
use serde::{Deserialize, Serialize};
use tauri::State;

pub use crate::ssh::sftp::FileInfo;

#[derive(Debug, Deserialize)]
pub struct ListDirectoryInput {
    pub server_id: String,
    pub path: String,
}

#[derive(Debug, Deserialize)]
pub struct FileOperationInput {
    pub server_id: String,
    pub source_path: String,
    pub dest_path: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct WriteFileInput {
    pub server_id: String,
    pub path: String,
    pub content: String,
}

fn with_sftp<F, T>(state: &DbState, server_id: &str, f: F) -> Result<T, String>
where
    F: FnOnce(&crate::ssh::sftp::SftpClient) -> Result<T, String>,
{
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let server = get_server_by_id(&conn, server_id).map_err(|e| e.to_string())?;
    let ssh_conn = crate::ssh::connection::SshConnection::new(&server.host, server.port)
        .map_err(|e| e.to_string())?;
    let sftp = crate::ssh::sftp::SftpClient::new(&ssh_conn).map_err(|e| e.to_string())?;
    f(&sftp)
}

#[tauri::command]
pub fn list_directory(
    state: State<'_, DbState>,
    input: ListDirectoryInput,
) -> Result<Vec<FileInfo>, String> {
    with_sftp(&state, &input.server_id, |sftp| {
        sftp.list_directory(&input.path).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn read_file(
    state: State<'_, DbState>,
    input: FileOperationInput,
) -> Result<String, String> {
    with_sftp(&state, &input.server_id, |sftp| {
        sftp.read_file(&input.source_path).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn write_file(
    state: State<'_, DbState>,
    input: WriteFileInput,
) -> Result<(), String> {
    with_sftp(&state, &input.server_id, |sftp| {
        sftp.write_file(&input.path, &input.content)
            .map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn delete_file(
    state: State<'_, DbState>,
    input: FileOperationInput,
) -> Result<(), String> {
    with_sftp(&state, &input.server_id, |sftp| {
        sftp.delete_file(&input.source_path)
            .map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn rename_file(
    state: State<'_, DbState>,
    input: FileOperationInput,
) -> Result<(), String> {
    let dest = input.dest_path.ok_or("Destination path required")?;
    with_sftp(&state, &input.server_id, |sftp| {
        sftp.rename(&input.source_path, &dest)
            .map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn create_directory(
    state: State<'_, DbState>,
    input: FileOperationInput,
) -> Result<(), String> {
    with_sftp(&state, &input.server_id, |sftp| {
        sftp.create_directory(&input.source_path)
            .map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn download_file(
    state: State<'_, DbState>,
    input: FileOperationInput,
) -> Result<Vec<u8>, String> {
    with_sftp(&state, &input.server_id, |sftp| {
        let content = sftp.read_file(&input.source_path).map_err(|e| e.to_string())?;
        Ok(content.into_bytes())
    })
}

#[tauri::command]
pub fn upload_file(
    state: State<'_, DbState>,
    input: WriteFileInput,
) -> Result<(), String> {
    with_sftp(&state, &input.server_id, |sftp| {
        sftp.write_file(&input.path, &input.content)
            .map_err(|e| e.to_string())
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileBookmark {
    pub id: i64,
    pub server_id: String,
    pub path: String,
    pub name: String,
    pub created_at: String,
}

#[tauri::command]
pub fn get_file_bookmarks(
    state: State<'_, DbState>,
    server_id: String,
) -> Result<Vec<FileBookmark>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, server_id, path, name, created_at FROM file_bookmarks WHERE server_id = ?1 ORDER BY name",
        )
        .map_err(|e| e.to_string())?;

    let bookmarks = stmt
        .query_map(rusqlite::params![server_id], |row| {
            Ok(FileBookmark {
                id: row.get(0)?,
                server_id: row.get(1)?,
                path: row.get(2)?,
                name: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(bookmarks)
}

#[derive(Debug, Deserialize)]
pub struct AddBookmarkInput {
    pub server_id: String,
    pub path: String,
    pub name: String,
}

#[tauri::command]
pub fn add_file_bookmark(
    state: State<'_, DbState>,
    input: AddBookmarkInput,
) -> Result<FileBookmark, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO file_bookmarks (server_id, path, name) VALUES (?1, ?2, ?3)",
        rusqlite::params![input.server_id, input.path, input.name],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    Ok(FileBookmark {
        id,
        server_id: input.server_id,
        path: input.path,
        name: input.name,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub fn remove_file_bookmark(
    state: State<'_, DbState>,
    id: i64,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM file_bookmarks WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
